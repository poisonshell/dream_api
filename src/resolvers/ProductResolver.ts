import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
  ID,
  FieldResolver,
  Root,
} from 'type-graphql';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { CreateProductInput, UpdateProductInput } from '../types/inputs/ProductInput';
import { ProductFiltersInput, PaginationInput } from '../types/inputs/PaginationInput';
import { PaginatedProductsResponse } from '../types/responses/PaginatedProductsResponse';
import { CategoryBasicResponse } from '../types/responses/CategoryBasicResponse';
import { MyContext } from '../types/context';
import { isAdmin } from '../middleware/isAdmin';
import { ILike, MoreThanOrEqual, LessThanOrEqual, MoreThan, Between } from 'typeorm';
import { SecurityValidator } from '../utils/validation';
import { AdminUser } from '../entities/AdminUser';
import { GraphQLError } from 'graphql';

@Resolver(Product)
export class ProductResolver {
  // Public: Get all products

  @Query(() => PaginatedProductsResponse)
  async products(
    @Arg('pagination', () => PaginationInput, { nullable: true })
    pagination?: PaginationInput,
    @Arg('filters', () => ProductFiltersInput, { nullable: true })
    filters?: ProductFiltersInput,
  ): Promise<PaginatedProductsResponse> {
    const page = pagination?.page || 1;
    const limit = Math.min(pagination?.limit || 10, 100);
    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder || 'DESC';

    // Validate sort field
    if (!SecurityValidator.validateSortField(sortBy)) {
      throw new Error('Invalid sort field');
    }

    // Validate sort order
    if (!SecurityValidator.validateSortOrder(sortOrder)) {
      throw new Error('Invalid sort order');
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    const relations: string[] = [];

    // Handle category filter - now uses relationship
    if (filters?.category) {
      // Category filter can be either slug or id
      const sanitizedCategory = SecurityValidator.sanitizeCategory(filters.category);
      if (sanitizedCategory) {
        // Check if it's a UUID (category ID) or slug
        if (SecurityValidator.validateUUID(sanitizedCategory)) {
          where.categoryId = sanitizedCategory;
        } else {
          // Filter by category slug - need to join with category table
          relations.push('category');
          where.category = { slug: sanitizedCategory };
        }
      }
    }

    if (filters?.search) {
      // Sanitize search input
      const sanitizedSearch = SecurityValidator.sanitizeSearchInput(filters.search);
      if (sanitizedSearch) {
        where.name = ILike(`%${sanitizedSearch}%`);
      }
    }

    // Validate numeric inputs
    if (filters?.minPrice !== undefined) {
      if (!SecurityValidator.validateNumeric(filters.minPrice)) {
        throw new Error('Invalid minPrice value');
      }
    }

    if (filters?.maxPrice !== undefined) {
      if (!SecurityValidator.validateNumeric(filters.maxPrice)) {
        throw new Error('Invalid maxPrice value');
      }
    }

    // Apply price range filter
    if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
      where.price = Between(filters.minPrice, filters.maxPrice);
    } else if (filters?.minPrice !== undefined) {
      where.price = MoreThanOrEqual(filters.minPrice);
    } else if (filters?.maxPrice !== undefined) {
      where.price = LessThanOrEqual(filters.maxPrice);
    }

    if (filters?.inStock !== undefined) {
      if (filters.inStock) {
        where.stockStatus = MoreThan(0);
      }
    }

    // Get products and total count
    const [items, total] = await Product.findAndCount({
      where,
      relations: relations.length > 0 ? relations : undefined,
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  // Public: Get single product by ID

  @Query(() => Product, { nullable: true })
  async product(@Arg('id', () => ID) id: string): Promise<Product | null> {
    if (!SecurityValidator.validateUUID(id)) {
      throw new Error('Invalid product ID format');
    }

    const product = await Product.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  // Protected: Add new product
  @Mutation(() => Product)
  @UseMiddleware(isAdmin)
  async addProduct(
    @Arg('input', () => CreateProductInput) input: CreateProductInput,
    @Ctx() context: MyContext,
  ): Promise<Product> {
    if (!context.userId) {
      throw new Error('Not authenticated');
    }

    // Validate that category exists
    const category = await Category.findOne({ where: { id: input.categoryId } });
    if (!category) {
      throw new GraphQLError('Category not found', {
        extensions: { code: 'CATEGORY_NOT_FOUND' },
      });
    }

    const product = Product.create({
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      image: input.image,
      stockStatus: input.stockStatus,
      createdById: context.userId,
    });

    await product.save();

    return product;
  }

  // Protected: Update product
  @Mutation(() => Product, { nullable: true })
  @UseMiddleware(isAdmin)
  async updateProduct(
    @Arg('id', () => ID) id: string,
    @Arg('input', () => UpdateProductInput) input: UpdateProductInput,
  ): Promise<Product | null> {
    if (!SecurityValidator.validateUUID(id)) {
      throw new Error('Invalid product ID format');
    }

    const product = await Product.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    // Validate category if provided
    if (input.categoryId !== undefined) {
      const category = await Category.findOne({ where: { id: input.categoryId } });
      if (!category) {
        throw new GraphQLError('Category not found', {
          extensions: { code: 'CATEGORY_NOT_FOUND' },
        });
      }
      product.categoryId = input.categoryId;
    }

    if (input.name !== undefined) product.name = input.name;
    if (input.description !== undefined) product.description = input.description;
    if (input.price !== undefined) product.price = input.price;
    if (input.image !== undefined) product.image = input.image;
    if (input.stockStatus !== undefined) product.stockStatus = input.stockStatus;

    await product.save();

    return product;
  }

  // Protected: Delete product
  @Mutation(() => Boolean)
  @UseMiddleware(isAdmin)
  async deleteProduct(@Arg('id', () => ID) id: string): Promise<boolean> {
    if (!SecurityValidator.validateUUID(id)) {
      throw new Error('Invalid product ID format');
    }

    const product = await Product.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    await product.remove();
    return true;
  }

  @FieldResolver(() => CategoryBasicResponse, { nullable: true })
  async category(@Root() product: Product, @Ctx() ctx: MyContext): Promise<CategoryBasicResponse | null> {
    if (!product.categoryId) return null;
    
    const category = await ctx.loaders?.categoryById.load(product.categoryId);
    if (!category) return null;

    // Map to CategoryBasicResponse to avoid circular reference
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
