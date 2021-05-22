const parser = require('fast-xml-parser');
const fs = require('fs');
const path = require('path');


export class MapTools {
    public static verbose = false;

    public static createJsonFilesFromImageMaps(sourceDir: string, targetDir: string, forceOverWrite: boolean): boolean {
        if (!fs.existsSync(sourceDir)) {
            console.error(`error: source directory does not exist "${sourceDir}"`);
            return false;
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(targetDir)) {
            console.error(`error: target directory does not exist "${targetDir}"`);
            return false;
        }

        const fileNames = fs.readdirSync(sourceDir);
        const tail = ".map";

        for (let fileName of fileNames) {
            if (!fileName.endsWith(tail)) {
                continue;
            }

            fileName = sourceDir + "/" + fileName;
            if(!MapTools.createJsonFileFromMap(fileName, targetDir, forceOverWrite)) {
                return false;
            }
        }

        return true;
    }

    public static createJsonFileFromMap(fileName: string, targetDir: string, forceOverWrite: boolean): boolean {
        const options = {
            attributeNamePrefix: "",
            ignoreAttributes: false,
            trimValues: true
        };

        const xmlData = fs.readFileSync(fileName, "utf-8");
        const mapName = path.basename(fileName).split('.').slice(0, -1).join('.');
        const targetFile = targetDir + "/" + mapName + ".json";

        if (forceOverWrite != true && fs.existsSync(targetFile)) {
            if(MapTools.verbose) {
                console.log("already have:", targetFile);
            }
            return true;
        }

        const result: any = {};
        result.name = mapName;
        result.map = [];

        if (parser.validate(xmlData) !== true) {
            console.error(`error: invalid xml input file ${fileName}`);
            return false;
        }

        const json = parser.parse(xmlData, options);

        if(!json.hasOwnProperty("map")) {
            console.error(`error: no <map> tag in file ${fileName}`);
            return false;
        }

        if(!json["map"].hasOwnProperty("area")) {
            console.error(`error: no <area> tag in <map> file ${fileName}`);
            return false;
        }

        const areas = json["map"]["area"];

        for(const area of areas) {
            if(!area.hasOwnProperty("shape")) {
                console.error(`error: no "shape" attribute in in <area> file ${fileName}`);
                return false;
            }
            if(!area.hasOwnProperty("coords")) {
                console.error(`error: no "coords" attribute in in <area> file ${fileName}`);
                return false;
            }
            if(!area.hasOwnProperty("target")) {
                console.error(`error: no "target" attribute in in <area> file ${fileName}`);
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
