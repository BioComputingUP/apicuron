import { Observable } from "rxjs";
import { Paginated } from "../../../../../../src/app/interfaces/paginated";



export interface ILeaderboardService<Filter, LeaderboardRow> {

  getResourceLeaderboard(filter: Filter): Observable<Paginated<LeaderboardRow>>;
  
}