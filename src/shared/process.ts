import * as cp from "child_process";
import * as vsc from "vscode";
import * as os from "os";
import pidtree from "pidtree";

export interface ProcessInstance {
  unique: any;
  task: cp.ChildProcess;
}

export class ProcessService {
  private constructor() {}
  private static _i?: ProcessService;
  static get i() {
    return (this._i ??= new ProcessService());
  }

  private instances: ProcessInstance[] = [];

  find(unique: any) {
    return this.instances.find((e) => e.unique === unique);
  }

  private async getCwd(uri: vsc.Uri) {
    const stat = await vsc.workspace.fs.stat(uri);
    if (stat.type === vsc.FileType.File) {
      return vsc.Uri.joinPath(uri, "../").fsPath;
    } else {
      return uri.fsPath;
    }
  }

  /**
   * 创建进程
   * @param unique 唯一标识
   * @param uri 运行路径
   * @param command 运行命令
   */
  async create(
    unique: any,
    uri: vsc.Uri,
    commands: string[],
    on?: (type: "data" | "error" | "exit", value: any) => void
  ): Promise<cp.ChildProcess | undefined> {
    if (this.find(unique)) {
      return;
    }
    const cwd = await this.getCwd(uri);

    on?.("data", cwd);
    on?.("data", commands.join(" "));

    const [command, ...args] = commands;
    const shell = os.platform() === "win32";
    const process = cp.spawn(command, args, { cwd, shell });

    process.stdout?.on("data", (v) => on?.("data", v));
    process.stdout?.on("error", (v) => on?.("error", v));
    process.stderr?.on("data", (v) => on?.("error", v));
    process?.on("exit", (v) => {
      on?.("exit", v);
      const index = this.instances.findIndex((e) => e.unique === unique);
      if (index >= 0) {
        this.instances.splice(index, 1);
      }
    });
    this.instances.push({ unique, task: process });
    return process;
  }

  async kill(unique: any) {
    if (this.find(unique)?.task?.pid) {
      const isWindow = os.platform() === "win32";
      const kill = isWindow ? "tskill" : "kill";
      const pids = await pidtree(process.pid);
      pids?.forEach((cpid) => {
        cp.exec(`${kill} ${cpid}`);
      });
    }
    await new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        if (!this.find(unique)) {
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
    });
  }
}
