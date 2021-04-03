import * as vscode from "vscode";
import { BuildRunnerCommand } from "./lib/command";
import { getAllPubspec } from "./lib/getPackages";
import { BuildRunnerTreeItem, BuildRunnerTreeProvider } from "./lib/tree";
import { TreeModel } from "./models/pubspec";
export async function activate(context: vscode.ExtensionContext) {
  const list = await getAllPubspec();
  console.log(list);

  vscode.window.registerTreeDataProvider(
    "build_runner_view",
    BuildRunnerTreeProvider.instance
  );

  BuildRunnerTreeProvider.instance.items = list.map(
    (e) => new BuildRunnerTreeItem(e)
  );

  BuildRunnerTreeProvider.instance.refresh();

  BuildRunnerCommand.instance.watchCommand(
    vscode.Uri.parse(
      "/Users/kaiqun/Desktop/vietnam-freight/app_package/pubspec.yaml"
    ),
    "app_package"
  );
}

export function deactivate() {}
