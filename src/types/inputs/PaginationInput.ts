import { InputType, Field, Int } from 'type-graphql';
import { IsOptional, Min, Max } from 'class-validator';

@InputType()
export class ProductFiltersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  category?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  search?: string; // Search in name

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0)
  maxPrice?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  inStock?: boolean; // stockStatus > 0
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit: number = 10;

  @Field(() => String, { nullable: true, defaultValue: 'createdAt' })
  @IsOptional()
  sortBy?: string; // name, price, createdAt, stockStatus

  @Field(() => String, { nullable: true, defaultValue: 'DESC' })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
