import * as vscode from 'vscode';
import { PubspecObject } from './interface';
import { readYaml } from './util';
import * as path from 'path';
import * as child_process from "child_process";


export function activate(context: vscode.ExtensionContext) {
	Service.instance.registerCommand(context);

}
export function deactivate() { }


/**
 *  单例
 */
class Service {
	private static _instance: Service;
	public static get instance() {
		Service._instance = Service._instance ?? new Service();
		return Service._instance;
	}
	/**
	 * 注册命令
	 * @param context 
	 */
	public registerCommand(context: vscode.ExtensionContext) {
		vscode.window.registerTreeDataProvider('build_runner_view', BuildRunnerTreeProvider.instance);
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'build_runner.watch',
				(uri) => this.watchCommand(uri)
			),
		);
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'build_runner.watch.refresh',
				(args: BuildRunnerTreeItem) => this.refreshWatchCommand(args)
			),
		);
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'build_runner.watch.quit',
				(args: BuildRunnerTreeItem) => this.quitWatchCommand(args.cwd)
			),
		);
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'build_runner.build',
				(uri) => this.buildCommand(uri)
			),
		);
		context.subscriptions.push(
			vscode.commands.registerCommand(
				'build_runner.build.all',
				(uri) => this.buildallCommand(uri)
			),
		);
	}
	/**
	 * 输出通道
	 */
	private _outputChannel: vscode.OutputChannel | undefined;
	/**
	 * 输出通道
	 */
	private get outputChannel(): vscode.OutputChannel {
		this._outputChannel = this._outputChannel ?? vscode.window.createOutputChannel('build_runner');
		return this._outputChannel;
	};


	/**
	* 运行build_runner watch
	*/
	private async watchCommand(uri: vscode.Uri) {
		const pubspec = <PubspecObject>await readYaml(uri);
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
			const packageName = pubspec.name ?? 'unknown';
			this.outputChannel.appendLine(`[${packageName}] No build_runner were found in the package.`);
			this.outputChannel.show();
			return;
		}
		//包名
		const packageName = pubspec?.name ?? 'unknown';
		//运行命令的路径
		const cwd = path.join(uri.fsPath, '../');

		this.quitWatchCommand(cwd);
		const spawn = child_process.spawn('flutter packages pub run build_runner watch --delete-conflicting-outputs', [], {
			windowsVerbatimArguments: true,
			cwd: cwd,
			shell: true
		});
		BuildRunnerTreeProvider.instance.items[cwd] = new BuildRunnerTreeItem(packageName, cwd, spawn, vscode.TreeItemCollapsibleState.None);
		const item = BuildRunnerTreeProvider.instance.items[cwd];
		const sp = item.spawn;

		sp.stderr.on('data', (data) => {
			this.outputChannel.show();
			this.outputChannel.append(`[${packageName}] Error: ${data}\n`);
		});
		//储存一个方法  用来控制loading
		let report: ((increment: number) => void) | undefined;
		sp.stdout.on('data', async (data) => {
			if (!report) {
				vscode.window.withProgress<(increment: number) => void>({
					location: vscode.ProgressLocation.Window,
					title: `[${packageName}]  build_runner watch`,
					cancellable: true
				}, (progress) => {
					return new Promise((resolve, reject) => {
						report = (increment: number) => {
							progress.report({ message: undefined, increment: increment });
							report = undefined;
							resolve();
						};
					});
				});
			}
			if (data.indexOf('Succeeded after') !== -1) {
				report?.(100);
			}
		});
		sp.on('exit', (code) => {
			report?.(100);
			this.quitWatchCommand(cwd);
		});
		BuildRunnerTreeProvider.instance.refresh();
	}


	/**
	 * 停止build_runner watch
	 * @param cwd 
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
	* 刷新build_runner watch
	*/
	private async refreshWatchCommand(args: BuildRunnerTreeItem) {
		const instance = BuildRunnerTreeProvider.instance;
		const cwd = args.cwd;
		this.quitWatchCommand(cwd);
		delete instance.items[cwd];
		BuildRunnerTreeProvider.instance.refresh();
		const filePath = path.join(`${cwd}`, 'pubspec.yaml');
		const uri = vscode.Uri.file(filePath);
		await new Promise<void>((resolve, reject) => {
			setTimeout(() => {
				resolve();
			}, 1000);
		});
		this.watchCommand(uri);
	}


	/**
	* 运行build_runner build
	*/
	private async buildCommand(uri: vscode.Uri) {
		const pubspec = <PubspecObject>await readYaml(uri);
		//解析yaml错误
		if (!pubspec) {
			this.outputChannel.appendLine(`${uri.fsPath} Invalid format on ${uri.fsPath}`);
			return;
		}
		const keys1 = Object.keys(pubspec?.dependencies ?? {}) ?? [];
		const keys2 = Object.keys(pubspec?.dev_dependencies ?? {}) ?? [];
		const include = [...keys1, ...keys2].includes('build_runner');
		if (!include) {
			this.outputChannel.clear();
			const packageName = pubspec.name ?? 'unknown';
			this.outputChannel.appendLine(`[${packageName}] No build_runner were found in the package.`);
			this.outputChannel.show();
			return;
		}
		this.runBuildRunnerBuild(uri);
	}


	/**
	* 运行全部build_runner build
	*/
	private async buildallCommand(uri: vscode.Uri) {
		const res = await vscode.window.showInformationMessage('为工作区内的所有pubspec.yaml运行build_runner build，此过程可能会持续较长时间，是否继续？', '是', '否');
		if (res !== '是') {
			return;
		}
		//扫描工作区内下所有pub.yaml文件
		const uris = await vscode.workspace.findFiles('**/pubspec.yaml');
		this.outputChannel.clear();
		if (uris.length === 0) {
			this.outputChannel.appendLine('No pubspec.yaml were found in the workspace.');
			this.outputChannel.show();
			return;
		}
		for (const iterator of uris) {
			const msg = await this.runBuildRunnerBuild(iterator);
			if (msg === 'quit') {
				break;
			}
		}
	}
	/**
		 * 填入pubspec.yaml路径，运行 build_runner build
		 * @param uri pubspec.yaml URI
		 * @param onQuit 点击取消时触发
		 */
	private async runBuildRunnerBuild(uri: vscode.Uri): Promise<'quit' | 'error' | 'exit' | undefined> {
		const pubspec = <PubspecObject>await readYaml(uri);
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
			const packageName = pubspec.name ?? 'unknown';
			this.outputChannel.appendLine(`[${packageName}] No build_runner were found in the package.`);
			this.outputChannel.show();
			return;
		}
		//包名
		const packageName = pubspec.name ?? 'unknown';
		//运行命令的路径
		const cwd = path.join(uri.fsPath, '../');

		return await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: `[${packageName}] run build_runner build`,
			cancellable: true
		}, (progress, token) => {
			return new Promise((resolve, reject) => {
				this.outputChannel.append(`[${packageName}] run build_runner build...\n`);
				const spawn = child_process.spawn('flutter packages pub run build_runner build --delete-conflicting-outputs', [], {
					windowsVerbatimArguments: true,
					cwd: cwd,
					shell: true
				});
				token.onCancellationRequested(() => {
					this.outputChannel.append(`[${packageName}] emit quit.\n`);
					spawn.emit('close');
					spawn.kill();
					resolve('quit');
				});
				spawn.stdout.on('data', (data) => {
					progress.report({ message: `${data}` });
				});
				spawn.stderr.on('data', (data) => {
					progress.report({ message: undefined, increment: 100 });
					this.outputChannel.append(`[${packageName}] Error: ${data}\n`);
					this.outputChannel.show();
				});
				spawn.on('exit', (code) => {
					spawn.kill();
					this.outputChannel.append(`[${packageName}] exit code ${code}\n\n\n\n`);
					progress.report({ message: undefined, increment: 100 });
					resolve('exit');
				});
			});
		});
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
