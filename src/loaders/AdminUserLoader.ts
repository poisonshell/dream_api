import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { AdminUser } from '../entities/AdminUser';

export function createAdminUserLoader() {
  return new DataLoader<string, AdminUser | null>(
    async (ids: readonly string[]) => {
      const uniqueIds = Array.from(new Set(ids as readonly string[])) as string[];
      const users = await AdminUser.find({ where: { id: In(uniqueIds) } });
      const map = new Map(users.map((u) => [u.id, u] as const));
      return ids.map((id: string) => map.get(id) ?? null);
    },
    { cache: true },
  );
}
