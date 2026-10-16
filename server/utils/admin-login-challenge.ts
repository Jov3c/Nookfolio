import { AdminLoginChallengeRepository } from '../repositories/admin-login-challenge-repository';
import { AdminLoginChallengeService } from '../services/admin-login-challenge-service';
import { usePrisma } from './prisma';

export function useAdminLoginChallengeService() {
  return new AdminLoginChallengeService(new AdminLoginChallengeRepository(usePrisma()));
}
