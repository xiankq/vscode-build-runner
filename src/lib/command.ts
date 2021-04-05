import * as vscode from "vscode";
import * as childProcess from "child_process";
import * as fs from "fs";
import psList = require("ps-list");
import { LoadingTask, loadingUtil, outputUtil } from "../utils";
import { BuildRunnerTreeItem } from "./tree";

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
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'build_runner.watch',
        (args: BuildRunnerTreeItem) => this.watchCommand(args.data.uri, args.data.name)
      ),
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'build_runner.build',
        (args: BuildRunnerTreeItem) => this.buildCommand(args.data.uri, args.data.name)
      ),
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'build_runner.terminate',
        (args: BuildRunnerTreeItem) => this.terminateProcess(args.data.uri)
      ),
    );
  }

  private processes: Processes = {};

  private outputs: vscode.OutputChannel[] = [];

  /**
   * 终止进程 
   * @param cwd
   */
  private async terminateProcess(uri: vscode.Uri) {
    const cwd = getDirPath(uri);
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
  /**
   * 创建线程
   * @param cmd
   * @param args
   */
  private async createProcess(cmd: string, uri: vscode.Uri, title: string) {

    const cwd = getDirPath(uri);

    if (this.processes[cwd]) {
      const picker = await vscode.window.showWarningMessage(`"${title}" is already active.`, '终止', '执行');
      if (!picker) {
        return;
      } else {
        await this.terminateProcess(uri);
      }
      if (picker === '终止') {
        return;
      }
    }


    const base = cmd.split(' ')[0];
    const args = cmd.split(' ').filter((_, i) => i !== 0);
    const process = childProcess.spawn(base, args, { cwd });
    this.processes[cwd] = process;


    const output = outputUtil(title);

    let loadingTask: LoadingTask | undefined;

    const showLoading = async (value: any, increment?: number) => {
      const message = (value.toString() as string).split("\n").join(" ");
      if (increment ?? 0 >= 100) {
        loadingTask?.(message, 100);
        loadingTask = undefined;
      } else {
        loadingTask ??= await loadingUtil({
          title: title,
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
    });

  }

  watchCommand(uri: vscode.Uri, title: string) {
    const cmd = "flutter pub run build_runner watch --delete-conflicting-outputs";
    this.createProcess(cmd, uri, title);
  }

  buildCommand(uri: vscode.Uri, title: string) {
    const cmd = "flutter pub run build_runner build --delete-conflicting-outputs";
    this.createProcess(cmd, uri, title);
  }
}

const getDirPath = (uri: vscode.Uri) => {
  const stat = fs.statSync(uri.fsPath);
  return stat.isFile() ? vscode.Uri.joinPath(uri, "../").fsPath : uri.fsPath;
};
