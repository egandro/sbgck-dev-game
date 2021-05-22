const fs = require('fs');
const crpt = require('crypto');
const { execSync } = require('child_process');
const PO = require('pofile');
import { stripHtml } from "string-strip-html";
import { ExportToCsv, Options } from 'export-to-csv';

function md5sum(val: string): string {
    return crpt.createHash('md5').update(val).digest('hex');
}

function trimString(str: string): string {
    let result = str.trim().replace(/\s\s+/g, ' ').replace(/>\s/g, '>').replace(/\s<\//g, '<\/');
    return result;
}

function stripHtmlEntities(str: string): string {
    let result = stripHtml(str).result;
    return trimString(result);
}

function textToMp3Name(rawText: string): string {
    rawText = stripHtmlEntities(rawText);
    return md5sum(rawText) + ".mp3";
}

// orders of members is important - it reflect the cvs order
export interface Message {
    mp3: string;
    role: string;
    message: string;
}

export class PoTools {
    // get the bin path of npm by calling "npm bin"
    private static readonly npmBinPath = execSync("npm bin").toString().trim();
    private static readonly ttagCmd = PoTools.npmBinPath + "/" + "ttag";

    private static writeVoiceActorCVSFile(targetDir: string, language: string, messages: Message[], isTTS: boolean): boolean {
        const options: Options = {
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            useTextFile: false,
            useBom: true,
            showLabels: true,
            headers: ['"mp3"', '"role"', '"text"']
        };

        let csvFile = targetDir + "/" + language + "_voice_actor" + ".csv";
        if(isTTS) {
            csvFile = targetDir + "/" + language + "_tts" + ".csv";
        }
        const csvExporter = new ExportToCsv(options);
        const csvData = csvExporter.generateCsv(messages, true);

        fs.writeFileSync(csvFile, csvData);
        return true;
    }

    private static getMessagesFromPoFile(poFile: string, isTTS: boolean): Message[] {
        const result: Message[] = [];

        // read po file as string
        const podata = fs.readFileSync(poFile, "utf8");

        // parse the po file with
        const po = PO.parse(podata);

        for (const item of po.items) {
            let str: string;
            if(item.msgstr == null || item.msgstr === undefined || item.msgstr.length == 0 || item.msgstr[0].trim().length == 0) {
                // not translated, yet
                str = item.msgid;
            } else {
                str = item.msgstr[0]; // first
            }
            const message = PoTools.getMessage(str, !isTTS);
            if (message == null) {
                console.error(`error: in po file "${poFile}" - no "ROLE" in message: ${item.msgid} `);
                return [];
            }
            result.push(message);
        }

        return result;
    }

    public static getMessage(msgid: string, clearHtmlTags: boolean = false): Message | null {
        const pos = msgid.indexOf("}");

        if (pos < 0) {
            return null;
        }

        const prefix = msgid.substring(0, pos + 1).trim();
        const role = (prefix.replace("\$", "").replace("{", "").replace("}", "")).trim();
        const rawText = msgid.substring(pos + 1, msgid.length).trim();
        const mp3 = textToMp3Name(rawText); //make a more stable filename
        let message = rawText;
        if (clearHtmlTags) {
            message = stripHtmlEntities(message);
        }

        // orders of members is important - it reflect the cvs order
        const result = {
            mp3: mp3,
            role: role,
            message: message
        }

        return result;
    }

    public static createOrUpdatePoFiles(sourceDir: string, targetDir: string,  languages: string): boolean {

        if (!fs.existsSync(sourceDir)) {
            console.error(`error: source directory does not exist "${sourceDir}"`);
            return false;
        }

        if (!fs.existsSync(sourceDir)) {
            fs.mkdirSync(sourceDir, { recursive: true });
        }

        if (!fs.existsSync(sourceDir)) {
            console.error(`error: target directory does not exist "${sourceDir}"`);
            return false;
        }

        const langs = languages.split(',');

        for (const i in langs) {
            const lang = langs[i].trim();

            if(!PoTools.createOrUpdatePoFile(sourceDir, targetDir, lang)) {
                return false;
            }

            if(!PoTools.createVoiceActorListFromPoFile(targetDir, lang)) {
                return false;
            }
        }

        return true;
    }

    public static createOrUpdatePoFile(sourceDir: string, targetDir: string, language: string): boolean {

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

        const poFile = targetDir + "/" + language + ".po";

        // init
        if (!fs.existsSync(poFile)) {
            let cmd = PoTools.ttagCmd + ` init ${language} ${poFile}`;
            execSync(cmd);
        } else {
            // console.log(`${poFile} exists - init skip`);
        }

        // update
        let cmd = PoTools.ttagCmd + ` update ${poFile} ${sourceDir}`;
        execSync(cmd);

        return true;
    }

    public static createVoiceActorListFromPoFile(targetDir: string, language: string): boolean {
        const poFile = targetDir + "/" + language + ".po";

        if (!fs.existsSync(poFile)) {
            console.error(`error: po file does not exist "${poFile}"`);
            return false;
        }

        const flavors = [false, true];

        for(const isTTS of flavors) {
            const messages = PoTools.getMessagesFromPoFile(poFile, isTTS);
            if(messages.length == 0) {
                return false;
            }
            if(!PoTools.writeVoiceActorCVSFile(targetDir, language, messages, isTTS)) {
                return false;
            }
        }

        return true;
    }
}