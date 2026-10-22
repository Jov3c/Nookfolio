<script setup lang="ts">
interface UploadedMedia {
  id: string;
  originalName: string;
  publicUrl: string;
  altText: string | null;
}

const props = withDefaults(
  defineProps<{
    label: string;
    currentUrl?: string | null;
    fallbackText?: string;
    category: 'avatars' | 'icons' | 'blog' | 'projects' | 'timeline' | 'links' | 'general';
    altText: string;
    crop?: 'none' | 'square';
    disabled?: boolean;
    removable?: boolean;
    compact?: boolean;
  }>(),
  {
    currentUrl: null,
    fallbackText: '图片',
    crop: 'none',
    disabled: false,
    removable: true,
    compact: false,
  },
);

const emit = defineEmits<{
  uploaded: [media: UploadedMedia];
  removed: [];
  error: [message: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const cropImage = ref<HTMLImageElement | null>(null);
const sourceFile = ref<File | null>(null);
const sourceUrl = ref('');
const previewUrl = ref('');
const zoom = ref(1);
const positionX = ref(50);
const positionY = ref(50);
const isCropping = ref(false);
const isUploading = ref(false);
const dragStart = reactive({ x: 0, y: 0, positionX: 50, positionY: 50 });

const displayedUrl = computed(() => previewUrl.value || props.currentUrl || '');
const cropImageStyle = computed(() => ({
  transform: `scale(${zoom.value}) translate(${(50 - positionX.value) / zoom.value}%, ${(50 - positionY.value) / zoom.value}%)`,
}));

function openPicker() {
  if (!props.disabled && !isUploading.value) fileInput.value?.click();
}

async function chooseFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  if (props.crop === 'square') {
    releaseSourceUrl();
    sourceFile.value = file;
    sourceUrl.value = URL.createObjectURL(file);
    zoom.value = 1;
    positionX.value = 50;
    positionY.value = 50;
    isCropping.value = true;
    return;
  }

  await upload(file);
}

function startDrag(event: PointerEvent) {
  if (!isCropping.value) return;
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
  dragStart.x = event.clientX;
  dragStart.y = event.clientY;
  dragStart.positionX = positionX.value;
  dragStart.positionY = positionY.value;
}

function drag(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  if (!target.hasPointerCapture(event.pointerId)) return;
  const sensitivity = 0.32 / zoom.value;
  positionX.value = clamp(
    dragStart.positionX - (event.clientX - dragStart.x) * sensitivity,
    0,
    100,
  );
  positionY.value = clamp(
    dragStart.positionY - (event.clientY - dragStart.y) * sensitivity,
    0,
    100,
  );
}

function stopDrag(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
}

async function confirmCrop() {
  const image = cropImage.value;
  const file = sourceFile.value;
  if (!image || !file) return;

  try {
    const cropped = await createSquareCrop(image, file.name);
    previewUrl.value = URL.createObjectURL(cropped);
    isCropping.value = false;
    await upload(cropped);
  } catch {
    emit('error', '头像裁剪失败，请重新选择图片。');
  } finally {
    releaseSourceUrl();
  }
}

function cancelCrop() {
  isCropping.value = false;
  sourceFile.value = null;
  releaseSourceUrl();
}

async function createSquareCrop(image: HTMLImageElement, originalName: string) {
  const outputSize = 800;
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom.value;
  const maxX = image.naturalWidth - sourceSize;
  const maxY = image.naturalHeight - sourceSize;
  const sourceX = maxX * (positionX.value / 100);
  const sourceY = maxY * (positionY.value / 100);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('CANVAS_UNAVAILABLE');
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('CROP_FAILED'))),
      'image/webp',
      0.9,
    );
  });
  return new File([blob], `${originalName.replace(/\.[^.]+$/, '')}-cropped.webp`, {
    type: 'image/webp',
  });
}

async function upload(file: File) {
  isUploading.value = true;
  try {
    const body = new FormData();
    body.append('file', file);
    body.append('category', props.category);
    body.append('altText', props.altText);
    const result = await $fetch<{ data: UploadedMedia }>('/api/v1/admin/media/upload', {
      method: 'POST',
      body,
    });
    previewUrl.value = result.data.publicUrl;
    emit('uploaded', result.data);
  } catch (error) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    emit('error', fetchError.data?.error?.message || '图片上传失败，请检查格式和大小。');
  } finally {
    isUploading.value = false;
  }
}

function removeImage() {
  previewUrl.value = '';
  emit('removed');
}

function releaseSourceUrl() {
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value);
  sourceUrl.value = '';
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

onBeforeUnmount(() => {
  releaseSourceUrl();
  if (previewUrl.value.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value);
});
</script>

