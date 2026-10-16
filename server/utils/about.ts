import { AboutRepository } from '../repositories/about-repository';
import { AboutService } from '../services/about-service';
import { usePrisma } from './prisma';

export function useAboutService() {
  return new AboutService(new AboutRepository(usePrisma()));
}
