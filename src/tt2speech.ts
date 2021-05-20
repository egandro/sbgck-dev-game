const fs = require('fs');
const fetch = require('node-fetch');
import { parse } from '@fast-csv/parse';

const data: any[] = [];
let first = true;
const stream = parse({ headers: false })
    .on('error', error => console.error(error))
    .on('data', (row: any) => {
        if (first) {
            first = false;
        } else {
            // console.log(row);
            const item = {
                mp3: row[0],
                role: row[1],
                text: row[2]
            };
            data.push(item);
        }
    })
    .on('end', (rowCount: number) => {
        console.log(`Parsed ${rowCount} rows`);
    });

//stream.write('header1,header2\n');
//stream.write('col1,col2');
//stream.end();

const csv = fs.readFileSync("./po/voice_actor_tt2speech.csv", "utf8");
stream.write(csv);
stream.end(() => {
    for (const item of data) {
        ttsmp3_com_engine(item);
    }
});

function ttsmp3_com_engine(item: any) {
    const mp3 = item.mp3;
    const role = item.role;
    const text = item.text;

    const outFile = './dist/' + mp3;
    if (fs.existsSync(outFile)) {
        console.log("already have: ", outFile);
        return;
    }

    const body = "lang=Matthew&source=ttsmp3&msg=" + text;

    fetch("https://ttsmp3.com/makemp3_new.php", {
        "headers": {
            "accept": "*/*",
            "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/x-www-form-urlencoded",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://ttsmp3.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": body,
        "method": "POST",
        "mode": "cors"
    })

        .then((res: any) => res.json()) // expecting a json response
        .then((json: any) => {
            // console.log(json);

            const Text = json.Text;
            const URL = json.URL;

            if(text !== Text) {
                console.error('file was not rendered');
                return;
            }

            fetch(URL, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                    "range": "bytes=0-",
                    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"",
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
            })
                .then((res: any) => {
                    console.log(mp3, ":", Text);
                    const dest = fs.createWriteStream(outFile);
                    res.body.pipe(dest);
                });


        });
}