<template>
  <div class="direct-image-upload" :class="{ 'direct-image-upload--compact': compact }">
    <span class="direct-image-upload__label">{{ label }}</span>
    <div class="direct-image-upload__card">
      <button
        class="direct-image-upload__preview"
        type="button"
        :disabled="disabled || isUploading"
        :aria-label="displayedUrl ? `更换${label}` : `上传${label}`"
        @click="openPicker"
      >
        <img v-if="displayedUrl" :src="displayedUrl" :alt="altText" />
        <span v-else>{{ fallbackText.slice(0, 2) }}</span>
        <small>{{ isUploading ? '正在上传…' : displayedUrl ? '点击更换' : '点击上传' }}</small>
      </button>
      <div class="direct-image-upload__content">
        <strong>{{ displayedUrl ? `当前${label}` : `尚未上传${label}` }}</strong>
        <p>
          {{
            crop === 'square'
              ? '上传后可调整大小和位置，默认居中。'
              : '从电脑选择图片，上传后直接绑定。'
          }}
        </p>
        <div class="direct-image-upload__actions">
          <button
            type="button"
            class="admin-secondary-button"
            :disabled="disabled || isUploading"
            @click="openPicker"
          >
            {{ displayedUrl ? '更换图片' : '上传图片' }}
          </button>
          <button
            v-if="removable && displayedUrl"
            type="button"
            class="admin-danger-button"
            :disabled="disabled || isUploading"
            @click="removeImage"
          >
            移除图片
          </button>
        </div>
        <small>支持 JPEG、PNG、WebP 和 GIF，最大 10 MB。</small>
      </div>
    </div>
    <input
      ref="fileInput"
      class="direct-image-upload__input"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      @change="chooseFile"
    />

    <Teleport to="body">
      <div
        v-if="isCropping"
        class="image-crop-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="调整头像"
      >
        <div class="image-crop-dialog__panel">
          <header>
            <div>
              <p class="eyebrow">头像裁剪</p>
              <h2>调整头像尺寸</h2>
            </div>
            <button type="button" aria-label="关闭" @click="cancelCrop">×</button>
          </header>
          <p>默认居中。拖动图片调整位置，再使用滑块调整大小。</p>
          <div
            class="image-crop-stage"
            @pointerdown="startDrag"
            @pointermove="drag"
            @pointerup="stopDrag"
            @pointercancel="stopDrag"
          >
            <img
              ref="cropImage"
              :src="sourceUrl"
              alt="待裁剪头像"
              :style="cropImageStyle"
              draggable="false"
            />
            <span aria-hidden="true" />
          </div>
          <label class="image-crop-zoom">
            <span>调整大小</span>
            <input v-model.number="zoom" type="range" min="1" max="3" step="0.01" />
            <output>{{ Math.round(zoom * 100) }}%</output>
          </label>
          <footer>
            <button type="button" class="admin-secondary-button" @click="cancelCrop">取消</button>
            <button type="button" class="button" @click="confirmCrop">确认并上传</button>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.direct-image-upload {
  display: grid;
  gap: 8px;
}
.direct-image-upload__label {
  font-size: 0.82rem;
  font-weight: 700;
}
.direct-image-upload__card {
  display: grid;
  grid-template-columns: 116px 1fr;
  gap: 18px;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  background: var(--color-bg);
}
.direct-image-upload__preview {
  position: relative;
  width: 116px;
  height: 116px;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 18px;
  background: var(--color-panel);
  color: var(--color-muted);
}
.direct-image-upload__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.direct-image-upload__preview > span {
  font-size: 1.4rem;
  font-weight: 750;
}
.direct-image-upload__preview small {
  position: absolute;
  right: 8px;
  bottom: 8px;
  left: 8px;
  padding: 5px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-text) 78%, transparent);
  color: var(--color-bg);
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 180ms ease-out,
    transform 180ms ease-out;
}
.direct-image-upload__preview:hover small,
.direct-image-upload__preview:focus-visible small {
  opacity: 1;
  transform: none;
}
.direct-image-upload__content p {
  margin: 4px 0 12px;
  color: var(--color-muted);
}
.direct-image-upload__content > small {
  display: block;
  margin-top: 10px;
  color: var(--color-muted);
}
.direct-image-upload__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.direct-image-upload__input {
  display: none;
}
.direct-image-upload--compact {
  gap: 5px;
}
.direct-image-upload--compact .direct-image-upload__label {
  font-size: 0.66rem;
}
.direct-image-upload--compact .direct-image-upload__card {
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 8px;
  padding: 7px;
  border-radius: 9px;
}
.direct-image-upload--compact .direct-image-upload__preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}
.direct-image-upload--compact .direct-image-upload__preview > span {
  font-size: 0.85rem;
}
.direct-image-upload--compact .direct-image-upload__preview small,
.direct-image-upload--compact .direct-image-upload__content p,
.direct-image-upload--compact .direct-image-upload__content > small {
  display: none;
}
.direct-image-upload--compact .direct-image-upload__content strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.68rem;
  line-height: 1.3;
}
.direct-image-upload--compact .direct-image-upload__actions {
  gap: 4px;
}
.direct-image-upload--compact .direct-image-upload__actions button {
  min-height: 27px;
  padding: 4px 7px;
  font-size: 0.62rem;
}
.image-crop-dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: color-mix(in srgb, #111 58%, transparent);
  backdrop-filter: blur(8px);
}
.image-crop-dialog__panel {
  width: min(520px, 100%);
  padding: 22px;
  border: 1px solid var(--color-line);
  border-radius: 22px;
  background: var(--color-panel);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
}
.image-crop-dialog__panel header {
  display: flex;
  align-items: start;
  justify-content: space-between;
}
.image-crop-dialog__panel h2 {
  margin: 0;
}
.image-crop-dialog__panel header button {
  border: 0;
  background: transparent;
  color: var(--color-muted);
  font-size: 1.6rem;
}
.image-crop-dialog__panel > p {
  color: var(--color-muted);
}
.image-crop-stage {
  position: relative;
  width: min(340px, 76vw);
  aspect-ratio: 1;
  margin: 20px auto;
  overflow: hidden;
  border-radius: 28px;
  background: var(--color-bg);
  cursor: grab;
  touch-action: none;
  user-select: none;
}
.image-crop-stage:active {
  cursor: grabbing;
}
.image-crop-stage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transform-origin: center;
}
.image-crop-stage span {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: inherit;
  box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}
.image-crop-zoom {
  display: grid;
  grid-template-columns: auto 1fr 48px;
  gap: 12px;
  align-items: center;
}
.image-crop-zoom input {
  accent-color: var(--color-accent);
}
.image-crop-dialog__panel footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
@media (max-width: 640px) {
  .direct-image-upload__card {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .direct-image-upload__preview small {
    transition: none;
  }
}
</style>
