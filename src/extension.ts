import * as vscode from "vscode";
import { BuildRunnerCommand } from "./lib/command";
import { getAllPubspec } from "./lib/getPackages";
import { NestTreeItem, NestTreeProvider } from "./lib/tree";
import { TreeModel } from "./models/pubspec";






export async function activate(context: vscode.ExtensionContext) {



  vscode.window.registerTreeDataProvider("build_runner_view", NestTreeProvider.instance);

  BuildRunnerCommand.instance.register(context);
  const nestList = await getAllPubspec();
  const recurse = (data: TreeModel): NestTreeItem => {
    return new NestTreeItem(
      data.name,
      data.uri,
      data.children?.map(e => recurse(e))
    );
  };
  NestTreeProvider.instance.treeList = nestList.map(e => recurse(e));
  NestTreeProvider.instance.refresh();

}

export function deactivate() { }
