import { inject, DestroyRef } from "@angular/core";
import { Observable, Subject } from "rxjs";


export function createDestroyObservable(): Observable<void> {
    const destroyRef = inject(DestroyRef);
    const destroy$ = new Subject<void>();

    destroyRef.onDestroy(() => {
        destroy$.next();
        destroy$.complete();
    });
    return destroy$.asObservable();
}
