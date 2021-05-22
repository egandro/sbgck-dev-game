const csvsync = require('./csvsync');
const fs = require('fs');
const fetch = require('node-fetch');

export interface Message {
    mp3: string;
    role: string;
    text: string;
}
export class TTSTools {
    public static verbose = false;

    private static async ttsmp3_com_engine(message: Message, targetDir: string, lang: string,
            forceOverWrite: boolean, map?: string): Promise<boolean> {
        const mp3 = message.mp3;
        const role = message.role;
        const text = message.text;

        const supportedLangs = ["en","de","fr"];

        if(!supportedLangs.includes(lang)) {
            console.log("warning: language not supported by ttsmp3.com: ", lang);
            return true;
        }

        const targetFile = targetDir + '/' + mp3;

        if (forceOverWrite != true && fs.existsSync(targetFile)) {
            if(TTSTools.verbose) {
                console.log("already have:", targetFile);
            }
            return true;
        }


        let voice = "Matthew"; // default

        let mapHash: any = {
            default: "Matthew",
            en: {
                default: "Matthew",
                narrator: "Matthew"
            },
            de: {
                default: "Hans",
                narrator: "Hans"
            },
            fr: {
                default: "Mathieu",
                narrator: "Mathieu"
            }
        };

        if(map) {
            const mapData = fs.readFileSync(map, "utf8");
            mapHash = JSON.parse(mapData);
        }

        if (mapHash.hasOwnProperty["default"]) {
            voice = mapHash["default"]; // even better default
        }

        if (mapHash.hasOwnProperty(lang)) {
            if (mapHash[lang].hasOwnProperty["default"]) {
                voice = mapHash[lang]["default"]; // even more better default
            }

            if (mapHash[lang].hasOwnProperty(message.role)) {
                voice = mapHash[lang][message.role]; // narrator voice
            }
        }

        const body = "lang=" + voice + "&source=ttsmp3&msg=" + text;

        let response = await fetch("https://ttsmp3.com/makemp3_new.php", {
            "headers": {
                "accept": "*/*",
                "content-type": "application/x-www-form-urlencoded",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": "https://ttsmp3.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": body,
            "method": "POST",
            "mode": "cors"
        });

        const json = await response.json();

        if(json.Error != null && json.Error !== undefined && json.Error !== 0) {
            console.error(`error : ${json.Error}`);
            return false;
        }

        const Text = json.Text;
        const URL = json.URL;

        if (text !== Text) {
            console.error('file was not rendered');
            return false;
        }

        response = await fetch(URL, {
            "headers": {
                "accept": "*/*",
                "range": "bytes=0-",
                "sec-ch-ua-mobile": "?0",
                "sec-fetch-dest": "audio",
                "sec-fetch-mode": "no-cors",
                "sec-fetch-site": "same-origin"
            },
            "referrer": "https://ttsmp3.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        }).then((res: any) => res.buffer());

        //if(TTSTools.verbose) {
        console.log(`downloaded: ${targetFile} - language: ${lang} - role: ${role} - voice: ${voice} - text: ${text}`);
        //}
        fs.writeFileSync(targetFile, response);

        return true;
    }

    public static async createMp3sFilesFromCVSs(sourceDir: string, targetBaseDir: string, forceOverWrite: boolean, map?: string): Promise<boolean> {
        if (!fs.existsSync(sourceDir)) {
            console.error(`error: source directory does not exist "${sourceDir}"`);
            return false;
        }

        if (!fs.existsSync(targetBaseDir)) {
            fs.mkdirSync(targetBaseDir, { recursive: true });
        }

        if (!fs.existsSync(targetBaseDir)) {
            console.error(`error: target directory does not exist "${targetBaseDir}"`);
            return false;
        }

        if (map && !fs.existsSync(map)) {
            console.error(`error: tts map file does not exist "${map}"`);
            return false;
        }

        const fileNames = fs.readdirSync(sourceDir);
        const tail = "_tts.csv";

        for (const fileName of fileNames) {
            if (!fileName.endsWith(tail)) {
                continue;
            }
            if (fileName.length != tail.length + 2) {
                continue;
            }
            const lang = fileName.substr(0, 2);

            const csvFile = sourceDir + "/" + fileName;

            if(!await TTSTools.createMp3FilesFromCVS(csvFile, targetBaseDir, lang, forceOverWrite, map)) {
                return false;
            }
        }


        return true;
    }

    public static async createMp3FilesFromCVS(csvFileName: string, targetBaseDir: string, lang: string, forceOverWrite: boolean, map?: string): Promise<boolean> {
        const targetDir = targetBaseDir + "/" + lang;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(targetDir)) {
            console.error(`error: target directory does not exist "${targetDir}"`);
            return false;
        }

        const text = fs.readFileSync(csvFileName, "utf8");

        const messages: Message[] = csvsync.parse(text, {
            skipHeader: true,
            returnObject: true,
            headerKeys: ["mp3", "role", "text"],
            delimiter: ',',
            trim: true
        });

        for (const message of messages) {
            if (!await TTSTools.ttsmp3_com_engine(message, targetDir, lang, forceOverWrite, map)) {
                return false;
            }
        }

        return true;
    }
}