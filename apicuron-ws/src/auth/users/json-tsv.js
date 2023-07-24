"use strict";
exports.__esModule = true;
exports.json_to_tsv = void 0;
function json_to_tsv(input, columns) {
    var column_list = Object.keys(input[0]).concat(columns);
    var output = column_list.join('\t') + '\n';
    input.forEach(function (item) {
        var line = column_list.map(function (column) { return !!item[column] ? item[column] : ''; }).join('\t');
        output = output.concat(line, '\n');
    });
    return output;
}
exports.json_to_tsv = json_to_tsv;
