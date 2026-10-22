import { useHomeService } from '../utils/home';

export default defineEventHandler(async (event) => {
  const home = await useHomeService().getPublicHome();
  const avatar = home.homeProfile.avatar?.url || '/favicon.ico';
  return sendRedirect(event, avatar, 302);
});
