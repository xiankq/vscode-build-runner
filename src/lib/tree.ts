import * as vscode from "vscode";
import { TreeModel } from "../models/pubspec";

type EventEmitterTreeItem = BuildRunnerTreeItem | undefined | void;

export class BuildRunnerTreeProvider
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

export class BuildRunnerTreeItem extends vscode.TreeItem {
  constructor(public treeData: TreeModel) {
    super(
      treeData.name,
      treeData.type === "workspace"
        ? vscode.TreeItemCollapsibleState.Collapsed
        : undefined
    );
  }
  readonly tooltip = `${this.treeData.uri.path}`;
}
