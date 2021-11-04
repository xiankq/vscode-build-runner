// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getProjectInfos } from './tree';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = async (context: vscode.ExtensionContext) => {
	console.log('dart build_runner activate');
	const res = await getProjectInfos();
	console.log(res);

};

// this method is called when your extension is deactivated
export function deactivate() { }
