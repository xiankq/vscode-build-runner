import * as vscode from "vscode";
import * as childProcess from "child_process";
import * as fs from "fs";
import psList = require("ps-list");

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

  private increase: number = 1;

  ///创造一个唯一标识
  private generateUniqueId() {
    this.increase++;
    return this.increase;
  }

  register(context: vscode.ExtensionContext) {}

  private processes: Processes = {};

  private outputs: vscode.OutputChannel[] = [];

  /**
   * 终止进程
   * @param cwd
   */
  private terminateProcess(uri: vscode.Uri) {
    console.log(123);
    const cwd = getDirPath(uri);
    const process = this.processes[cwd];
    console.log(process);
    process.unref();
    try {
    } catch (error) {
      console.log(error);
    }
    console.log(process.killed);

    delete this.processes[cwd];
    console.log(this.processes);
    console.log(345);
  }
  /**
   * 创建线程
   * @param cmd
   * @param args
   */
  private createProcess(cmd: string, uri: vscode.Uri, title: string) {
    const cwd = getDirPath(uri);

    const process = childProcess.spawn(
      cmd.split(" ")[0],
      cmd.split(" ").filter((e, i) => i !== 0),
      {
        cwd: cwd,
        // stdio: "inherit",
        // detached: true,
      }
    );
    process.on("exit", (code) => {
      console.log(title + " exit:", code);
      childProcess.execSync("kill -15 " + process.pid);
      process.unref();
    });
    process.stdout?.on("data", (message) => {
      const messages = (message.toString() as string)
        .split("\n")
        .filter((e) => e);
      messages.forEach((e) => console.log(title + " data:", e));
      psList().then((e) =>
        console.log(e.filter((e) => e.ppid === process.pid))
      );
    });

    process.on("error", (error) => {
      console.log(title + " error:", error);
    });
    process.stderr?.on("data", (error) => {
      console.log(title + " error:", error);
    });
    this.processes[cwd] = process;
    console.log(process.pid);
  }

  watchCommand(uri: vscode.Uri, title: string) {
    const cmd =
      "flutter pub run build_runner watch --delete-conflicting-outputs";
    this.createProcess(cmd, uri, title);
  }

  buildCommand(args: ProcessArgs) {}
  reloadCommand(args: ProcessArgs) {}
}

const getDirPath = (uri: vscode.Uri) => {
  const stat = fs.statSync(uri.fsPath);

  return stat.isFile() ? vscode.Uri.joinPath(uri, "../").fsPath : uri.fsPath;
};
