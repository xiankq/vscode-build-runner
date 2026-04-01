import type { ProjectTreeItem } from './tree-view';
import * as vsc from 'vscode';
import { createTask } from './tasks';
import { refreshTreeView, registerTreeView } from './tree-view';

export async function activate(context: vsc.ExtensionContext) {
  context.subscriptions.push(
    vsc.commands.registerCommand(
      'build_runner.watch',
      (item: ProjectTreeItem) => createTask(item.uniqueWatch, item.resourceUri, item.title, 'watch'),
    ),
    vsc.commands.registerCommand(
      'build_runner.build',
      (item: ProjectTreeItem) => createTask(item.uniqueBuild, item.resourceUri, item.title, 'build'),
    ),
    vsc.commands.registerCommand(
      'build_runner.refresh',
      () => refreshTreeView(),
    ),
  );

  registerTreeView(context);
}

export function deactivate() {}
