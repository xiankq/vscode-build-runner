import * as assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

interface ExtensionManifest {
  activationEvents?: string[];
  contributes?: {
    commands?: Array<{
      command?: string;
    }>;
  };
}

suite('Extension Manifest', () => {
  function readManifest(): ExtensionManifest {
    const manifestPath = path.resolve(__dirname, '..', 'package.json');
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as ExtensionManifest;
  }

  it('activates for pubspec files at any depth', () => {
    const manifest = readManifest();

    assert.ok(manifest.activationEvents?.includes('workspaceContains:**/pubspec.yaml'));
  });

  it('does not contribute an unimplemented quit command', () => {
    const manifest = readManifest();
    const commands = manifest.contributes?.commands?.map(command => command.command) ?? [];

    assert.ok(!commands.includes('build_runner.quit'));
  });
});
