import * as vsc from 'vscode';

import { readYaml } from "./shared/readYaml";
import { scanFile, ScanFileTree } from "./shared/scanFile";
import { PubspecModel } from "./types/pubspec";


export interface PubspecInfo {
    name: string,
    uri: vsc.Uri,
}
export interface ProjectInfo {
    workspace: vsc.WorkspaceFolder,
    pubspecs: PubspecInfo[]
}
/**
 * 获取所有有效的Pubspec.yaml树
 */
export const getProjectInfos = async () => {
    const trees = await scanFile('**/pubspec.yaml');
    const projectInfos: ProjectInfo[] = [];

    const promises = trees.filter(({ fileUris }) => fileUris.length).map(async ({ workspace, fileUris }) => {
        const projectInfo: ProjectInfo = {
            workspace,
            pubspecs: []
        };
        const _promises = fileUris.map(async uri => {
            const obj = await readYaml(uri) as PubspecModel | null;
            const dependencies = {
                ...obj?.dependencies ?? {},
                ...obj?.dev_dependencies ?? {},
            };
            if (Object.keys(dependencies).includes('build_runner')) {
                const name = obj?.name ?? 'unknown_name';
                projectInfo.pubspecs.push({ name, uri });
            }
        });
        await Promise.all(_promises);
        if (projectInfo.pubspecs.length) {
            projectInfos.push(projectInfo);
        }
    });
    await Promise.all(promises);
    return projectInfos;
};