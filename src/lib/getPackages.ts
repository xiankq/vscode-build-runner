import * as vscode from "vscode";
import * as yaml from "yaml";
import {
  PubspecModel,
  PubspecTreeModel,
  PubspecTreePubspecModel,
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

export const getAllPubspec = async (): Promise<PubspecTreeModel[]> => {
  //工作区列表
  const workspaces = vscode.workspace.workspaceFolders ?? [];

  const paths = workspaces.map(async (e) => {
    return vscode.workspace.findFiles("**/pubspec.yaml");
  });

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

  //转换成PubspecTreeModel[]
  const ret: PubspecTreeModel[] = pubspecObjsList.map((e, i) => {
    const pubspec: PubspecTreePubspecModel[] = e.map(($e, $i) => {
      return {
        name: $e!.name,
        uri: pubspecFilesList[i][$i],
      };
    });

    //根据字母排序
    const sort = (s: PubspecTreePubspecModel, t: PubspecTreePubspecModel) => {
      const a = s.name?.toLowerCase() ?? "";
      const b = t.name?.toLowerCase() ?? "";
      return a < b ? -1 : a > b ? 1 : 0;
    };
    return <PubspecTreeModel>{
      workspace: workspaces[i],
      pubspec: pubspec.sort(sort),
    };
  });
  console.log(ret);
  return ret;
};
