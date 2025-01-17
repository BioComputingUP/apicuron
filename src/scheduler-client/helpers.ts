import { TaskArgumentsObject } from "./types/baseTask";

export function buildTaskArgumentString(taskArguments: TaskArgumentsObject): string {
	let baseString = "yes "
	const argsString = Object.entries(taskArguments)
    .map(([key, value]) => `--${key} ${value}`)
    .join(' ');
	return argsString
}