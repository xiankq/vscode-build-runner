import * as vscode from "vscode";
import * as yaml from "yaml";
import {
  PubspecModel,
  TreeModel,
} from "../models/pubspec";

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

export const getAllPubspec = async (): Promise<TreeModel[]> => {
  //工作区列表
  const workspaces = vscode.workspace.workspaceFolders ?? [];

  const paths = workspaces.map(() => vscode.workspace.findFiles("**/pubspec.yaml"));

  //每个工作区内的pubspec.yaml路径列表
  const pubspecFilesList = await Promise.all(paths);

  const pubspecObjsPromises = pubspecFilesList.map(async (uris) => {
    const promises = uris.map((uri) => readYaml(uri));
    return await Promise.all(promises);
  });

  //每个工作区内pubspec.yaml转换成的obj
  const _pubspecObjsList = await Promise.all(pubspecObjsPromises);

  //筛选只包含build_runner的obj
  const pubspecObjsList = _pubspecObjsList.map((e) => {
    return e.filter((e) => {
      return (
        Object.keys(e?.dependencies ?? {}).includes("build_runner") ||
        Object.keys(e?.dev_dependencies ?? {}).includes("build_runner")
      );
    });
  });
  //转换成 TreeModel[]
  const ret: TreeModel[] = pubspecObjsList.map((e, i) => {
    return {
      name: workspaces[i].name,
      type: "workspace",
      uri: workspaces[i].uri,
      chilren: e.map(($e, $i) => {
        return {
          name: $e!.name,
          type: "pubspec",
          uri: pubspecFilesList[i][$i],
        };
      }),
    };
  });
  return ret;
};
