import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import psList = require('ps-list');
import { NestTreeItem } from './tree';
import { createLoading, createOutput, LoadingTask, OutputTask } from './util';
import * as os from 'os';
interface Processes {
  [key: string]: childProcess.ChildProcess;
}

type Outputs = {
  [key: string]: OutputTask;
};

export class Process {
  private static _instance: Process;
  public static get instance() {
    this._instance = this._instance ?? new Process();
    return this._instance;
  }

  getDirPath(uri: vscode.Uri) {
    return fs.statSync(uri.fsPath).isFile() ? vscode.Uri.joinPath(uri, '../').fsPath : uri.fsPath;
  }

  private processes: Processes = {};
  private outputs: Outputs = {};

  async create(data: NestTreeItem, type: 'watch' | 'build') {
    const cwd = this.getDirPath(data.resourceUri);
    const args = ['pub', 'run', 'build_runner', type, '--delete-conflicting-outputs'];

    this.outputs[cwd] = this.outputs[cwd] ?? (await createOutput(data.title, () => this.terminate(data)));
    const output = this.outputs[cwd];
    output.activate();

    let process = this.processes[cwd];
    if (process) {
      const outputIsShow = await output.isShow();
      if (!outputIsShow) {
        return output.show();
      }

      const option = await vscode.window.showWarningMessage(
        `The task 'build_runner:(${data.title})' is already active.`,
        'Terminate Task',
        'Restart Task'
      );

      if (option === 'Terminate Task') {
        return await this.terminate(data);
      } else if (option === 'Restart Task') {
        await this.terminate(data);
      } else {
        return;
      }
    }
    output.activate();
    let _loading: LoadingTask | undefined;
    const loading = async (text: string, stop = false) => {
      _loading = _loading ?? (await createLoading(data.title));
      _loading.report(text);
      if (stop) {
        _loading.stop();
        _loading = undefined;
      }
    };

    output.show();
    output.write(cwd);
    output.write(['flutter', ...args].join(' '));
    await loading(['flutter', ...args].join(' '));
    process = childProcess.spawn('flutter', args, { cwd });
    this.processes[cwd] = process;

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
      output?.write(`exit ${code}`);
      output?.invalidate();
      delete this.processes[cwd];
    });
  }
  /**
   *
   * @param data
   */
  async terminate(data: NestTreeItem) {
    const cwd = this.getDirPath(data.resourceUri);
    const process = this.processes[cwd];
    if (process?.pid) {
      const list = await psList();
      const cpids = list.filter((e) => e.ppid === process.pid).map((e) => e.pid); //子线程
      const ccpids = list.filter((e) => cpids.includes(e.ppid)).map((e) => e.pid); //孙子线程

      const kill = os.platform() === 'win32' ? 'tskill ' : 'kill ';
      ccpids.forEach((e) => childProcess.execSync(kill + e));
      cpids.forEach((e) => childProcess.execSync(kill + e));
    }
    let numid: NodeJS.Timeout;
    await new Promise<void>((resolve) => {
      numid = setInterval(() => {
        if (!this.processes[cwd]) {
          clearInterval(numid);
          resolve();
        }
      }, 100);
    });
  }
}
