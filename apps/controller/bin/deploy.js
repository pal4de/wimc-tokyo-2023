// @ts-check

import { program } from "commander";
import { promises as fs } from "fs";
import { NodeSSH } from "node-ssh";

const ignores = [
    /^.env$/,
    /^.git$/,
    /^.vscode$/,
    /^bin$/,
    /^node_modules$/,
];

const destinationPath = "/home/pi/controller/";

program
    .option('-i, --install')
    .option('-t, --target <string>')
    .arguments('[string]');
program.parse();
const options = program.opts();

async function main() {
    const target = options.target;

    echo(`${target}: デプロイ開始`);
    indentLevel++;

    try {
        echo(`ファイル転送開始`);
        indentLevel++;

        const ssh = new NodeSSH();

        await ssh.connect({
            host: target,
            username: "pi",
            password: "raspberry"
        });

        const items = program.args.length > 0 ? program.args : await fs.readdir(".");
        for (const item of items) {
            if (ignores.some(pattern => item.match(pattern))) {
                echo(`${item}: スキップ`);
                continue;
            }

            const stat = await fs.lstat(item);
            if (stat.isFile()) {
                await ssh.putFile(item, `${destinationPath}/${item}`);
                echo(`${item}: 完了`);
            } else if (stat.isDirectory()) {
                await ssh.putDirectory(item, `${destinationPath}/${item}`);
                echo(`${item}: 完了`);
            }
        }

        indentLevel--;
        echo(`ファイル転送完了`);

        if (options.install) {
            echo(`パッケージインストール開始`);
            indentLevel++;

            // TODO: プロセスの終了
            await ssh.exec("mkdir", ["-p", destinationPath], {
                cwd: "/home/pi/",
                onStdout: (chunk) => echo(chunk.toString('utf8')),
                onStderr: (chunk) => echo(chunk.toString('utf8')),
            });
            await ssh.exec("pnpm", ["install", "--prod"], {
                cwd: destinationPath,
                onStdout: (chunk) => echo(chunk.toString('utf8')),
                onStderr: (chunk) => echo(chunk.toString('utf8')),
            });
            // TODO: プロセスの開始

            indentLevel--;
            echo(`パッケージインストール完了`);
        }

        indentLevel--;
        echo(`${target}: デプロイ完了`);
    } catch (e) {
        echo(e.toString(), console.error);
        indentLevel = 0;
    }

    indentLevel--;
    echo("全て完了");

    process.exit();
}

let indentLevel = 0;

/**
 * 
 * @param {string} content 
 * @param {(data: string) => void} log 
 */
function echo(content = "", log = console.log) {
    const formatted = content.replace(/^/mg, "    ".repeat(indentLevel > 0 ? indentLevel : 0));
    log(formatted);
}

main();