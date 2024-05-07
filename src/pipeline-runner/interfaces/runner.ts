export interface Runner {
	runPipeline<T>(...args: any[]): Promise<any> | any | T;
}
