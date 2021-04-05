import * as vscode from "vscode";
import { TreeModel } from "../models/pubspec";

type EventEmitterTreeItem = NestTreeItem | undefined | void;

export class BuildRunnerTreeProvider
  implements vscode.TreeDataProvider<NestTreeItem> {
  private constructor() { }

  private static _instance: BuildRunnerTreeProvider;

  static get instance() {
    this._instance ??= new BuildRunnerTreeProvider();
    return this._instance;
  }

  private readonly eventEmitter = new vscode.EventEmitter<EventEmitterTreeItem>();

  readonly refresh = (): void => this.eventEmitter.fire();

  readonly onDidChangeTreeData = this.eventEmitter.event;

  readonly getTreeItem = (element: NestTreeItem) => element;

  items: NestTreeItem[] = [];

  readonly getChildren = (element: NestTreeItem) => {
    if (!element) {
      return this.items;
    } else {
      return element.data.chilren?.map((e) => new NestTreeItem(e));
    }
  };
}

export class NestTreeItem extends vscode.TreeItem {
  constructor(
    public readonly title: string,
    public readonly type: 'workspace' | 'pubspec',
    public readonly resourceUri: vscode.Uri,
    public readonly children: NestTreeItem[],

  ) {
    super(
      title,
      type === "workspace" ? vscode.TreeItemCollapsibleState.Collapsed : undefined
    );
  }
  readonly command = {
    title: 'Open file',
    command: 'build_runner.openFile',
    arguments: [this.resourceUri]
  };

  readonly tooltip = `${this.resourceUri.path}`;
}
