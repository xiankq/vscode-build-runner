import * as vsc from "vscode";

export interface ScanFileTree {
    workspace: vsc.WorkspaceFolder,
    fileUris: vsc.Uri[]
}

/**
 * 扫描全部工作区中与 pattern 匹配的文件
 * @param pattern   
 */
export const scanFile = async (pattern: string): Promise<ScanFileTree[]> => {
    const workspaces = vsc.workspace.workspaceFolders ?? [];
    const promises = workspaces.map(async (workspace) => {
        const relativePattern = new vsc.RelativePattern(workspace.uri, pattern);
        const fileUris = await vsc.workspace.findFiles(relativePattern);
        return {
            workspace,
            fileUris
        };
    });
    return Promise.all(promises);
};
