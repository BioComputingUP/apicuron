import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
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
  resource_id$: Observable<string>;

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
  }
}
