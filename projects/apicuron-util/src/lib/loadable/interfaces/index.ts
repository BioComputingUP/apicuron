export interface LoadingState<T = unknown> {
  loading: boolean;
  error?: Error | null;
  data?: T;
}
