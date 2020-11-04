import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as fs from 'fs';

/**
 * 读取YAML文件，并转换为object
 * @param uri 
 */
export async function readYaml(uri: vscode.Uri): Promise<object | undefined> {
    try {
        const content = await vscode.workspace.fs.readFile(uri);
        return yaml.parse(content?.toString());
    } catch (error) { }

}