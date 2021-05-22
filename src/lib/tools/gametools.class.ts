const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

import { SVGTools } from "./svgtools.class";
import { MapTools } from "../tools/maptools.class";
import { PoTools } from "../tools/potools.class";
import { TTSTools } from "../tools/ttstools.class";
import { isFunction } from "util";

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

    public static zipFolderRecursiveSync(source: string, zip: any, level: number = 0, root: string = "") {
        let files = [];
        if (fs.lstatSync(source).isDirectory()) {
            if(level == 0) {
                root = path.join(source, '');
            }
            files = fs.readdirSync(source);
            files.forEach((file: string) => {
                var curSource = path.join(source, file);
                if (fs.lstatSync(curSource).isDirectory()) {
                    GameTools.zipFolderRecursiveSync(curSource, zip, level+1, root);
                } else {
                    let zipPath = curSource.replace(/\\/g, "/");
                    root = root.replace(/\\/g, "/");

                    //console.log(root, zipPath);

                    if(root.length>0) {
                        zipPath = zipPath.substring(root.length+1); // +1 = delimiter
                    }

                    const zipName = zipPath.substring(zipPath.lastIndexOf("/")+1);
                    zipPath = zipPath.substring(0, zipPath.lastIndexOf("/"));
                    // console.log(root, zipPath, zipName);
                    zip.addLocalFile(curSource, zipPath, zipName);
                }
            });
        }
    }

    public static createZip(sourceDir: string, target: string) {
        const zip = new AdmZip();
        GameTools.zipFolderRecursiveSync(sourceDir, zip);
	    zip.writeZip(target);
    }

    public static async createGameFromDirectory(sourceDir: string, targetDir: string, forceOverWrite: boolean): Promise<boolean> {

        if (!fs.existsSync(sourceDir)) {
            console.error(`error: source directory does not exist "${sourceDir}"`);
            return false;
        }

        const gameConfigFile = sourceDir + "/" + "gameconfig.json";
        if (!fs.existsSync(gameConfigFile)) {
            console.error(`error: source directory does not have a "gameconfig.json" file"${sourceDir}"`);
            return false;
        }

        const gameConfigFileData = fs.readFileSync(gameConfigFile, "utf8");
        const gameConfig = JSON.parse(gameConfigFileData);

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

        const srcDir = sourceDir + "/" + "src";
        const poDir = targetDir + "/" + "po";
        if (fs.existsSync(srcDir)) {
            if (gameConfig.hasOwnProperty("languages")) {
                let languages = '';

                for(const i in gameConfig.languages) {
                    const lang = gameConfig.languages[i].trim();
                    languages += lang;
                    if(i+1 < gameConfig.languages.length) {
                        languages += ",";
                    }
                }

                if(!PoTools.createOrUpdatePoFiles(srcDir, poDir, languages)) {
                    return false;
                }
            }
        }

        if (fs.existsSync(poDir)) {
            const audioDir = targetDir + "/" + "audio";
            let map: any = null;
            const ttsMapFile = sourceDir + "/" + "tts-map.json";
            if (fs.existsSync(ttsMapFile)) {
                map = ttsMapFile;
            }

            if(!await TTSTools.createMp3sFilesFromCVSs(poDir, audioDir, forceOverWrite, map)) {
                return false;
            }
        }

        if (gameConfig.hasOwnProperty("name")) {
            const name = gameConfig.name;
            const zipFile = sourceDir + "/" + name + ".zip";
            GameTools.createZip(targetDir, zipFile);
        }

        return false;
    }
}
