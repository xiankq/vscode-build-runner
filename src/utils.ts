import * as vscode from "vscode";
import { ProgressOptions } from "vscode";


export type LoadingTask = (message: string, increment?: number) => void;

export const loadingUtil = (options: ProgressOptions): Promise<LoadingTask> => {
  return new Promise<LoadingTask>((resolve) => {
    vscode.window.withProgress(options,
      (progress) => {
        return new Promise<void>((stop) => {
          const report = (message: string, increment?: number) => {
            if (increment ?? 0 >= 100) {
              stop();
            } else {
              progress.report({ message, increment });
            }
          };
          resolve(report);
        });
      },

    );
  });
};



export const outputUtil = (name: string) => {

  const writeEmitter = new vscode.EventEmitter<string>();
  const pty: vscode.Pseudoterminal = {
    onDidWrite: writeEmitter.event,
    open: () => { },
    close: () => { }
  };
  const terminal = vscode.window.createTerminal({ name, pty });
  writeEmitter.fire('\x1b[10;20H*');
  return {
    show: terminal.show,
    hide: terminal.hide,
    dispose: terminal.dispose,
    fire: writeEmitter.fire
  };
};