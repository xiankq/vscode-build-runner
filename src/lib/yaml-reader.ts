import * as vsc from 'vscode';
import * as yaml from 'yaml';

const textDecoder = new TextDecoder();

export function parseYamlBytes(bytes: Uint8Array): Record<string, unknown> | null {
  try {
    return yaml.parse(textDecoder.decode(bytes)) as Record<string, unknown>;
  }
  catch {
    return null;
  }
}

export async function readYaml(uri: vsc.Uri): Promise<Record<string, unknown> | null> {
  const bytes = await vsc.workspace.fs.readFile(uri);
  return parseYamlBytes(bytes);
}
