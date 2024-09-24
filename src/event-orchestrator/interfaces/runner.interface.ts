import { Aggregator } from './aggregator.interface';

export interface IRunner {
	run(fn: (aggregator: Aggregator) => any | Promise<any>): Promise<any>;
}
