const csvsync = require('csvsync');
const fs = require('fs');
const fetch = require('node-fetch');

export interface Message {
    mp3: string;
    role: string;
    text: string;
}
export class TTSTools {
    private static async ttsmp3_com_engine(message: Message, targetDir: string, lang: string, map?: string): Promise<boolean> {
        const mp3 = message.mp3;
        const role = message.role;
        const text = message.text;

        const supportedLangs = ["en","de","fr"];

        if(!supportedLangs.includes(lang)) {
            console.log("warning: language not supported by ttsmp3.com: ", lang);
            return true;
        }

        const outFile = targetDir + '/' + mp3;
        if (fs.existsSync(outFile)) {
            console.log("already have: ", outFile);
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
            const mapData = fs.readFileSync(map);
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

        console.log(`downloaded: ${outFile} - language: ${lang} - role: ${role} - voice: ${voice} - text: ${text}`);
        fs.writeFileSync(outFile, response);

        return true;
    }

    public static async createMp3FilesFromCVS(csvFileName: string, targetBaseDir: string, lang: string, map?: string): Promise<boolean> {
        const targetDir = targetBaseDir + "/" + lang;

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(targetDir)) {
            console.error(`error: target directory does not exist "${targetDir}"`);
            return false;
        }

        const text = fs.readFileSync(csvFileName);

        const messages: Message[] = csvsync.parse(text, {
            skipHeader: true,
            returnObject: true,
            headerKeys: ["mp3", "role", "text"],
            delimiter: ',',
            trim: true
        });

        for (const message of messages) {
            if (!await TTSTools.ttsmp3_com_engine(message, targetDir, lang, map)) {
                return false;
            }
        }

        return true;
    }
}