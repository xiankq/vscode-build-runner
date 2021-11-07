import * as vsc from 'vscode';
import { createProcess } from './createProcess';
import { createTreeView } from './createTreeView';
import { ProcessService } from './shared/process';
import { TreeViewItem } from './shared/treeView';

export const activate = async (context: vsc.ExtensionContext) => {
  console.log('dart build_runner activate');

  const register = (
    command: string,
    callback: (...args: any[]) => any,
    thisArg?: any
  ) => {
    return context.subscriptions.push(
      vsc.commands.registerCommand(command, callback, thisArg)
    );
  };

  register(
    'build_runner.watch',
    ({ unique, title, resourceUri }: TreeViewItem) =>
      createProcess(unique, resourceUri, title, 'watch')
  );
  register(
    'build_runner.build',
    ({ unique, title, resourceUri }: TreeViewItem) =>
      createProcess(unique, resourceUri, title, 'build')
  );

  register('build_runner.quit', ({ unique }: TreeViewItem) => {
    ProcessService.i.kill(unique);
  });

  createTreeView();
};

// this method is called when your extension is deactivated
export function deactivate() {}
