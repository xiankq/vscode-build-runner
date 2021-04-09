import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { PubspecModel, TreeModel } from './models/pubspec';

const readYaml = async (uri: vscode.Uri) => {
  const uint8Array = await vscode.workspace.fs.readFile(uri);
  let json: PubspecModel | null;
  try {
    json = yaml.parse(uint8Array.toString());
  } catch (error) {
    json = null;
  }
  return json;
};

/**
 * 按工作区分类，返回有效的有效的pubspec.yaml路径树图
 * @returns
 */
export const scanFile = async (): Promise<TreeModel[]> => {
  //工作区列表
  const workspaces = vscode.workspace.workspaceFolders ?? [];

  const effectListPromises = workspaces.map(async (workspace) => {
    const relativePattern = new vscode.RelativePattern(workspace.uri, '**/pubspec.yaml');
    //工作区内全部pubspec.yaml路径列表
    const pubspecUris = await vscode.workspace.findFiles(relativePattern);

    const pubspecObjsPromises = pubspecUris.map((uri) => readYaml(uri));
    const pubspecObjs = await Promise.all(pubspecObjsPromises);
    //有效的pubspec.yaml路径列表
    const effectList = pubspecObjs.filter((e) => {
      return (
        Object.keys(e?.dependencies ?? {}).includes('build_runner') ||
        Object.keys(e?.dev_dependencies ?? {}).includes('build_runner')
      );
    });
    const ret: TreeModel = {
      name: workspace.name,
      uri: workspace.uri,
      children: effectList.map((e, i) => {
        return {
          name: e!.name,
          uri: pubspecUris[i],
        };
      }),
    };
    return ret;
  });

  const ret = Promise.all(effectListPromises);

  return ret;
};
