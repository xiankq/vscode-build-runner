import * as vscode from "vscode";
import { getAllPubspec } from "./lib/getPackages";
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

class BuildRunnerTreeItem extends vscode.TreeItem {
  constructor(public treeData: TreeModel) {
    super(
      treeData.name,
      treeData.type == "workspace"
        ? vscode.TreeItemCollapsibleState.Collapsed
        : undefined
    );
  }
  readonly tooltip = `${this.treeData.uri.path}`;
}

type EventEmitterTreeItem = BuildRunnerTreeItem | undefined | void;

class BuildRunnerTreeProvider
  implements vscode.TreeDataProvider<BuildRunnerTreeItem> {
  private constructor() {}

  private static _instance: BuildRunnerTreeProvider;

  static get instance() {
    this._instance ??= new BuildRunnerTreeProvider();
    return this._instance;
  }

  private readonly eventEmitter = new vscode.EventEmitter<EventEmitterTreeItem>();

  readonly refresh = (): void => this.eventEmitter.fire();

  readonly onDidChangeTreeData = this.eventEmitter.event;

  readonly getTreeItem = (element: BuildRunnerTreeItem) => element;

  items: BuildRunnerTreeItem[] = [];

  readonly getChildren = (element: BuildRunnerTreeItem) => {
    if (!element) {
      return this.items;
    } else {
      return element.treeData.chilren?.map((e) => new BuildRunnerTreeItem(e));
    }
  };
}
