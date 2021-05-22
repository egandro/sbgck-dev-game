const fs = require('fs');
const path = require('path');
import { SVGTools } from "./svgtools.class";
import { MapTools } from "../tools/maptools.class";

export class GameTools {

    // https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
    public static copyFileSync(source: string, target: string, filter: string[] = []) {
        let targetFile = target;

        if (filter !== null && filter !== undefined && filter.length > 0) {
            let found = false;
            for (const ext of filter) {
                if (source.endsWith(ext)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return;
            }
        }

        if (!fs.lstatSync(source).isFile()) {
            return;
        }

        // If target is a directory, a new file with the same name will be created
        if (fs.existsSync(target)) {
            if (fs.lstatSync(target).isDirectory()) {
                targetFile = path.join(target, path.basename(source));
            }
        }

        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }

    public static copyFolderRecursiveSync(source: string, target: string, filter: string[] = []) {
        let files = [];

        // Check if folder needs to be created or integrated
        const targetFolder = path.join(target, path.basename(source));
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder);
        }

        // Copy
        if (fs.lstatSync(source).isDirectory()) {
            files = fs.readdirSync(source);
            files.forEach((file: string) => {
                var curSource = path.join(source, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    GameTools.copyFolderRecursiveSync(curSource, targetFolder);
                } else {
                    GameTools.copyFileSync(curSource, targetFolder, filter);
                }
            });
        }
    }

    public static createGameFromDirectory(sourceDir: string, targetDir: string, forceOverWrite: boolean): boolean {

        if (!fs.existsSync(sourceDir)) {
            console.error(`error: source directory does not exist "${sourceDir}"`);
            return false;
        }

        const gameConfigFile = sourceDir + "/" + "gameconfig.json";
        if (!fs.existsSync(gameConfigFile)) {
            console.error(`error: source directory does not have a "gameconfig.json" file"${sourceDir}"`);
            return false;
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        if (!fs.existsSync(targetDir)) {
            console.error(`error: target directory does not exist "${targetDir}"`);
            return false;
        }

        const dirs = ["assets", "audio", "src"];

        for (const dirName of dirs) {
            const dir = sourceDir + "/" + dirName;
            GameTools.copyFolderRecursiveSync(dir, targetDir);
        }

        GameTools.copyFolderRecursiveSync(sourceDir + "/" + "boards", targetDir, [".png"]);

        const files = ["gameconfig.json"];
        for (const fileName of files) {
            const file = sourceDir + "/" + fileName;
            GameTools.copyFileSync(file, targetDir);
        }

        const svgDir = sourceDir + "/" + "svg";
        if (fs.existsSync(svgDir)) {
            if (!SVGTools.createPNGsFromSVGs(svgDir, targetDir+ "/" + "assets", forceOverWrite)) {
                return false;
            }
        }

        const boardsDir = sourceDir + "/" + "boards";
        if (fs.existsSync(boardsDir)) {
            if (!MapTools.createJsonFilesFromImageMaps(boardsDir, targetDir + "/" + "boards", forceOverWrite)) {
                return false;
            }
        }

        return false;
    }
}
