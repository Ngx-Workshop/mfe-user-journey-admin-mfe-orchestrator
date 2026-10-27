export type SaveNotification = {
  status: 'saving' | 'saved' | 'error';
  name: string;
} | null;
