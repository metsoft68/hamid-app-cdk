import * as fs from 'fs';

export function readJSON(filename: any) {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
}

module.exports = {
    readJSON
}