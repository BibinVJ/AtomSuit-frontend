import { ApiError } from '../types/Error';

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as ApiError).response === 'object' &&
    (error as ApiError).response !== null &&
    'data' in (error as ApiError).response! &&
    typeof (error as ApiError).response!.data === 'object'
  );
}
