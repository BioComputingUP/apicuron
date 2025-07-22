import { inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { shareReplay, pluck } from "rxjs/operators";
import { DatabasesService } from "../../../../../../src/app/databases/services/databases.service";
import { Resource } from "../../../../../../src/app/models/resource.model";

export function loadResource(resourceInput: Resource | string): Observable<Resource> {
    if (
      typeof resourceInput != "string" &&
      !(resourceInput instanceof Resource)
    ) {
      throw new Error(
        `Invalid resource input: ${resourceInput}, input has to be either a string or a Resource object`
      );
    }
    if (typeof resourceInput === "string") {
      const resourceService = inject(DatabasesService);
      return resourceService
        .get_resource(resourceInput)
        .pipe(shareReplay(1), pluck("data"));
    }
    if (resourceInput instanceof Resource) {
      return of(resourceInput);
    }
  }