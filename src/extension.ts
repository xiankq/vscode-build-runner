import * as vscode from 'vscode';
import { scanFile } from './scanFile';
import { Process } from './process';
import { NestTreeItem, NestTreeProvider } from './tree';
import { TreeModel } from './models/pubspec';
import * as os from 'os';
export async function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('build_runner_view', NestTreeProvider.instance);

  const register = (command: string, callback: (...args: any[]) => any, thisArg?: any) => {
    return context.subscriptions.push(vscode.commands.registerCommand(command, callback, thisArg));
  };
  console.log(os.platform());

  register('build_runner.watch', (args: NestTreeItem) => Process.instance.create(args, 'watch'));
  register('build_runner.build', (args: NestTreeItem) => Process.instance.create(args, 'build'));
  register('build_runner.terminate', (args: NestTreeItem) => Process.instance.stop(args));

  const nestList = await scanFile();

  const recurse = (data: TreeModel): NestTreeItem => {
    return new NestTreeItem(
      data.name,
      data.uri,
      data.children?.map((e) => recurse(e))
    );
  };

  NestTreeProvider.instance.treeList = nestList.map((e) => recurse(e));
  NestTreeProvider.instance.refresh();
}

export function deactivate() {}
