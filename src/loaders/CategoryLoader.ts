import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Category } from '../entities/Category';

export function createCategoryLoader() {
  return new DataLoader<string, Category | null>(
    async (ids: readonly string[]) => {
      const uniqueIds = Array.from(new Set(ids as readonly string[])) as string[];
      const categories = await Category.find({ where: { id: In(uniqueIds) } });
      const map = new Map(categories.map((c) => [c.id, c] as const));
      return ids.map((id: string) => map.get(id) ?? null);
    },
    { cache: true },
  );
}
