import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
  Observable,
  Subject,
} from "rxjs";
import { map, shareReplay, takeUntil, withLatestFrom } from "rxjs/operators";
import { DatabasesService } from "src/app/databases/services/databases.service";
@Component({
  selector: "curator-search",
  templateUrl: "./curator-search.component.html",
  styleUrls: ["./curator-search.component.scss"],
})
export class CuratorSearchComponent
  implements AfterViewInit, OnInit, OnDestroy
{
  @ViewChild("resourcesearch")
  resource_search_field: ElementRef<HTMLInputElement>;

  all_resources_list$: Observable<any[]>;
  resource_search_Event$: Observable<any>;
  suggested_resources$: Observable<any[]>;
  selected_resources$ = new BehaviorSubject<any[]>([]);
  display_suggestion$ = new BehaviorSubject<Boolean>(false);
  destroy$: Subject<Boolean> = new Subject();

  constructor(
    protected databaseService: DatabasesService,
    private route: ActivatedRoute,
  ) {
    this.all_resources_list$ = this.databaseService
      .get_resources()
      .pipe(map((response: any) => response.data));
  }

  set_suggestion(value: Boolean) {
    console.log("set suggestion,", value);
    this.display_suggestion$.next(value);
  }

  ngAfterViewInit(): void {
    this.resource_search_Event$ = merge(
      fromEvent(this.resource_search_field.nativeElement, "click"),
      fromEvent(this.resource_search_field.nativeElement, "focus"),
      fromEvent(this.resource_search_field.nativeElement, "change"),
    ).pipe(shareReplay(1));
    this.resource_search_Event$.subscribe((event) => {
      this.set_suggestion(true);
    });

    this.suggested_resources$ = combineLatest([
      this.selected_resources$,
      this.resource_search_Event$,
    ]).pipe(
      withLatestFrom(this.all_resources_list$),
      shareReplay(1),
      map(([clicks, resource_list]) => {
        // search term from the input field in uppercase
        const search_term =
          this.resource_search_field.nativeElement.value.toUpperCase();
        // extract the resource_id and name from the resource object to filter
        return resource_list.filter(({ resource_id, resource_name }) => {
          // check if resource already selected, if true return false
          const already_selected = this.selected_resources$.value.find(
            (selected) => {
              return selected.resource_id == resource_id;
            },
          );
          if (already_selected) {
            return false;
          }

          // compute if the resource_id or resource_name include the search_term
          const found_booleans = [resource_id, resource_name].map(
            (value: string) => {
              return value.toUpperCase().includes(search_term);
            },
          );

          // return the logical OR of "if found in resource_id" and "if found in resource_name"
          return found_booleans.some((x) => x);
        });
      }),
    );
  }
  biocuratorSearchForm: UntypedFormGroup;

  // filter by resource
  resources = {
    selected_resources: new Set(),
    display_resource_suggesion: false,
  };

  all_resources = ["dome", "disprot", "ped"];

  // filtered_resources = new Set();

  search_fields = [
    {
      field: "displayedName",
      text: "Biocurator name",
    },
    {
      field: "orcid_id",
      text: "ORCID",
    },
  ];

  // search field selection
  search_field: string = "displayedName";

  // search text field
  @Input()
  search_text: string = "";

  // parent event to send the data
  @Output() urlStringEvent = new EventEmitter<any>();

  add_resource(resource: string) {
    this.selected_resources$.next([
      ...this.selected_resources$.value,
      resource,
    ]);
  }

  remove_selection(resource) {
    this.selected_resources$.next(
      this.selected_resources$.value.filter(
        (res) => resource.resource_id != res.resource_id,
      ),
    );
  }

  get currentField() {
    return this.search_fields.find(
      (searchField) => searchField.field == this.search_field,
    );
  }

  onSubmit() {
    const filter_field = this.search_field;
    const query = this.search_text;
    const resources = this.selected_resources$.value.map(
      ({ resource_id }) => resource_id,
    );

    const params = { filter_field, query, "resources[]": resources };

    this.urlStringEvent.emit(params);
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params["resources"]) {
          const resources = Array.isArray(params["resources"])
            ? params["resources"]
            : [params["resources"]];
          this.selected_resources$.next(
            resources.map((resource_id) => {
              return { resource_id };
            }),
          );
          this.onSubmit();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
