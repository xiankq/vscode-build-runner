import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { NestTreeItem } from './tree';
import { createLoading, createOutput, LoadingTask, OutputTask } from './util';
import * as os from 'os';

import pidtree = require('pidtree');
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

  /**
   * 创建进程
   * @param data
   * @param type
   * @returns
   */
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
    process = childProcess.spawn('flutter', args, { cwd, shell: os.platform() === 'win32' });
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
      this.processes[cwd]?.kill();
      await loading(`exit ${code}`, true);
      output?.write(`exit ${code}`);
      output?.invalidate();
      delete this.processes[cwd];
    });
  }
  /**
   * 终止进程
   * @param data
   */
  async terminate(data: NestTreeItem) {
    const cwd = this.getDirPath(data.resourceUri);
    const process = this.processes[cwd];

    if (process?.pid) {
      const isWindow = os.platform() === 'win32';
      const kill = isWindow ? 'tskill' : 'kill';
      const pids = await pidtree(process.pid);
      console.log(pids);
      pids?.forEach((cpid) => {
        childProcess.exec(`${kill} ${cpid}`);
      });
    }
    await new Promise<void>((resolve) => {
      const numid = setInterval(() => {
        if (!this.processes[cwd]) {
          clearInterval(numid);
          resolve();
        }
      }, 100);
    });
  }
}
