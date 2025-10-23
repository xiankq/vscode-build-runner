import * as vsc from "vscode";
import { readYaml } from "./shared/readYaml";
import { scanFile } from "./shared/scanFile";
import { TreeViewItem, TreeViewProvider } from "./shared/treeView";
import { PubspecModel } from "./types/pubspec";

const globPattern = "**/pubspec.yaml";

interface PubspecInfo {
  name: string;
  uri: vsc.Uri;
}
interface ProjectInfo {
  workspace: vsc.WorkspaceFolder;
  pubspecs: PubspecInfo[];
}

let treeViewDisposable: vsc.Disposable | undefined;

export const createTreeView = () => {
  load();
  const watcher = vsc.workspace.createFileSystemWatcher(globPattern);
  watcher.onDidCreate(() => load());
  watcher.onDidChange(() => load());
  watcher.onDidDelete(() => load());
};

const load = async () => {
  const infos = await getProjectInfos();
  const treeList = infos.map(({ workspace, pubspecs }) => {
    return new TreeViewItem(
      workspace.name,
      workspace.uri,
      vsc.FileType.Directory,
      pubspecs.map(({ name, uri }) => {
        return new TreeViewItem(name, uri, vsc.FileType.File);
      })
    );
  });
  console.log(treeList);

  if (treeList.length) {
    treeViewDisposable ??= vsc.window.registerTreeDataProvider(
      "build_runner_view",
      TreeViewProvider.instance
    );
    TreeViewProvider.instance.treeList = treeList;
    TreeViewProvider.instance.refresh();
  } else {
    treeViewDisposable?.dispose?.();
  }
};

/**
 * 获取所有有效的Pubspec.yaml树
 */
export const getProjectInfos = async () => {
  const config = vsc.workspace.getConfiguration('build_runner'); 
  const excludePatterns: string[] = config.get('exclude', ['ios/.symlinks/plugins/']);

  const trees = await scanFile(globPattern);
  const projectInfos: ProjectInfo[] = [];

  const promises = trees
    .filter(({ fileUris }) => fileUris.length)
    .map(async ({ workspace, fileUris }) => {
      const projectInfo: ProjectInfo = {
        workspace,
        pubspecs: [],
      };

      // Filter fileUris before processing
      const filteredFileUris = fileUris.filter(uri => {
        // Get the path of the pubspec.yaml relative to the workspace folder
        const relativePath = uri.fsPath.replace(workspace.uri.fsPath, '');
        
        // Check if the relative path includes any of the exclude patterns
        for (const pattern of excludePatterns) {
          if (relativePath.includes(pattern)) {
            return false; // Exclude this file
          }
        }
        return true; // Include this file
      });

      const _promises = filteredFileUris.map(async (uri) => {
        const obj = (await readYaml(uri)) as PubspecModel | null;
        const dependencies = {
          ...(obj?.dependencies ?? {}),
          ...(obj?.dev_dependencies ?? {}),
        };
        if (Object.keys(dependencies).includes("build_runner")) {
          const relative = uri.fsPath
            .replace(projectInfo?.workspace.uri.fsPath, "")
            .replace(/pubspec\.yaml$/, "");
          let name = relative + (obj?.name ?? "unknown_name");
          name = name.replace(/^\//, "");
          projectInfo.pubspecs.push({ name, uri });
        }
      });
      await Promise.all(_promises);
      if (projectInfo.pubspecs.length) {
        projectInfos.push(projectInfo);
      }
    });
  await Promise.all(promises);
  //排序
  projectInfos.sort((a, b) => {
    const $a = a.workspace.name;
    const $b = b.workspace.name;
    return $a < $b ? -1 : $a > $b ? 1 : 0;
  });
  for (const projectInfo of projectInfos) {
    projectInfo.pubspecs.sort((a, b) => {
      const $a = a.name;
      const $b = b.name;
      return $a < $b ? -1 : $a > $b ? 1 : 0;
    });
  }
  return projectInfos;
};
