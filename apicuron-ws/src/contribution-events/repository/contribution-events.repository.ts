import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoServerError } from 'mongodb';
import { Model, Types } from 'mongoose';
import { EventProcessingStatus } from 'src/core/enums';
import {
	ContributionEventDB,
	ContributionEventDocument,
} from '../../core/schemas/contribution-events/contribution-event.schema';
import {
	ContributionEvent,
	ContributionEventOutput,
	NewContributionEvent,
} from '../entities/contribution-event.entity';

type LeanContributionEvent = ContributionEventDB & { _id: Types.ObjectId };

@Injectable()
export class ContributionEventsRepository {
	constructor(
		@InjectModel(ContributionEventDB.name)
		private readonly model: Model<ContributionEventDocument>,
	) {}

	/** Inserts the event. A duplicate (same source + event_id) means "already received", not an error. */
	async save(event: NewContributionEvent): Promise<{ stored: boolean; id: string }> {
		try {
			const doc = await this.model.create(event);
			return { stored: true, id: doc._id.toString() };
		} catch (error) {
			if (error instanceof MongoServerError && error.code === 11000) {
				const existing = await this.model
					.findOne({ source: event.source, event_id: event.event_id }, { _id: 1 })
					.lean();
				if (existing) return { stored: false, id: existing._id.toString() };
			}
			throw error;
		}
	}

	async findById(id: string): Promise<ContributionEvent | null> {
		const doc = await this.model.findById(id).lean<LeanContributionEvent>();
		return doc ? this.toEntity(doc) : null;
	}

	async findByStatus(status: EventProcessingStatus, limit = 100): Promise<ContributionEvent[]> {
		const docs = await this.model
			.find({ 'processing.status': status })
			.sort({ received_at: 1 })
			.limit(limit)
			.lean<LeanContributionEvent[]>();
		return docs.map((doc) => this.toEntity(doc));
	}

	async markProcessed(
		id: string,
		interpreter_version: string,
		outputs: ContributionEventOutput[],
	): Promise<void> {
		await this.model.updateOne(
			{ _id: id },
			{
				$set: {
					'processing.status': EventProcessingStatus.PROCESSED,
					'processing.interpreter_version': interpreter_version,
					'processing.processed_at': new Date(),
					outputs,
				},
				$unset: { 'processing.error': '' },
				$inc: { 'processing.attempts': 1 },
			},
		);
	}

	async markFailed(id: string, error: unknown): Promise<void> {
		await this.model.updateOne(
			{ _id: id },
			{
				$set: {
					'processing.status': EventProcessingStatus.FAILED,
					'processing.error': error instanceof Error ? error.message : String(error),
				},
				$inc: { 'processing.attempts': 1 },
			},
		);
	}

	private toEntity(doc: LeanContributionEvent): ContributionEvent {
		return {
			id: doc._id.toString(),
			event_id: doc.event_id,
			source: doc.source,
			type: doc.type,
			subject: doc.subject,
			time: doc.time,
			dataschema: doc.dataschema,
			resource_id: doc.resource_id,
			payload: doc.payload,
			received_at: doc.received_at,
			processing: doc.processing,
			outputs: doc.outputs,
		};
	}
}