import * as cp from "child_process";
import * as vsc from "vscode";
import * as os from "os";
import pidtree = require("pidtree");

export class ProcessService {
  private constructor() {}
  private static _i?: ProcessService;
  static get I() {
    return (this._i ??= new ProcessService());
  }

  private processMap: WeakMap<any, cp.ChildProcess> = new WeakMap();

  private async getCwd(uri: vsc.Uri) {
    const stat = await vsc.workspace.fs.stat(uri);
    if (stat.type === vsc.FileType.Directory) {
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
  ): Promise<cp.ChildProcess> {
    const cwd = await this.getCwd(uri);
    const [command, ...args] = commands;
    const shell = os.platform() === "win32";
    const process = cp.spawn(command, args, { cwd, shell });

    process.stdout?.on("data", (v) => on?.("data", v));
    process.stdout?.on("error", (v) => on?.("error", v));
    process.stderr?.on("data", (v) => on?.("error", v));
    process.stdout?.on("exit", (v) => {
      this.processMap.delete(unique);
      on?.("exit", v);
    });
    return process;
  }

  async kill(process: cp.ChildProcess) {
    if (process?.pid) {
      const isWindow = os.platform() === "win32";
      const kill = isWindow ? "tskill" : "kill";
      const pids = await pidtree(process.pid);
      pids?.forEach((cpid) => {
        cp.exec(`${kill} ${cpid}`);
      });
    }
    await new Promise<void>((resolve) => {
      const intervalId = setInterval(() => {
        if (!Object.values(this.processMap).includes(process)) {
          clearInterval(intervalId);
          resolve();
        }
      }, 100);
    });
  }

  find(unique: any) {
    return this.processMap.get(unique);
  }
}
