import { ApiResponse, PaginatedResponse } from './Common';

export interface Notification {
  id: string;
  type: string;
  data: {
    message?: string;
    title?: string;
    // Add other common data fields here as needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
}

export type NotificationApiResponse = PaginatedResponse<Notification>;

export interface UnreadNotificationData {
  unread_count: number;
  notifications: Notification[];
}

export type UnreadNotificationApiResponse = ApiResponse<UnreadNotificationData>;
