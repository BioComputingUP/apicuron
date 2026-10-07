export interface IngestResult {
	event_id: string;
	id: string;
	stored: boolean; // if false then is a duplicate
}

export interface BatchIngestResult {
	received: number;
	stored: number;
	duplicates: number;
	events: IngestResult[];
}

