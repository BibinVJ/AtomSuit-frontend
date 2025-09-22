export interface ApiError extends Error {
  response?: {
    data: {
      message?: string;
      error?: boolean;
      code?: number;
      errors?: { [key: string]: string[] };
    };
    status: number;
  };
}
