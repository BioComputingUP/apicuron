import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { User } from "src/app/models/User";

@Component({
    selector:'curator-stats',
    templateUrl: './curator-stats.component.html'
})
export class CuratorStatsComponent {

    constructor(protected) {

    }

    @Input() curator: User;

}