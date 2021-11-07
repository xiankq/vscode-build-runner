import * as vsc from 'vscode';
import { createProcess } from './createProcess';
import { LoadingService } from './shared/loading';
import { OutputService } from './shared/output';
import { ProcessService } from './shared/process';
import { TreeViewItem, TreeViewProvider } from './shared/treeView';
import { getProjectInfos, ProjectInfo } from './tree';

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

  vsc.window.registerTreeDataProvider(
    'build_runner_view',
    TreeViewProvider.instance
  );

  const infos = await getProjectInfos();
  const treeList = infos.map(({ workspace, pubspecs }) => {
    return new TreeViewItem(
      workspace.name,
      workspace.uri,
      vsc.FileType.Directory,
      pubspecs.map(({ name, uri }) => {
        return new TreeViewItem(name, uri, vsc.FileType.File);
      })
    );
  });
  TreeViewProvider.instance.treeList = treeList;
  TreeViewProvider.instance.refresh();
};

// this method is called when your extension is deactivated
export function deactivate() {}

const createTreeView = () => {};
