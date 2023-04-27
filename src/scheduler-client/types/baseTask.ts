

// export type TaskFile = {
//     path: string,
//     filename: string
// }


export type TaskSubmit = {
    task_name: string,
    task_arguments?: string,
    file?: Express.Multer.File,
}


export type TaskArgument ={
    file?: string,
    arguments: any[]
}