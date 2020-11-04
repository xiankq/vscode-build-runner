import * as vscode from 'vscode';
import { PubspecModel } from './interface';
import { readYaml } from './util';
import * as path from 'path';
import * as child_process from "child_process";

/**
 * build_runner watch单例
 */
export default class WatchService {
    private static _instance: WatchService;
    public static get instance() {
        WatchService._instance = WatchService._instance ?? new WatchService();
        return WatchService._instance;
    }
    /**
     * 注册命令
     * @param context 
     */
    public registerCommand(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'build_runner.watch',
                (uri: vscode.Uri) => this.command(uri, context)
            )
        );
    }
    private _outputChannel: vscode.OutputChannel | undefined;
    /**
     * 输出通道
     */
    private get outputChannel(): vscode.OutputChannel {
        this._outputChannel = this._outputChannel ?? vscode.window.createOutputChannel('build_runner');
        return this._outputChannel;
    };

    /**
    * 停止单个Package的build_runner watch
    */
    private quitWatchCommand(cwd: string) {
        const item = BuildRunnerTreeProvider.instance?.items[cwd];
        if (item) {
            const spawn = BuildRunnerTreeProvider.instance?.items[cwd]?.spawn;
            spawn?.kill();
            delete BuildRunnerTreeProvider.instance.items[cwd];
            BuildRunnerTreeProvider.instance.refresh();
        }
    }
    /**
     * 命令回调
     * @param uri 
     * @param context 
     */
    private async command(uri: vscode.Uri, context: vscode.ExtensionContext) {
        const pubspec = <PubspecModel>await readYaml(uri);
        //解析yaml错误
        if (!pubspec) {
            this.outputChannel.appendLine(`${uri.fsPath} Invalid format on ${uri.fsPath}`);
            return;
        }
        const keys1 = Object.keys(pubspec?.dependencies ?? {}) ?? [];
        const keys2 = Object.keys(pubspec?.dev_dependencies ?? {}) ?? [];
        const include = [...keys1, ...keys2].includes('build_runner');
        //不存在 build_runner
        if (!include) {
            this.outputChannel.clear();
            const packageMame = pubspec.name ?? 'unknown';
            this.outputChannel.appendLine(`[${packageMame}] No build_runner were found in the package.`);
            this.outputChannel.show();
            return;
        }
        //包名
        const packageName = pubspec?.name ?? 'unknown';
        //运行命令的路径
        const cwd = path.join(uri.fsPath, '../');
    }
}


/**
 * 当前已启动的watch列表
 */
class BuildRunnerTreeProvider implements vscode.TreeDataProvider<BuildRunnerTreeItem>{
    private static _instance: BuildRunnerTreeProvider;
    /**
     * 单例
     */
    public static get instance(): BuildRunnerTreeProvider {
        BuildRunnerTreeProvider._instance = BuildRunnerTreeProvider._instance ?? new BuildRunnerTreeProvider();
        return BuildRunnerTreeProvider._instance;
    }
    public items: { [key: string]: BuildRunnerTreeItem } = {};

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    private _onDidChangeTreeData: vscode.EventEmitter<BuildRunnerTreeItem | undefined | void> = new vscode.EventEmitter<BuildRunnerTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<BuildRunnerTreeItem | undefined | void> = this._onDidChangeTreeData.event;


    getTreeItem(element: BuildRunnerTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: BuildRunnerTreeItem): Promise<BuildRunnerTreeItem[] | null | undefined> {
        return Object.keys(this.items).map(e => this.items[e]);
    }
}

class BuildRunnerTreeItem extends vscode.TreeItem {
    constructor(
        public label: string,
        public cwd: string,
        public spawn: child_process.ChildProcessWithoutNullStreams,
        collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
    tooltip = `${this.cwd}`;
}
