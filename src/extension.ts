import * as vsc from 'vscode';
import { LoadingService } from './shared/loading';
import { OutputService } from './shared/output';
import { ProcessService } from './shared/process';
import { TreeViewItem, TreeViewProvider } from './shared/treeView';
import { getProjectInfos, ProjectInfo } from './tree';

export const activate = async (context: vsc.ExtensionContext) => {
  console.log('dart build_runner activate');

  const createProcess = async (args: TreeViewItem, type: 'watch' | 'build') => {
    const { title, resourceUri, unique } = args;
    if (ProcessService.i.find(unique)) {
      const option = await vsc.window.showWarningMessage(
        `The task 'build_runner:(${title})' is already active.`,
        'Terminate',
        'Restart'
      );
      if (option) {
        await ProcessService.i.kill(unique);
        if (option === 'Terminate') {
          return;
        }
      }
    }
    ///
    const output = OutputService.i.create(unique, title, () => {
      ProcessService.i.kill(unique);
    });
    const loading = await LoadingService.i.create(unique, {
      title,
      cancellable: false,
      location: vsc.ProgressLocation.Window,
    });

    const process = await ProcessService.i.create(
      unique,
      resourceUri,
      ['flutter', 'pub', 'run', 'build_runner', type, '--delete-conflicting-outputs'],
      (type, value) => {
        switch (type) {
          case 'exit':
            console.log('exit');
            output.unActivate();
            loading.hide();
          default:
            const message = `${value}`.split('\n').join(' ');
            output.write(message);
            loading.progress.report({ message });
            const finished = message.includes('Succeeded after') ? true : false;
            finished && loading.hide();
            break;
        }
      }
    );
  };

  const register = (command: string, callback: (...args: any[]) => any, thisArg?: any) => {
    return context.subscriptions.push(vsc.commands.registerCommand(command, callback, thisArg));
  };

  register('build_runner.watch', (args: TreeViewItem) => createProcess(args, 'watch'));
  register('build_runner.build', (args: TreeViewItem) => createProcess(args, 'build'));
  register('build_runner.quit', (args: TreeViewItem) => {
    ProcessService.i.kill(args.unique);
  });

  vsc.window.registerTreeDataProvider('build_runner_view', TreeViewProvider.instance);

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
