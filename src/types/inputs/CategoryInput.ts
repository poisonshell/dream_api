import { InputType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field(() => String)
  @IsNotEmpty({ message: 'Category name is required' })
  @Length(2, 100, { message: 'Category name must be between 2 and 100 characters' })
  name!: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Slug is required' })
  @Length(2, 100, { message: 'Slug must be between 2 and 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens only',
  })
  slug!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @Length(2, 100, { message: 'Category name must be between 2 and 100 characters' })
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Length(2, 100, { message: 'Slug must be between 2 and 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens only',
  })
  slug?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Length(0, 500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
