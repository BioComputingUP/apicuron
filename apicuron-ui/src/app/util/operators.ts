import { Observable, OperatorFunction, of } from "rxjs";
import { switchMap, catchError, startWith, scan, map } from "rxjs/operators";

export interface LoadingState<T = unknown> {
  loading: boolean;
  error?: Error | null;
  data?: T;
}

export function switchMapWithLoading<T>(
  observableFunction: (value: any) => Observable<T>
): OperatorFunction<any, LoadingState<T>> {
  return (source: Observable<any>): Observable<LoadingState<T>> =>
    source.pipe(
      switchMap((value) =>
        observableFunction(value).pipe(
          map((data) => ({ data, loading: false })),
          catchError((error) => of({ error, loading: false })),
          startWith({ error: null, loading: true })
        )
      ),
      scan((state: LoadingState<T>, change: LoadingState<T>) => ({
        ...state,
        ...change,
      }))
    );
}
