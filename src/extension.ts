import * as vscode from 'vscode';
import { getAllPubspec } from './getPackages';
import { Process } from './process';
import { NestTreeItem, NestTreeProvider } from './tree';
import { TreeModel } from './models/pubspec';

export async function activate(context: vscode.ExtensionContext) {
  vscode.window.registerTreeDataProvider('build_runner_view', NestTreeProvider.instance);

  const commands = [
    vscode.commands.registerCommand('build_runner.watch', (args: NestTreeItem) => Process.instance.create(args, 'watch')),
    vscode.commands.registerCommand('build_runner.build', (args: NestTreeItem) => Process.instance.create(args, 'build')),
    vscode.commands.registerCommand('build_runner.terminate', (args: NestTreeItem) => Process.instance.stop(args)),
  ];
  context.subscriptions.push.apply(context.subscriptions, commands);

  const nestList = await getAllPubspec();
  const recurse = (data: TreeModel): NestTreeItem => {
    return new NestTreeItem(
      data.name,
      data.uri,
      data.children?.map((e) => recurse(e))
    );
  };
  console.log(nestList.map((e) => recurse(e)));

  NestTreeProvider.instance.treeList = nestList.map((e) => recurse(e));
  NestTreeProvider.instance.refresh();
}

export function deactivate() {}
