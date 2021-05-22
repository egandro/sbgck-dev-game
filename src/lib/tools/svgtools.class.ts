const path = require('path');
const fs = require('fs');
const hasbin = require('hasbin');
const { execSync } = require('child_process');

export class SVGTools {
    public static createPNGFromSVG(fileName: string, targetDir: string): boolean {
        const mapName = path.basename(fileName).split('.').slice(0, -1).join('.');
        const targetFile = targetDir + "/" + mapName + ".png";

        let mogrifyCmd = "mogrify";

        // imagemagick 7+
        if(hasbin.sync('magick')) { // node version of "where" or "which" command
            mogrifyCmd = "magick " + mogrifyCmd;
        }

        if (fs.existsSync(targetFile)) {
            console.log("already have: ", targetFile);
            return true;
        }

        let cmd = mogrifyCmd + ` -trim  -background transparent -path ${targetDir} -format png ${fileName}`;
        execSync(cmd);

        return true;
    }
}
