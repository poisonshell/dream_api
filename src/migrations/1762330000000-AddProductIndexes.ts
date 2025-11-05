import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductIndexes1762330000000 implements MigrationInterface {
  name = 'AddProductIndexes1762330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pg_trgm extension for trigram index if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    // B-tree indexes for common filters/sorts
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_createdAt" ON "products" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_category" ON "products" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_price" ON "products" ("price")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_stockStatus" ON "products" ("stockStatus")`,
    );

    // Trigram index for case-insensitive name search
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_products_name_trgm" ON "products" USING gin (lower(name) gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_name_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_stockStatus"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_price"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_category"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_createdAt"`);
    // Do not drop pg_trgm extension in down migration to avoid affecting other objects
  }
}
