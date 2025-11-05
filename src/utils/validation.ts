import { validate as uuidValidate } from 'uuid';

export class SecurityValidator {
  /**
   * Validates UUID format
   */
  static validateUUID(id: string): boolean {
    return uuidValidate(id);
  }

  /**
   * Sanitize search input
   */
  static sanitizeSearchInput(input: string): string {
    return input
      .replace(/[;'"\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .trim();
  }

  /**
   * Validate and sanitize category input
   */
  static sanitizeCategory(category: string): string {
    return category.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
  }

  /**
   * Validate sort field
   */
  static validateSortField(field: string): boolean {
    const allowedFields = ['name', 'price', 'createdAt', 'stockStatus', 'category'];
    return allowedFields.includes(field);
  }

  /**
   * Validate sort order
   */
  static validateSortOrder(order: string): boolean {
    return ['ASC', 'DESC'].includes(order.toUpperCase());
  }

  /**
   * Validate numeric input
   */
  static validateNumeric(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }

  /**
   * Validate slug format (lowercase alphanumeric with hyphens)
   */
  static validateSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  }
}
