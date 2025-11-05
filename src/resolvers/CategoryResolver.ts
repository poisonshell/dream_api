import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware, ID } from 'type-graphql';
import { Category } from '../entities/Category';
import { CreateCategoryInput, UpdateCategoryInput } from '../types/inputs/CategoryInput';
import { isAuth } from '../middleware/isAuth';
import { isAdmin } from '../middleware/isAdmin';
import type { MyContext } from '../types/context';
import { GraphQLError } from 'graphql';
import { SecurityValidator } from '../utils/validation';

@Resolver(Category)
export class CategoryResolver {
  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    try {
      const categories = await Category.find({
        order: { name: 'ASC' },
      });

      return categories || [];
    } catch (error) {
      throw new GraphQLError('Failed to fetch categories', {
        extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error },
      });
    }
  }

  @Query(() => Category, { nullable: true })
  async category(
    @Arg('id', () => ID, { nullable: true }) id?: string,
    @Arg('slug', () => String, { nullable: true }) slug?: string,
  ): Promise<Category | null> {
    if (!id && !slug) {
      throw new GraphQLError('Either id or slug must be provided', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Validate UUID format if id is provided
    if (id && !SecurityValidator.validateUUID(id)) {
      throw new GraphQLError('Invalid category ID format', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    // Validate slug format if provided
    if (slug && !SecurityValidator.validateSlug(slug)) {
      throw new GraphQLError('Invalid slug format', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    try {
      if (id) {
        const category = await Category.findOne({ where: { id } });
        return category || null;
      }

      const category = await Category.findOne({ where: { slug } });
      return category || null;
    } catch (error) {
      throw new GraphQLError('Failed to fetch category', {
        extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error },
      });
    }
  }

  @Mutation(() => Category)
  @UseMiddleware(isAuth, isAdmin)
  async createCategory(
    @Arg('input', () => CreateCategoryInput) input: CreateCategoryInput,
    @Ctx() { adminUser }: MyContext,
  ): Promise<Category> {
    // Check if slug already exists
    const existingCategory = await Category.findOne({ where: { slug: input.slug } });
    if (existingCategory) {
      throw new GraphQLError('A category with this slug already exists', {
        extensions: { code: 'DUPLICATE_SLUG' },
      });
    }

    const category = Category.create({
      name: input.name,
      slug: input.slug,
      description: input.description,
    });

    await category.save();
    return category;
  }

  @Mutation(() => Category)
  @UseMiddleware(isAuth, isAdmin)
  async updateCategory(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateCategoryInput) input: UpdateCategoryInput,
    @Ctx() { adminUser }: MyContext,
  ): Promise<Category> {
    // Validate UUID format
    if (!SecurityValidator.validateUUID(id)) {
      throw new GraphQLError('Invalid category ID format', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const category = await Category.findOne({ where: { id } });

    if (!category) {
      throw new GraphQLError('Category not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check if slug already exists (excluding current category)
    if (input.slug && input.slug !== category.slug) {
      const existingCategory = await Category.findOne({ where: { slug: input.slug } });
      if (existingCategory) {
        throw new GraphQLError('A category with this slug already exists', {
          extensions: { code: 'DUPLICATE_SLUG' },
        });
      }
    }

    if (input.name !== undefined) category.name = input.name;
    if (input.slug !== undefined) category.slug = input.slug;
    if (input.description !== undefined) category.description = input.description;

    await category.save();
    return category;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth, isAdmin)
  async deleteCategory(
    @Arg('id', () => ID) id: string,
    @Ctx() { adminUser }: MyContext,
  ): Promise<boolean> {
    // Validate UUID format
    if (!SecurityValidator.validateUUID(id)) {
      throw new GraphQLError('Invalid category ID format', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const category = await Category.findOne({ where: { id }, relations: ['products'] });

    if (!category) {
      throw new GraphQLError('Category not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Check if category has products
    if (category.products && category.products.length > 0) {
      throw new GraphQLError(
        'Cannot delete category with existing products. Please reassign or delete products first.',
        {
          extensions: { code: 'CATEGORY_HAS_PRODUCTS' },
        },
      );
    }

    await category.remove();
    return true;
  }
}
