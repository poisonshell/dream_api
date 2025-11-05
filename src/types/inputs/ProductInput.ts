import { InputType, Field, Float, Int, ID } from 'type-graphql';
import { MinLength, Min, Max, MaxLength, IsUrl, IsOptional, IsUUID, IsString } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  @MinLength(1, { message: 'Product name is required' })
  @MaxLength(200, { message: 'Product name must be less than 200 characters' })
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description must not be empty if provided' })
  @MaxLength(2000, { message: 'Description must be less than 2000 characters' })
  description?: string;

  @Field(() => Float)
  @Min(0, { message: 'Price must be a positive number' })
  @Max(1000000, { message: 'Price must be less than 1,000,000' })
  price: number;

  @Field(() => ID)
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @MaxLength(500, { message: 'Image URL must be less than 500 characters' })
  image?: string;

  @Field(() => Int)
  @Min(0, { message: 'Stock status must be a non-negative number' })
  @Max(1000000, { message: 'Stock status must be less than 1,000,000' })
  stockStatus: number;
}

@InputType()
export class UpdateProductInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @MinLength(1, { message: 'Product name must not be empty' })
  @MaxLength(200, { message: 'Product name must be less than 200 characters' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(1, { message: 'Description must not be empty if provided' })
  @MaxLength(2000, { message: 'Description must be less than 2000 characters' })
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Price must be a positive number' })
  @Max(1000000, { message: 'Price must be less than 1,000,000' })
  price?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @MaxLength(500, { message: 'Image URL must be less than 500 characters' })
  image?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Min(0, { message: 'Stock status must be a non-negative number' })
  @Max(1000000, { message: 'Stock status must be less than 1,000,000' })
  stockStatus?: number;
}
