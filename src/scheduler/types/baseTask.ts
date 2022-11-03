

export type TaskFile = {
    path: string,
    meta: {
        filename: string,
        contentType: string,
        knownLength: number,    
    }
}


export type TaskSubmit = {
    task: string,
    task_arguments?: string,
    file?: TaskFile,
}