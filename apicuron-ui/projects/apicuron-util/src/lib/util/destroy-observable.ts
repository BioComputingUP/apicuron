import { inject, DestroyRef } from "@angular/core";
import { Observable, Subject } from "rxjs";


/**
 * Creates an observable that emits and completes when the associated Angular `DestroyRef` is destroyed.
 *
 * This utility is useful for automatically unsubscribing from observables in Angular components or services,
 * helping to prevent memory leaks. The returned observable emits a single `void` value and then completes
 * when the `onDestroy` lifecycle hook is triggered.
 *
 * @returns An `Observable<void>` that emits and completes upon destruction of the `DestroyRef`.
 */
export function createDestroy$(): Observable<void> {
    const destroyRef = inject(DestroyRef);
    const destroy$ = new Subject<void>();

    destroyRef.onDestroy(() => {
        destroy$.next();
        destroy$.complete();
    });
    return destroy$.asObservable();
}
