import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import psList = require('ps-list');
import { NestTreeItem } from './tree';

interface Processes {
  [key: string]: childProcess.ChildProcess;
}
type LoadingTask = { report: (message: string) => void; stop: () => void };

type OutputTask = {
  write: (data: string) => void;
  show: (preserveFocus?: boolean | undefined) => void;
  id: Thenable<number | undefined>;
  close: () => void;
};

type Outputs = { [key: string]: OutputTask };

export class Process {
  private static _instance: Process;
  public static get instance() {
    this._instance = this._instance ?? new Process();
    return this._instance;
  }

  getDirPath(uri: vscode.Uri) {
    return fs.statSync(uri.fsPath).isFile() ? vscode.Uri.joinPath(uri, '../').fsPath : uri.fsPath;
  }

  async createLoading(title: string) {
    return new Promise<LoadingTask>((resolve) => {
      const option = {
        location: vscode.ProgressLocation.Window,
        title,
        cancellable: false,
      };
      vscode.window.withProgress(option, (progress) => {
        return new Promise<void>((stop) => {
          const report = (message: string) => progress.report({ message });
          resolve({
            report,
            stop: () => stop(),
          });
        });
      });
    });
  }

  createOutput(title: string, onClose: () => void): OutputTask {
    const writeEmitter = new vscode.EventEmitter<string>();
    const pty: vscode.Pseudoterminal = {
      onDidWrite: writeEmitter.event,
      open() {},
      close() {
        onClose?.();
        writeEmitter.dispose();
      },
      handleInput: (value) => {
        if (value === 'close') {
          writeEmitter.fire('\r\n' + value);
        }
      },
    };
    const terminal = vscode.window.createTerminal({ name: title, pty });

    return {
      write: (text: string) => writeEmitter.fire(text + '\r\n'),
      show: terminal.show,
      id: terminal.processId,
      close: () => terminal.sendText('close'),
    };
  }

  private processes: Processes = {};
  private outputs: Outputs = {};

  async create(data: NestTreeItem, type: 'watch' | 'build') {
    const cwd = this.getDirPath(data.resourceUri);

    const args = ['pub', 'run', 'build_runner', type, '--delete-conflicting-outputs'];

    const output = this.createOutput(data.title, () => this.stop(data));
    this.outputs[cwd] = output;
    output.show();
    output.write(cwd);
    output.write(['flutter', ...args].join(' '));

    const process = childProcess.spawn('flutter', args, { cwd });
    this.processes[cwd] = process;

    let _loading: LoadingTask | undefined;
    const loading = async (text: string, stop = false) => {
      _loading = _loading ?? (await this.createLoading(data.title));
      _loading.report(text);
      if (stop) {
        _loading.stop();
        _loading = undefined;
      }
    };

    const getMessage = (value: any) => (value.toString() as string).split('\n').join(' ');

    process.stdout?.on('data', async (value) => {
      const message = getMessage(value);
      const finished = message.includes('Succeeded after') ? true : false;
      await loading(message, finished);
      output.write(message);
    });

    process.on('error', async (value) => {
      const message = getMessage(value);
      await loading(message);
      output.write(message);
    });

    process.stderr?.on('data', async (value) => {
      const message = getMessage(value);
      await loading(message);
      output.write(message);
    });

    process.on('exit', async (code) => {
      await loading(`exit ${code}`, true);
      output.write(`exit ${code}`);
      output.close();
      delete this.outputs[cwd];
      delete this.processes[cwd];
    });
  }

  async stop(data: NestTreeItem) {
    const cwd = this.getDirPath(data.resourceUri);
    const process = this.processes[cwd];
    if (process?.pid) {
      const list = await psList();
      const cpids = list.filter((e) => e.ppid === process.pid).map((e) => e.pid); //子线程
      const ccpids = list.filter((e) => cpids.includes(e.ppid)).map((e) => e.pid); //孙子线程
      ccpids.forEach((e) => childProcess.execSync('kill ' + e));
      cpids.forEach((e) => childProcess.execSync('kill ' + e));
    }
  }
}
