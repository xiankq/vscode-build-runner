import * as vsc from 'vscode';
import * as yaml from 'yaml';

export async function readYaml(uri: vsc.Uri): Promise<Record<string, any> | null> {
  const uint8Array = await vsc.workspace.fs.readFile(uri);
  let obj;
  try {
    obj = yaml.parse(uint8Array.toString());
  }
  catch {
    obj = null;
  }
  return obj;
}
