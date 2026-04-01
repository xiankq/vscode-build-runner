import * as assert from 'node:assert';
import * as path from 'node:path';
import * as vsc from 'vscode';
import { activate, deactivate } from '../src/extension';

suite('Extension Activation - Edge Cases', () => {
  let context: vsc.ExtensionContext;

  function createMockContext(): vsc.ExtensionContext {
    return {
      subscriptions: [],
      workspaceState: {} as vsc.Memento,
      globalState: {} as vsc.Memento & { setKeysForSync: (keys: string[]) => void },
      extensionUri: vsc.Uri.file(__dirname),
      extensionPath: __dirname,
      environmentVariableCollection: {} as vsc.EnvironmentVariableCollection,
      storageUri: undefined,
      globalStorageUri: vsc.Uri.file(''),
      logUri: vsc.Uri.file(''),
      extensionMode: vsc.ExtensionMode.Test,
      asAbsolutePath: (relativePath: string) => path.join(__dirname, relativePath),
    } as unknown as vsc.ExtensionContext;
  }

  setup(() => {
    context = createMockContext();
  });

  teardown(() => {
    deactivate();
  });

  it('should register commands on activate', async () => {
    await activate(context);
    assert.ok(context.subscriptions.length > 0);
  });

  it('should register watch and build commands', async () => {
    await activate(context);
    assert.ok(context.subscriptions.length >= 2);
  });

  it('should handle multiple activations with same context', async () => {
    await activate(context);
    const _initialCount = context.subscriptions.length;
    await activate(context);
    assert.ok(context.subscriptions.length > 0);
  });

  it('should handle activate with empty subscriptions array', async () => {
    const emptyContext = {
      subscriptions: [],
      workspaceState: {} as vsc.Memento,
      globalState: {} as vsc.Memento,
      extensionUri: vsc.Uri.file(__dirname),
      extensionPath: __dirname,
      environmentVariableCollection: {} as vsc.EnvironmentVariableCollection,
      storageUri: undefined,
      globalStorageUri: vsc.Uri.file(''),
      logUri: vsc.Uri.file(''),
      extensionMode: vsc.ExtensionMode.Test,
      asAbsolutePath: (relativePath: string) => path.join(__dirname, relativePath),
    } as unknown as vsc.ExtensionContext;
    await activate(emptyContext);
    assert.ok(emptyContext.subscriptions.length > 0);
  });

  it('should handle activate with pre-populated subscriptions', async () => {
    const disposable = { dispose: () => {} };
    context.subscriptions.push(disposable);
    await activate(context);
    assert.ok(context.subscriptions.length > 1);
  });

  it('deactivate should not throw when called without activate', () => {
    assert.doesNotThrow(() => {
      deactivate();
    });
  });

  it('deactivate should handle multiple calls', () => {
    assert.doesNotThrow(() => {
      deactivate();
      deactivate();
      deactivate();
    });
  });

  it('should handle activate after deactivate', async () => {
    await activate(context);
    deactivate();
    const newContext = createMockContext();
    await activate(newContext);
    assert.ok(newContext.subscriptions.length > 0);
  });

  it('should handle context with undefined properties', async () => {
    const partialContext = {
      subscriptions: [],
    } as unknown as vsc.ExtensionContext;
    await assert.rejects(
      async () => activate(partialContext),
    );
  });

  it('should handle context with null subscriptions', async () => {
    const nullContext = {
      subscriptions: null,
    } as unknown as vsc.ExtensionContext;
    await assert.rejects(
      async () => activate(nullContext),
    );
  });

  it('should handle context with readonly subscriptions', async () => {
    const readonlyContext = {
      subscriptions: Object.freeze([]),
    } as unknown as vsc.ExtensionContext;
    await assert.rejects(
      async () => activate(readonlyContext),
    );
  });
});
