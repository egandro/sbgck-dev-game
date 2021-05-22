const parser = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');


export class MapTools {
    public static createJsonFilesFromMap(fileName: string, targetDir: string): boolean {

        const options = {
            attributeNamePrefix: "",
            ignoreAttributes: false,
            trimValues: true
        };

        const xmlData = fs.readFileSync(fileName, "utf-8");
        const mapName = path.basename(fileName).split('.').slice(0, -1).join('.');
        const targetFile = targetDir + "/" + mapName + ".json";

        const result: any = {};
        result.name = mapName;
        result.map = [];

        if (parser.validate(xmlData) !== true) {
            console.log(`error: invalid xml input file ${fileName}`);
            return false;
        }

        const json = parser.parse(xmlData, options);

        if(!json.hasOwnProperty("map")) {
            console.log(`error: no <map> tag in file ${fileName}`);
            return false;
        }

        if(!json["map"].hasOwnProperty("area")) {
            console.log(`error: no <area> tag in <map> file ${fileName}`);
            return false;
        }

        const areas = json["map"]["area"];

        for(const area of areas) {
            if(!area.hasOwnProperty("shape")) {
                console.log(`error: no "shape" attribute in in <area> file ${fileName}`);
                return false;
            }
            if(!area.hasOwnProperty("coords")) {
                console.log(`error: no "coords" attribute in in <area> file ${fileName}`);
                return false;
            }
            if(!area.hasOwnProperty("target")) {
                console.log(`error: no "target" attribute in in <area> file ${fileName}`);
                return false;
            }
            const item = {
                shape: area["shape"],
                chords: area["coords"],
                target: area["target"],
            }
            result.map.push(item);
        }

        const jsonStr = JSON.stringify(result, undefined, 4);
        fs.writeFileSync(targetFile, jsonStr);

        return true;
    }
}
