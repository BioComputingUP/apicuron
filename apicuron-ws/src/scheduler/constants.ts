export enum TaskName {
	ComputeBadges = 'compute_badges',
	ComputeMedals = 'compute_medals',
	ComputeStatistics = 'compute_statistics',
	DisprotUpdate = 'disprot_update',
	SubmitBulk = 'submit_bulk',
	SyncOrcid = 'sync_orcid',
}

export interface TaskRunOptions {
	task: TaskName;
	host: string;
	database: string;
	port: number;
	file?: string;
}

export type TaskArguments = {
	resource_id: string;
	orcid_id?: string;
	file?: Express.Multer.File;
	delete_existing?: string[];
};
