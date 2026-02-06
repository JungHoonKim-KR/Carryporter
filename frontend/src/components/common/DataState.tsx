import { Spinner } from './Spinner';

interface DataStateProps<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  isEmpty?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: (error: string) => React.ReactNode;
  emptyComponent?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

export function DataState<T>({
  isLoading,
  error,
  data,
  isEmpty,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
}: DataStateProps<T>) {
  if (isLoading) {
    return loadingComponent || (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
        <span className="ml-3 text-gray-600 text-sm">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return errorComponent ? (
      errorComponent(error)
    ) : (
      <div className="text-center py-8">
        <p className="text-sub-red text-sm">{error}</p>
      </div>
    );
  }

  if (isEmpty || !data) {
    return emptyComponent || null;
  }

  return <>{children(data)}</>;
}
