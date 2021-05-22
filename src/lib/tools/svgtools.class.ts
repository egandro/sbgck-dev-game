const path = require('path');
const fs = require('fs');
const hasbin = require('hasbin');
const { execSync } = require('child_process');

export class SVGTools {
    public static verbose = false;

    public static createPNGsFromSVGs(sourceDir: string, targetDir: string, forceOverWrite: boolean): boolean {
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
        const tail = ".svg";

        for (let fileName of fileNames) {
            if (!fileName.endsWith(tail)) {
                continue;
            }

            fileName = sourceDir + "/" + fileName;

            if(!SVGTools.createPNGFromSVG(fileName, targetDir, forceOverWrite)) {
                return false;
            }
        }

        return true;
    }

    public static createPNGFromSVG(fileName: string, targetDir: string, forceOverWrite: boolean): boolean {
        const mapName = path.basename(fileName).split('.').slice(0, -1).join('.');
        const targetFile = targetDir + "/" + mapName + ".png";

        if (forceOverWrite != true && fs.existsSync(targetFile)) {
            if(SVGTools.verbose) {
                console.log("already have:", targetFile);
            }
            return true;
        }

        let mogrifyCmd = "mogrify";

        // imagemagick 7+
        if(hasbin.sync('magick')) { // node version of "where" or "which" command
            mogrifyCmd = "magick " + mogrifyCmd;
        }

        let cmd = mogrifyCmd + ` -trim  -background transparent -path ${targetDir} -format png ${fileName}`;
        execSync(cmd);

        return true;
    }
}
