import { Category, CategoryInput } from '../types';
import { createBaseService, QueryParams, PaginatedResponse } from './BaseService';

const categoryService = createBaseService<Category, CategoryInput>('/categories');

export const getCategories = (params: QueryParams = {}): Promise<PaginatedResponse<Category>> =>
  categoryService.list(params);

export const getCategory = (id: number): Promise<Category> => categoryService.get(id);

export const addCategory = (data: CategoryInput) => categoryService.create(data);

export const updateCategory = (id: number, data: CategoryInput) => categoryService.update(id, data);

export const deleteCategory = (id: number, force: boolean = false) =>
  categoryService.delete(id, force);

export const restoreCategory = (id: number) => categoryService.restore(id);

export const exportCategories = () => categoryService.export('/categories/export');

const CategoryService = {
  ...categoryService,
};

export default CategoryService;
