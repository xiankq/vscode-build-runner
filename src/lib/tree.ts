import * as vscode from "vscode";
import { BuildRunnerCommand } from "./command";

type EventEmitterTreeItem = NestTreeItem | undefined | void;

export class NestTreeProvider implements vscode.TreeDataProvider<NestTreeItem> {
  private constructor() { }

  private static _instance: NestTreeProvider;
  static get instance() {
    this._instance ??= new NestTreeProvider();
    return this._instance;
  }


  private readonly eventEmitter = new vscode.EventEmitter<EventEmitterTreeItem>();

  readonly refresh = (): void => this.eventEmitter.fire();

  treeList: NestTreeItem[] = [];

  readonly onDidChangeTreeData = this.eventEmitter.event;

  readonly getTreeItem = (element: NestTreeItem) => element;

  readonly getChildren = (element: NestTreeItem) => !element ? this.treeList : element.children;

}




export class NestTreeItem extends vscode.TreeItem {
  constructor(
    public readonly title: string,
    public readonly resourceUri: vscode.Uri,
    public readonly children?: NestTreeItem[],

  ) {
    super(
      title,
      children ? vscode.TreeItemCollapsibleState.Collapsed : undefined
    );
  }
  private isDir = this.children ? 'dir' : 'file';

  private isRunning = BuildRunnerCommand.instance.isRunning(this.resourceUri);

  readonly contextValue = this.isRunning ? 'running' : this.children ? 'dir' : 'file';

  //点击树图项时的命令
  readonly command = this.isDir === 'file' ? {
    title: 'Open file',
    command: 'vscode.open',
    arguments: [this.resourceUri]
  } : undefined;

  readonly tooltip = `${this.resourceUri.path}`;
}
