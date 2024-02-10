import {
	BeforeApplicationShutdown,
	Injectable,
	Logger,
	OnApplicationBootstrap,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
	POST_REPORT_INSERT,
	POST_REPORT_INSERT_MANY,
} from '../../reports/constants';
import { ComputeBadgesService } from './compute-badges.service';
import { ComputeMedalsService } from './compute-medals.service';
import * as _ from 'lodash';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	Observable,
	Subject,
	debounceTime,
	distinctUntilChanged,
	fromEvent,
	map,
	pipe,
	switchMap,
	takeUntil,
	tap,
} from 'rxjs';

@Injectable()
export class AchievementEventHandlerService
	implements OnApplicationBootstrap, BeforeApplicationShutdown
{
	constructor(
		protected computeBadges: ComputeBadgesService,
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
	) {}
	beforeApplicationShutdown(signal?: string) {
		this.destroy$.next(signal);
	}

	destroy$ = new Subject();
	onApplicationBootstrap() {
		this.logger.log('AchievementEventHandlerService initialized');
		this.postReportInsertMany$ = fromEvent(
			this.eventEmitter,
			POST_REPORT_INSERT_MANY,
		) as Observable<ReportDocument[]>;

		this.postReportInsert$ = fromEvent(
			this.eventEmitter,
			POST_REPORT_INSERT,
		) as Observable<ReportDocument>;

		this.postReportInsertMany$
			.pipe(
				takeUntil(this.destroy$),
				map((reports: ReportDocument[]) => {
					return _.uniq(reports.map((r) => r.resource_id));
				}),
				switchMap(async (resources: string[]) => {
					const compteBadgesPromises$ = resources.map((resource_id) => {
						return this.computeBadges.computeResourceBadges({
							resource_id,
						});
					});

					const computeMedalsPromises$ = resources.map((resource_id) => {
						return this.computeMedals.computeResourceMedals({
							resource_id,
						}) as Promise<any>;
					});

					const computePromises$ = compteBadgesPromises$.concat(
						computeMedalsPromises$,
					);

					await Promise.all(computePromises$);
					return resources;
				}),
			)
			.subscribe((resources: string[]) => {
				this.logger.debug(
					`Reacted to  POST_REPORT_INSERT_MANY, computed Resource badges & medals computed for ${resources.join(
						', ',
					)}`,
				);
			});

		this.postReportInsert$
			.pipe(
				takeUntil(this.destroy$),
				tap(() => {
					this.logger.debug('Intercepted POST_REPORT_INSERT event');
				}),
				this.debouncebyUserResource(),
				tap(() => {
					this.logger.debug(
						'Intercepted POST_REPORT_INSERT event after debounce',
					);
				}),
				switchMap(
					async ({
						resource_id,
						curator_orcid,
					}: {
						resource_id: string;
						curator_orcid: string;
					}) => {
						await this.computeBadges.computeUserBadges({
							resource: {
								resource_id,
							},
							user: {
								orcid_id: curator_orcid,
							},
						});
						return [resource_id, curator_orcid];
					},
				),
			)
			.subscribe(([resource_id, curator_orcid]) => {
				this.logger.debug(
					`Reacted to POST_REPORT_INSERT, computed ${resource_id}:${curator_orcid} User badges`,
				);
			});

		this.postReportInsert$
			.pipe(
				takeUntil(this.destroy$),
				this.debounceByResource(),
				switchMap(async (resource_id: string) => {
					await this.computeMedals.computeResourceMedals({
						resource_id,
					});
					return resource_id;
				}),
			)
			.subscribe((resource_id: string) => {
				this.logger.debug(
					`Reacted to POST_REPORT_INSERT, computed Medals for Resource: ${resource_id} `,
				);
			});
	}

	logger = new Logger(AchievementEventHandlerService.name);

	defaultDebounceTime = 500;

	private debounceByResource() {
		return pipe(
			map(({ resource_id }: ReportDocument) => resource_id),
			debounceTime(this.defaultDebounceTime),
			distinctUntilChanged(),
		);
	}

	private debouncebyUserResource() {
		return pipe(
			map((report: ReportDocument) => {
				return {
					resource_id: report.resource_id,
					curator_orcid: report.curator_orcid,
				};
			}),
			debounceTime(this.defaultDebounceTime),
			distinctUntilChanged(_.isEqual),
		);
	}

	postReportInsert$: Observable<ReportDocument>;

	postReportInsertMany$: Observable<ReportDocument[]>;
}
