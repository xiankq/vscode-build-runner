import * as vscode from "vscode";
import { getAllPubspec } from "./lib/getPackages";
export async function activate(context: vscode.ExtensionContext) {
  const [objs] = await getAllPubspec();

  vscode.window.registerTreeDataProvider(
    "build_runner_view",
    BuildRunnerTreeProvider.instance
  );
  for (const item of objs.pubspec) {
    BuildRunnerTreeProvider.instance.items[
      item.uri.path
    ] = new BuildRunnerTreeItem(item.name || item.uri.path);
  }
  BuildRunnerTreeProvider.instance.refresh();
}

export function deactivate() {}

class BuildRunnerTreeItem extends vscode.TreeItem {
  constructor(
    public label: string,
    // public cwd: string,
    // public spawn: child_process.ChildProcessWithoutNullStreams,
    public collapsibleState?: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  //   tooltip = `${this.cwd}`;
}

type EventEmitterTreeItem = BuildRunnerTreeItem | undefined | void;

class BuildRunnerTreeProvider
  implements vscode.TreeDataProvider<BuildRunnerTreeItem> {
  private constructor() {}

  static _instance: BuildRunnerTreeProvider;

  static get instance() {
    this._instance ??= new BuildRunnerTreeProvider();
    return this._instance;
  }

  readonly refresh = (): void => this._onDidChangeTreeData.fire();

  private readonly _onDidChangeTreeData = new vscode.EventEmitter<EventEmitterTreeItem>();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  readonly getTreeItem = (element: BuildRunnerTreeItem) => element;

  items: { [key: string]: BuildRunnerTreeItem } = {};

  readonly getChildren = () =>
    Object.keys(this.items).map((e) => this.items[e]);
}
