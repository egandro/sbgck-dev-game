import { stripHtml } from "string-strip-html";
const crpt = require('crypto');

function md5sum(val: string): string {
    return crpt.createHash('md5').update(val).digest('hex');
}

export function trimString(str: string): string {
    let result = str.trim().replace(/\s\s+/g, ' ').replace(/>\s/g, '>').replace(/\s<\//g, '<\/');

    return result;
}

export function cleanHTMLEntities(str: string): string {
    let result = stripHtml(str).result;
    result = trimString(result);

    return result;
}

// po file mesgid to mp3 filename (by md5sum)
export function msgid2mp3name(msgid: string, separator: string): string {
    let result = msgid;
    const pos = msgid.indexOf(separator);

    if (pos > -1) {
        let rawText = msgid.substring(pos + 1, msgid.length);
        rawText = cleanHTMLEntities(rawText);
        const mp3 = md5sum(rawText) + ".mp3";
        result = mp3;
        // console.log( "t>" + rawText + "<");
        // console.log( "m>" + mp3 + "<");
    } else {
        result = "ERROR: voice actor is missing! (" + msgid + ")";
    }

    return result;
}
