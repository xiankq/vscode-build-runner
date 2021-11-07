import * as vsc from 'vscode';

type EventEmitterTreeItem = TreeViewItem | undefined | void;

export class TreeViewProvider implements vsc.TreeDataProvider<TreeViewItem> {
  private constructor() {}

  private static _instance: TreeViewProvider;
  static get instance() {
    this._instance ??= new TreeViewProvider();
    return this._instance;
  }

  private readonly eventEmitter = new vsc.EventEmitter<EventEmitterTreeItem>();

  readonly refresh = (): void => this.eventEmitter.fire();

  treeList: TreeViewItem[] = [];

  readonly onDidChangeTreeData = this.eventEmitter.event;

  readonly getTreeItem = (element: TreeViewItem) => element;

  readonly getChildren = (element: TreeViewItem) => (!element ? this.treeList : element.children);
}

export class TreeViewItem extends vsc.TreeItem {
  constructor(
    public readonly title: string,
    public readonly resourceUri: vsc.Uri,
    public readonly fileType: vsc.FileType,
    public readonly children?: TreeViewItem[]
  ) {
    super(title, children ? vsc.TreeItemCollapsibleState.Expanded : undefined);
  }

  readonly contextValue = this.fileType === vsc.FileType.Directory ? 'dir' : 'file';
  readonly unique = this.resourceUri.fsPath;

  //点击树图项时的命令
  readonly command =
    this.fileType === vsc.FileType.File
      ? {
          title: 'Open file',
          command: 'vsc.open',
          arguments: [this.resourceUri],
        }
      : undefined;

  readonly tooltip = `${this.resourceUri.path}`;
}
