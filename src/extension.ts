import * as vscode from "vscode";
import { getAllPubspec } from "./lib/getPackages";
import { BuildRunnerTreeItem, BuildRunnerTreeProvider } from "./lib/tree";
import { TreeModel } from "./models/pubspec";
export async function activate(context: vscode.ExtensionContext) {
  const list = await getAllPubspec();

  vscode.window.registerTreeDataProvider(
    "build_runner_view",
    BuildRunnerTreeProvider.instance
  );

  BuildRunnerTreeProvider.instance.items = list.map(
    (e) => new BuildRunnerTreeItem(e)
  );

  BuildRunnerTreeProvider.instance.refresh();
}

export function deactivate() {}
