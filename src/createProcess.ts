import { LoadingService } from './shared/loading';
import { OutputService } from './shared/output';
import { ProcessService } from './shared/process';
import * as vsc from 'vscode';

/**
 * 能力
 * @param args
 * @param type
 * @returns
 */
export const createProcess = async (
  unique: string,
  uri: vsc.Uri,
  title: string,
  type: 'watch' | 'build'
) => {
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
  const commands = [
    'dart',
    'run',
    'build_runner',
    type,
    '--delete-conflicting-outputs',
  ];

  /**
   * #3 添加可配置的fvm前缀
   */
  const fvm = vsc.workspace.getConfiguration().get('build_runner.fvm');
  fvm && commands.unshift('fvm');

  await ProcessService.i.create(unique, uri, commands, (type, value) => {
    switch (type) {
      case 'exit':
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
  });
};
