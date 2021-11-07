import * as vsc from 'vscode';

export interface OutputInstance {
  unique: any;
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
  static get i() {
    return (this._i ??= new OutputService());
  }

  private instances: OutputInstance[] = [];

  find(unique: any) {
    return this.instances.find((e) => e.unique === unique);
  }

  /**
   * 创建一个终端输出实例
   * @param unique
   * @param title
   * @param onDispose
   * @returns
   */
  create(unique: any, title: string, onDispose: () => void): OutputInstance {
    const exist = this.find(unique);
    if (exist) {
      exist.activate();
      exist.show();
      return exist;
    }
    //是否失效
    let invalid = false;
    const writeEmitter = new vsc.EventEmitter<string>();
    const pty: vsc.Pseudoterminal = {
      onDidWrite: writeEmitter.event,
      open() {},
      handleInput: () => invalid && terminal.dispose(),
      close: () => {
        const index = this.instances.findIndex((e) => e.unique === unique);
        onDispose?.();
        writeEmitter.dispose();
        if (index >= 0) {
          this.instances.splice(index, 1);
        }
      },
    };
    const terminal = vsc.window.createTerminal({ name: title, pty });

    const isShow = async () => {
      const id = await terminal.processId;
      const activeId = await vsc.window.activeTerminal?.processId;
      return activeId === id;
    };
    terminal.show();
    const instance = {
      unique,
      show: terminal.show,
      hide: terminal.hide,
      isShow,
      write: (value: string) => !invalid && writeEmitter.fire(value + '\r\n'),
      activate: () => (invalid = false),
      unActivate: () => {
        invalid = true;
        writeEmitter.fire('\r\n\r\nTerminal will be reused by tasks, press any key to close it.\r\n');
      },
    };
    this.instances.push(instance);
    return instance;
  }
}
