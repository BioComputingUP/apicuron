


export function json_to_tsv(input: Array<Object>, columns?: string[]): string {
    
    const column_list = Object.keys(input[0]).concat(columns)
    let output = column_list.join('\t') + '\n'
    
    input.forEach(item => {
        let line = column_list.map(column => !!item[column] ? item[column] : '').join('\t') 
        output = output.concat(line, '\n')
    })

    return output
}