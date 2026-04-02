import * as vsc from 'vscode';
import { scanWorkspace } from './lib/workspace-scanner';
import { readYaml } from './lib/yaml-reader';

const GLOB_PATTERN = '**/pubspec.yaml';
const PUBSPEC_YAML_REGEX = /pubspec\.yaml$/;
const LEADING_SLASH_REGEX = /^\//;

interface PubspecYaml {
  name?: unknown;
  dependencies?: Record<string, unknown>;
  dev_dependencies?: Record<string, unknown>;
}

interface FileCacheEntry {
  mtime: number;
  pubspec: PubspecYaml | null;
}

export class LatestRequestController {
  private latestRequestId = 0;

  beginRequest(): number {
    this.latestRequestId += 1;
    return this.latestRequestId;
  }

  isLatestRequest(requestId: number): boolean {
    return requestId === this.latestRequestId;
  }
}

export class ProjectTreeItem extends vsc.TreeItem {
  constructor(
    readonly title: string,
    readonly resourceUri: vsc.Uri,
  ) {
    super(title, vsc.TreeItemCollapsibleState.None);
    this.contextValue = 'file';
    this.command = {
      title: 'Open file',
      command: 'vscode.open',
      tooltip: this.resourceUri.fsPath,
      arguments: [this.resourceUri],
    };
    this.tooltip = this.resourceUri.path;
  }

  get unique(): string {
    return this.resourceUri.fsPath;
  }

  get uniqueBuild(): string {
    return `${this.resourceUri.fsPath}:build`;
  }

  get uniqueWatch(): string {
    return `${this.resourceUri.fsPath}:watch`;
  }
}

class TreeProvider implements vsc.TreeDataProvider<ProjectTreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vsc.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private items: ProjectTreeItem[] = [];

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  setItems(items: ProjectTreeItem[]): void {
    this.items = items;
  }

  getTreeItem(element: ProjectTreeItem): ProjectTreeItem {
    return element;
  }

  getChildren(): ProjectTreeItem[] {
    return this.items;
  }
}

let treeViewDisposable: vsc.Disposable | undefined;
let watcher: vsc.FileSystemWatcher | undefined;
const provider = new TreeProvider();
const yamlCache = new Map<string, FileCacheEntry>();
const loadRequestController = new LatestRequestController();

function triggerTreeDataLoad(): void {
  void loadTreeData().catch((error) => {
    console.error('Failed to load build_runner tree data.', error);
  });
}

export function registerTreeView(context: vsc.ExtensionContext): void {
  treeViewDisposable = vsc.window.registerTreeDataProvider('build_runner_view', provider);
  context.subscriptions.push({ dispose: () => treeViewDisposable?.dispose() });

  watcher = vsc.workspace.createFileSystemWatcher(GLOB_PATTERN);
  context.subscriptions.push(watcher);

  let debounceTimer: NodeJS.Timeout | undefined;
  const debouncedLoad = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      triggerTreeDataLoad();
    }, 300);
  };
  watcher.onDidCreate(debouncedLoad);
  watcher.onDidChange(debouncedLoad);
  watcher.onDidDelete(debouncedLoad);

  context.subscriptions.push({ dispose: () => clearTimeout(debounceTimer) });

  triggerTreeDataLoad();
}

export function refreshTreeView(): void {
  yamlCache.clear();
  triggerTreeDataLoad();
}

async function readYamlWithCache(uri: vsc.Uri, requestId: number): Promise<PubspecYaml | null> {
  const key = uri.toString();
  try {
    const stat = await vsc.workspace.fs.stat(uri);
    const cached = yamlCache.get(key);
    if (cached && cached.mtime === stat.mtime) {
      return cached.pubspec;
    }
    const pubspec = await readYaml(uri) as PubspecYaml | null;

    if (loadRequestController.isLatestRequest(requestId)) {
      yamlCache.set(key, { mtime: stat.mtime, pubspec });
    }

    return pubspec;
  }
  catch {
    if (loadRequestController.isLatestRequest(requestId)) {
      yamlCache.delete(key);
    }

    return null;
  }
}

async function loadTreeData(): Promise<void> {
  const requestId = loadRequestController.beginRequest();
  const results = await scanWorkspace(GLOB_PATTERN);

  const items: ProjectTreeItem[] = [];
  for (const { workspace, fileUris } of results) {
    const pubspecs = await Promise.all(
      fileUris.map(async (uri) => {
        const pubspec = await readYamlWithCache(uri, requestId);
        const deps = pubspec?.dependencies ?? {};
        const devDeps = pubspec?.dev_dependencies ?? {};
        if (!('build_runner' in deps) && !('build_runner' in devDeps))
          return null;

        const relative = uri.fsPath
          .replace(workspace.uri.fsPath, '')
          .replace(PUBSPEC_YAML_REGEX, '')
          .replace(LEADING_SLASH_REGEX, '');
        const name = relative + ((typeof pubspec?.name === 'string') ? pubspec.name : 'unknown_name');
        return new ProjectTreeItem(name, uri);
      }),
    );

    items.push(...pubspecs.filter((item): item is ProjectTreeItem => item !== null));
  }

  items.sort((a, b) => a.title.localeCompare(b.title));

  if (!loadRequestController.isLatestRequest(requestId))
    return;

  provider.setItems(items);

  const hasItems = items.length > 0;
  await vsc.commands.executeCommand('setContext', 'buildRunner.hasItems', hasItems);
  provider.refresh();
}
