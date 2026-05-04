import * as assert from 'node:assert';
import { Buffer } from 'node:buffer';
import { parseYamlBytes } from '../src/read-yaml';

suite('YAML Reader', () => {
  it('parses UTF-8 bytes from a plain Uint8Array', () => {
    const bytes = new Uint8Array(Buffer.from(
      'name: demo\ndev_dependencies:\n  build_runner: any\n',
      'utf8',
    ));

    const parsed = parseYamlBytes(bytes);

    assert.deepStrictEqual(parsed, {
      name: 'demo',
      dev_dependencies: {
        build_runner: 'any',
      },
    });
  });

  it('returns null for invalid YAML input', () => {
    const bytes = new Uint8Array(Buffer.from('name: [demo', 'utf8'));

    assert.strictEqual(parseYamlBytes(bytes), null);
  });
});
