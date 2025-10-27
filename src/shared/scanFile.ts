import { createFilter } from "@rollup/pluginutils";
import * as vsc from "vscode";

export interface ScanFileTree {
  workspace: vsc.WorkspaceFolder;
  fileUris: vsc.Uri[];
}

/**
 * 扫描全部工作区中与 pattern 匹配的文件
 * @param pattern
 */
export const scanFile = async (pattern: string): Promise<ScanFileTree[]> => {
  const excludes: string[] | undefined = vsc.workspace
    .getConfiguration()
    .get("build_runner.excludes");
  const filter = createFilter("**/**", excludes);
  const workspaces = vsc.workspace.workspaceFolders ?? [];
  const promises = workspaces.map(async (workspace) => {
    const relativePattern = new vsc.RelativePattern(workspace.uri, pattern);
    const fileUris = await vsc.workspace.findFiles(relativePattern);

    return {
      workspace,
      fileUris: fileUris.filter(filter),
    };
  });
  const tree = await Promise.all(promises);
  return tree.filter((e) => !!e.fileUris.length);
};
