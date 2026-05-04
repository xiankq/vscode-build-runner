import * as vsc from 'vscode';
import { readYaml } from './lib/yaml-reader';

export async function createTask(unique: string, uri: vsc.Uri, title: string, type: 'watch' | 'build', isWorkspace: boolean = false) {
  const cwd = uri.fsPath.endsWith('.yaml') || uri.fsPath.endsWith('.yml')
    ? vsc.Uri.joinPath(uri, '..').fsPath
    : uri.fsPath;

  const fvm = vsc.workspace.getConfiguration().get('build_runner.fvm');
  const args = vsc.workspace.getConfiguration().get('build_runner.args', '--delete-conflicting-outputs');
  const commandParts = [`${fvm ? 'fvm ' : ''}dart run build_runner ${type}`, args];
  if (isWorkspace) {
    commandParts.push('--workspace');
  }
  const command = commandParts.join(' ');

  const pubspec = await readYaml(uri);
  const name = (typeof pubspec?.name === 'string') ? pubspec.name : title;

  const task = new vsc.Task(
    { type: 'build_runner', unique },
    vsc.TaskScope.Workspace,
    `${type}: ${name}`,
    'build_runner',
    new vsc.ShellExecution(command, { cwd }),
  );

  task.presentationOptions = {
    reveal: vsc.TaskRevealKind.Always,
    panel: vsc.TaskPanelKind.Shared,
    clear: false,
    close: false,
    showReuseMessage: false,
  };

  const execution = await vsc.tasks.executeTask(task);

  const disposeEndListener = vsc.tasks.onDidEndTaskProcess((e) => {
    if (e.execution !== execution) {
      return;
    }

    if (e.exitCode) {
      vsc.window.showErrorMessage(`Task '${task.name}' failed with exit code ${e.exitCode}.`);
    }
    disposeEndListener.dispose();
  });
}
