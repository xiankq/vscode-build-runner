import * as vscode from "vscode";

export interface PubspecModel {
  name: string;
  dependencies: {
    [key: string]: Object | string;
  };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  dev_dependencies: {
    [key: string]: Object | string;
  };
}

//每个工作区内的pub树
export interface PubspecTreeModel {
  workspace: vscode.WorkspaceFolder;
  pubspec: PubspecTreePubspecModel[];
}

export interface PubspecTreePubspecModel {
  uri: vscode.Uri;
  name: string | null;
}

export interface TreeModel {
  name: string;
  type: "workspace" | "pubspec";
  uri: vscode.Uri;
  chilren?: TreeModel[];
}
