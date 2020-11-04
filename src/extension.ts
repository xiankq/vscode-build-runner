import * as vscode from 'vscode';
import WatchService from './watch_service';


export function activate(context: vscode.ExtensionContext) {
	WatchService.instance.registerCommand(context);

}
export function deactivate() { }


