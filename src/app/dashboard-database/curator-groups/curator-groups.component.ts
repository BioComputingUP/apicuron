import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { GroupsService } from './services/groups.service';

@Component({
  selector: 'curator-groups',
  templateUrl: './curator-groups.component.html',
  styleUrls: ['./curator-groups.component.scss']
})
export class CuratorGroupsComponent implements OnInit {

  search_fields = {
      field: "displayedName",
      text: "Biocurator name",
  };

  resource_id$: Observable<string>;
  search_field: string = "displayedName";
  selected_resources$ = new BehaviorSubject<any[]>([]);
  // biocurators_list$: Observable<Array<any>>;
  biocurators_list$ = new BehaviorSubject<any[]>([]);
  filtered_biocurators$ = new BehaviorSubject<any[]>([]);
  
  @Input() search_text: string = "";
  @Output() urlStringEvent = new EventEmitter<any>();

  constructor(
    protected http: HttpClient, 
    protected route: ActivatedRoute,
    private groupsService: GroupsService,
    ) {}

  ngOnInit(): void {

    this.resource_id$ = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        return params.get("resource_id")
      })
    )

    this.groupsService.init(this.resource_id$);

    this.biocurators_list$.subscribe(list => {
      this.filtered_biocurators$.next(list);
    });

  }

  onSubmit() {

    const filter_field = this.search_field;
    const query = this.search_text.toLowerCase();
    const filtered_list = this.biocurators_list$.pipe(
      map(list => list.filter(curator => 
        this.get_curator_name(curator[0]).toLowerCase().includes(query)
      ))
    ).subscribe(filtered => {
      this.filtered_biocurators$.next(filtered);
    });

    const resources = this.selected_resources$.value.map(({resource_id}) => resource_id)
    const params = {filter_field, query, 'resources[]': resources}
    this.urlStringEvent.emit(params);

  }

  get_curator_name(orcid_id: string): string {
    const participant = this.biocurators_list$.getValue().find(p => p[0] == orcid_id);
    return participant[0];
  }
}
