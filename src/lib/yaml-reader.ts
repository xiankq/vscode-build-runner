import * as vsc from 'vscode';
import * as yaml from 'yaml';

export async function readYaml(uri: vsc.Uri): Promise<Record<string, unknown> | null> {
  const uint8Array = await vsc.workspace.fs.readFile(uri);
  try {
    return yaml.parse(uint8Array.toString()) as Record<string, unknown>;
  }
  catch {
    return null;
  }
}
