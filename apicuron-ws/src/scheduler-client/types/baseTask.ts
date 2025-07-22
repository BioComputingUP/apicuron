// export type TaskFile = {
//     path: string,
//     filename: string
// }

import { LogLevel } from '@nestjs/common';

export type TaskSubmit = {
	task_name: string;
	task_arguments?: TaskArgumentsObject;
	file?: Express.Multer.File;
};


export type TaskArgumentsObject = {
	[key: string]: string;
};

export enum TaskArgFlags {
	resource_id = "-r",
	orcid_id = "-o",

}