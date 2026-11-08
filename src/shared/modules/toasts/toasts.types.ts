export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastInput {
  message: string;
  variant: ToastVariant;
  action?: { label: string; href: string };
}

export interface ToastMessage extends ToastInput {
  id: number;
}

export type Notify = (notification: ToastInput) => void;

export interface ToastState {
  toasts: ToastMessage[];
  announcement: ToastMessage | null;
}

export type ToastAction = { type: 'show'; toast: ToastMessage } | { type: 'dismiss'; id: number };
