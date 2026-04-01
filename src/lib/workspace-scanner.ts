import { createFilter } from '@rollup/pluginutils';
import * as vsc from 'vscode';

export interface WorkspaceScanResult {
  workspace: vsc.WorkspaceFolder;
  fileUris: vsc.Uri[];
}

export async function scanWorkspace(pattern: string): Promise<WorkspaceScanResult[]> {
  const excludes: string[] | undefined = vsc.workspace
    .getConfiguration()
    .get('build_runner.excludes');

  const filter = createFilter('**/**', excludes);
  const workspaces = vsc.workspace.workspaceFolders ?? [];

  const results = await Promise.all(
    workspaces.map(async (workspace) => {
      const relativePattern = new vsc.RelativePattern(workspace.uri, pattern);
      const fileUris = await vsc.workspace.findFiles(relativePattern);

      return {
        workspace,
        fileUris: fileUris.filter(uri => filter(uri.fsPath)),
      };
    }),
  );

  return results.filter(result => result.fileUris.length > 0);
}
