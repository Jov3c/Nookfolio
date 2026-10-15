<script setup lang="ts">
import { toast } from 'vue-sonner';

const props = defineProps<{ message: string }>();

watch(
  () => props.message,
  (message) => {
    if (message) toast.success(message, { duration: 2500 });
  },
  { immediate: true },
);
</script>

<template>
  <span v-if="message" class="sr-only" role="status">{{ message }}</span>
</template>
