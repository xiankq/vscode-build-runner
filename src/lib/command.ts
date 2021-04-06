import * as vscode from "vscode";
import * as childProcess from "child_process";
import * as fs from "fs";
import psList = require("ps-list");
import { LoadingTask, loadingUtil, outputUtil } from "../utils";
import { NestTreeItem, NestTreeProvider } from "./tree";

export interface ProcessArgs {
  cwd: string;
  title: string;
}
interface Processes {
  [key: string]: childProcess.ChildProcess;
}
export class BuildRunnerCommand {
  private static _instance: BuildRunnerCommand;
  public static get instance() {
    this._instance = this._instance ?? new BuildRunnerCommand();
    return this._instance;
  }

  register(context: vscode.ExtensionContext) {
    const commands = [
      vscode.commands.registerCommand('build_runner.watch', (args: NestTreeItem) => this.watch(args)),
      vscode.commands.registerCommand('build_runner.build', (args: NestTreeItem) => this.build(args)),
      vscode.commands.registerCommand('build_runner.terminate', (args: NestTreeItem) => this.terminate(args)),
    ];
    context.subscriptions.push.apply(context.subscriptions, commands);
  }

  /**
   * 存放正在运行的build_runner
   */
  private processes: Processes = {};


  /**
   * 判断改路径是否正在运行build_runner
   * @param uri 
   * @returns 
   */
  isRunning = (uri: vscode.Uri) => Object.keys(this.processes).includes(getDirPath(uri));


  private outputs: vscode.OutputChannel[] = [];


  /**
   * 创建线程
   * @param cmd
   * @param args
   */
  private async createProcess(cmd: string, data: NestTreeItem) {

    const cwd = getDirPath(data.resourceUri);
    const base = cmd.split(' ')[0];
    const args = cmd.split(' ').filter((_, i) => i !== 0);
    const process = childProcess.spawn(base, args, { cwd });
    this.processes[cwd] = process;

    NestTreeProvider.instance.refresh();

    const output = outputUtil(data.title);
    let loadingTask: LoadingTask | undefined;

    const showLoading = async (value: any, increment?: number) => {
      const message = (value.toString() as string).split("\n").join(" ");
      if (increment ?? 0 >= 100) {
        loadingTask?.(message, 100);
        loadingTask = undefined;
      } else {
        loadingTask ??= await loadingUtil({
          title: data.title,
          location: vscode.ProgressLocation.Window,
          cancellable: false,
        });
        loadingTask(message, increment);
      }
      output.fire(message);
    };

    showLoading(cmd);
    output.show();
    process.stdout?.on("data", (value) => {
      const message = (value.toString());
      const increment = message.includes("Succeeded after") ? 100 : undefined;
      showLoading(value, increment);
    });

    process.on("error", (value) => showLoading(value));

    process.stderr?.on("data", (value) => showLoading(value));

    process.on("exit", (code) => {
      showLoading(`exit ${code}`, 100);
      NestTreeProvider.instance.refresh();
    });

  }

  /**
    * 终止进程 
    * @param cwd
    */
  private async terminate(data: NestTreeItem) {
    const cwd = getDirPath(data.resourceUri);
    const process = this.processes[cwd];
    delete this.processes[cwd];
    if (process?.pid) {

      const list = await psList();
      const cpids = list.filter((e) => e.ppid === process.pid).map(e => e.pid);//子线程
      const ccpids = list.filter((e) => cpids.includes(e.ppid)).map(e => e.pid);//孙子线程
      console.log(cpids);
      console.log(ccpids);

      ccpids.forEach(element => {
        childProcess.execSync('kill ' + element);
      });
      cpids.forEach(element => {
        childProcess.execSync('kill ' + element);
      });
    }
  }

  private watch(data: NestTreeItem) {
    const cmd = "flutter pub run build_runner watch --delete-conflicting-outputs";
    return this.createProcess(cmd, data);
  }

  private build(data: NestTreeItem) {
    const cmd = "flutter pub run build_runner build --delete-conflicting-outputs";
    return this.createProcess(cmd, data);
  }


}

const getDirPath = (uri: vscode.Uri) => {
  const stat = fs.statSync(uri.fsPath);
  return stat.isFile() ? vscode.Uri.joinPath(uri, "../").fsPath : uri.fsPath;
};
