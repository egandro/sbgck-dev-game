const fs = require('fs')
const PO = require('pofile');

import { ExportToCsv } from 'export-to-csv';
import { msgid2mp3name, trimString, cleanHTMLEntities } from './lib/poutils';

// https://www.npmjs.com/package/pofile

const podata = fs.readFileSync("./po/en.po", "utf8"); // loop over all PO files
const po = PO.parse(podata);

const messages: Record<string, string> = {}
const items: any = [];
const itemsRaw: any = [];

for (const item of po.items) {
    const str = item.msgid;
    const pos = str.indexOf('}');
    if (pos > -1) {
        const mp3 = msgid2mp3name(str, '}');
        const rawText = str.substring(pos + 1, str.length).trim();
        const prefix = str.substring(0, pos + 1).trim();
        const translated = prefix + mp3;

        // console.log(translated);
        item.msgstr[0] = translated;

        if (!messages.hasOwnProperty(mp3)) {
            messages[mp3] = rawText;
            const role = prefix.replace("\$", "").replace("{", "").replace("}", "");
            let item: any = {
                mp3: mp3,
                role: role.trim(),
                text: cleanHTMLEntities(rawText) // without html entities
            };
            items.push(item);

            // deep clone
            item = JSON.parse(JSON.stringify(item));
            item.text = trimString(rawText), // with html entities
                itemsRaw.push(item);
        }
    }
}

// console.log(po);
// po.save('./po/mp3.po', (err: any) => { });

const options = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    //showTitle: true,
    //title: 'Voice Actor texts',
    useTextFile: false,
    useBom: true,
    // useKeysAsHeaders: true,
    headers: ['"mp3"', '"role"', '"text"'] // Won't work with useKeysAsHeaders present!
};

const csvExporter = new ExportToCsv(options);


// add language to the filename
const csvData = csvExporter.generateCsv(items, true);
fs.writeFileSync('./po/voice_actor.csv', csvData);

const csvDataRaw = csvExporter.generateCsv(itemsRaw, true);
fs.writeFileSync('./po/voice_actor_tt2speech.csv', csvDataRaw);