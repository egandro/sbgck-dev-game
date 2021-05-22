const Parser = require("fast-xml-parser").j2xParser;

const fs = require('fs');
const path = require('path');

const parser = require('fast-xml-parser');

const options = {
    attributeNamePrefix: "",
    ignoreAttributes: false,
    trimValues: true
};

const fileName = "./boards/Arctic-base.map";
const xmlData = fs.readFileSync(fileName, "utf-8");
const mapName = path.basename(fileName).split('.').slice(0, -1).join('.');

const result: any = {};
result.name = mapName;
result.map = [];

if (parser.validate(xmlData) === true) {
    const json = parser.parse(xmlData, options);

    if(json.hasOwnProperty("map")) {
        if(json["map"].hasOwnProperty("area")) {
            const areas = json["map"]["area"];

            for(const area of areas) {
                if(!area.hasOwnProperty("shape")) {
                    continue;
                }
                if(!area.hasOwnProperty("coords")) {
                    continue;
                }
                if(!area.hasOwnProperty("target")) {
                    continue;
                }
                const item = {
                    shape: area["shape"],
                    chords: area["coords"],
                    target: area["target"],
                }
                result.map.push(item);
            }
        }
    }
}

console.log(result);

