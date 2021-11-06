import * as vsc from "vscode";

export interface OutputTask {
  show: () => void;
  hide: () => void;
  isShow: () => Promise<boolean>;
  write: (value: string) => void;
  activate: () => void;
  unActivate: () => void;
}
/**
 * 创建输出终端
 */
export class OutputService {
  private constructor() {}
  private static _i?: OutputService;
  static get I() {
    return (this._i ??= new OutputService());
  }

  private outputs: WeakMap<any, OutputTask> = new WeakMap();

  find(unique: any) {
    return this.outputs.get(unique);
  }

  create(unique: any, title: string, onDispose: () => void): OutputTask {
    if (this.outputs.has(unique)) {
      const output = this.outputs.get(unique);
      output?.activate();
      output?.show();
    }
    //是否失效
    let invalid = false;
    const writeEmitter = new vsc.EventEmitter<string>();
    const pty: vsc.Pseudoterminal = {
      onDidWrite: writeEmitter.event,
      open() {},
      handleInput: () => invalid && terminal.dispose(),
      close() {
        onDispose?.();
        writeEmitter.dispose();
      },
    };
    const terminal = vsc.window.createTerminal({ name: title, pty });

    const isShow = async () => {
      const id = await terminal.processId;
      const activeId = await vsc.window.activeTerminal?.processId;
      return activeId === id;
    };
    return {
      show: terminal.show,
      hide: terminal.hide,
      isShow,
      write: (value: string) => !invalid && writeEmitter.fire(value + "\r\n"),
      activate: () => (invalid = false),
      unActivate: () => {
        invalid = true;
        writeEmitter.fire(
          "\r\n\r\nTerminal will be reused by tasks, press any key to close it.\r\n"
        );
      },
    };
  }
}
