import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, pluck, switchMap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { BaseCuratorStatistics, WeeklyCuratorStatistics } from "src/app/models/statistics.model";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root",
})
export class LeaderboardService {	
  constructor(protected http: HttpClient) {}
  ws = environment.ws;
  partnerResourcesPath = environment.ws + "/partner-resources";

  private leaderboardColumns = {
	medals_count: { name: "Medals" },
	badges_count: { name: "Badges" },
	generation_count: { name: "Generation Contributions" },
	invalidation_count: { name: "Invalidation Contributions" },
	revision_count: { name: "Revision Contributions" },
	generation_score: { name: "Generation Score" },
	invalidation_score: { name: "Invalidation Score" },
	revision_score: { name: "Revision Score" },
	total_score: { name: "Total Score" },
	total_count: { name: "Total Contributions" },
	last_contribution: { name: "Last Contribution Date" },
	daysOfWeek: { name: "Weekly Contribution" }
  };

	getColumnProps(col: string) {
	  return this.leaderboardColumns[col];
	}

	getUserData(orcid_id: string) {
      return this.http.get(this.ws + "/users/" + orcid_id, {
		headers: {
		  version: "2",
		},
	  }).pipe(pluck("data"));
	}

	getUser(orcid_id: string): Observable<User> {
	  return this.getUserData(orcid_id).pipe(
		map((response) => {
		  const user = new User().deserialize(response);
		  return user;
		})
	  )
	}

	getResourceLeaderboard(resource_id: string): Observable<Paginated<BaseCuratorStatistics>> {
		const url = `${environment.ws}/statistics/leaderboard/${resource_id}`;
			return this.http
			.get<Paginated<BaseCuratorStatistics>>(url, {
				responseType: "json",
				headers: {version: "2"},
			})
			.pipe(
				map((response: Paginated<BaseCuratorStatistics>) => {
				response.data = response.data.map((stat: BaseCuratorStatistics) =>
					new BaseCuratorStatistics().deserialize(stat)
				);
					return response;
				})
			);
	}

	getResourceLeaderboardWithUsers(resource_id: string): Observable<{ user: User, stat: BaseCuratorStatistics }[]> {
		return this.getResourceLeaderboard(resource_id).pipe(
			switchMap((stats: Paginated<BaseCuratorStatistics>) => {
			const statList = stats.data;
			const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
			const usersList$ = orcidIds.map((id) => this.getUser(id));
			return combineLatest(usersList$).pipe(
				map((users: User[]) => {
				return statList.map((stat, index) => {
					const user = users.find(user => user.orcid_id == stat.curator_orcid);
					stat.ranking = index + 1;
					return { user, stat };
				});
				})
			);
			})
		);
	}
	  
	getWeeklyResourceLeaderboard(resource_id: string): Observable<Paginated<WeeklyCuratorStatistics>> {
		const response$ = this.http
		  .get(`${environment.ws}/weekly-statistics/${resource_id}/leaderboard`, {
			responseType: "json",
			headers: {
			  version: "2",
			},
		  })
		  .pipe(
			map(({ data, meta }: Paginated<WeeklyCuratorStatistics>) => {
			  return {
				data: data.map((stat: WeeklyCuratorStatistics) =>
				  new WeeklyCuratorStatistics().deserialize(stat)
				),
				meta,
			  };
			})
		  );
		return response$;
	  }
	  
	getWeeklyResourceLeaderboardWithUsers(resource_id: string): Observable<{ user: User, stat: WeeklyCuratorStatistics }[]> {
		return this.getWeeklyResourceLeaderboard(resource_id).pipe(
		  switchMap((stats: Paginated<WeeklyCuratorStatistics>) => {
			const statList = stats.data;
			const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
			const usersList$ = orcidIds.map((id) => this.getUser(id));
			return combineLatest(usersList$).pipe(
			  map((users: User[]) => {
				return statList.map((stat, index) => {
				  const user = users.find(user => user.orcid_id == stat.curator_orcid);
				  stat.ranking = index + 1;
				  return { user, stat };
				});
			  })
			);
		  })
		);
	  }
}