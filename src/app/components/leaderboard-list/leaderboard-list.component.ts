import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReportCardComponent } from "src/app/components/report-card/report-card.component";
import { Report } from "src/app/models/report.model";

@Component({
    selector: 'leaderboard-list',
    templateUrl: './leaderboard-list.component.html',
    standalone: true,
    imports: [CommonModule, ReportCardComponent]
})
export class LeaderboardListComponent {

    constructor () {}

    @Input()
    public leaderboard: Report[];
    


}
