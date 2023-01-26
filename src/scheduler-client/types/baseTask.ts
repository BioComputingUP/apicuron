

// export type TaskFile = {
//     path: string,
//     filename: string
// }


export type TaskSubmit = {
    task: string,
    task_arguments?: string,
    file?: Express.Multer.File,
}