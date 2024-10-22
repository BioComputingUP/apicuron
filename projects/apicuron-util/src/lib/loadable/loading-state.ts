import { Observable, of, OperatorFunction, pipe } from "rxjs";
import {
	catchError, filter,
	map,
	scan,
	startWith,
	switchMap,
	tap
} from "rxjs/operators";
import { LoadingState } from "./interfaces";

export function createLoadingState<T>() {
  return pipe(
    map((input: T): LoadingState<T> => ({ loading: false, data: input })),
    catchError((error: Error) => of({ error, loading: false })),
    startWith({ error: null, loading: true })
  );
}

export function switchMapWithLoading<T>(
  observableFunction: (value: any) => Observable<T>
): OperatorFunction<any, LoadingState<T>> {
  return (source: Observable<any>) =>
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

export function loaded<T>() {
  return pipe(
    filter(({ error, loading, data }: LoadingState<T>) => !loading && !error),
    tap((state) => {
      console.log({ state, after: "filter loaded" });
    }),
    map(({ data }: LoadingState<T>): T => data)
  );
}
