import {
	BeforeApplicationShutdown,
	Injectable,
	Logger,
	OnApplicationBootstrap,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ComputeBadgesService } from './compute-badges.service';
import { ComputeMedalsService } from './compute-medals.service';
import { ReportDocument } from '../../core/schemas/reports.schema';
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
} from 'rxjs';
import {
	IPostDeleteAllResourceReports,
	IPostReportInsertManyEventPayload,
	IPostReportInsertSingleEventPayload,
	postDeleteAllResourceReports,
	postReportInsertManyEvent,
	postReportInsertSingleEvent,
} from '../../submit-reports/events/events';
import { InjectModel } from '@nestjs/mongoose';
import {
	Achievement,
	AchievementDocument,
} from '../../core/schemas/achievements/achievements.schema';
import { Model } from 'mongoose';
import { isEqual, uniq } from 'lodash';
@Injectable()
export class AchievementEventHandlerService
	implements OnApplicationBootstrap, BeforeApplicationShutdown
{
	constructor(
		protected computeBadges: ComputeBadgesService,
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
		@InjectModel(Achievement.name)
		protected achievementModel: Model<AchievementDocument>,
	) {}
	beforeApplicationShutdown(signal?: string) {
		this.destroy$.next(signal);
	}

	destroy$ = new Subject();
	onApplicationBootstrap() {
		this.logger.log('AchievementEventHandlerService initialized');
		this.postReportInsertMany$ = fromEvent(
			this.eventEmitter,
			postReportInsertManyEvent,
		) as Observable<IPostReportInsertManyEventPayload>;

		this.postReportInsert$ = fromEvent(
			this.eventEmitter,
			postReportInsertSingleEvent,
		) as Observable<IPostReportInsertSingleEventPayload>;

		this.postReportInsertMany$
			.pipe(
				takeUntil(this.destroy$),
				map(({ reports }: IPostReportInsertManyEventPayload) => {
					return uniq(reports.map((r) => r.resource_id));
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
					`Reacted to  Event ${postReportInsertManyEvent}, computed Resource badges & medals computed for ${resources.join(
						', ',
					)}`,
				);
			});

		this.postReportInsert$
			.pipe(
				takeUntil(this.destroy$),
				map(({ report }: IPostReportInsertSingleEventPayload) => report),
				this.debouncebyUserResource(),
				switchMap(
					async (report: { resource_id: string; curator_orcid: string }) => {
						const { resource_id, curator_orcid } = report;
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
					`Reacted to ${postReportInsertSingleEvent}, computed ${resource_id}:${curator_orcid} User badges`,
				);
			});

		this.postReportInsert$
			.pipe(
				takeUntil(this.destroy$),
				map(({ report }: IPostReportInsertSingleEventPayload) => report),
				this.debounceByResource(),
				switchMap(async (resource_id: string) => {
					await this.computeMedals.computeMedals({
						resource_id,
					});
					return resource_id;
				}),
			)
			.subscribe((resource_id: string) => {
				this.logger.debug(
					`Reacted to ${postReportInsertSingleEvent}, computed Medals for Resource: ${resource_id} `,
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
			distinctUntilChanged(isEqual),
		);
	}

	postReportInsert$: Observable<IPostReportInsertSingleEventPayload>;

	postReportInsertMany$: Observable<IPostReportInsertManyEventPayload>;

	@OnEvent(postDeleteAllResourceReports, { async: true, promisify: true })
	async deleteAllResourceReportsHandler(
		deleteAllResourceReportsPayload: IPostDeleteAllResourceReports,
	) {
		await this.achievementModel.deleteMany({
			resource_id: deleteAllResourceReportsPayload.resource_id,
		});
		return;
	}
}
