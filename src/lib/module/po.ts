let fs = require('fs');
let process = require('process');

export class Po {
    fileName: string = "";

    run(opts: any) {
        this.fileName = opts.file;

        // if (fs.existsSync(this.fileName)) {
        //     if (this.sectionExistInFile()) {
        //         console.error('error: section already exist in "' + this.fileName + '"');
        //         process.exit(-1);
        //     }
        // }


        // try {
        //     fs.writeFileSync(this.fileName, data);
        // } catch (err) {
        //     console.error('error: can\'t create file "' + this.fileName + '"');
        //     // console.error(err);
        //     process.exit(-1);
        // }
    }

}

export default function run(opts: any) {
    let instance = new Po();
    return instance.run(opts);
}
