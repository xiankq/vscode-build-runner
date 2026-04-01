import * as assert from 'node:assert';
import * as vsc from 'vscode';
import { ProjectTreeItem } from '../src/tree-view';

suite('ProjectTreeItem - Monorepo Scenarios', () => {
  it('should handle monorepo with multiple packages at same level', () => {
    const packages = [
      { name: 'packages/core', uri: vsc.Uri.file('/monorepo/packages/core/pubspec.yaml') },
      { name: 'packages/ui', uri: vsc.Uri.file('/monorepo/packages/ui/pubspec.yaml') },
      { name: 'packages/api', uri: vsc.Uri.file('/monorepo/packages/api/pubspec.yaml') },
    ];

    const items = packages.map(p => new ProjectTreeItem(p.name, p.uri));

    const uniques = items.map(i => i.unique);
    const uniqueSet = new Set(uniques);
    assert.strictEqual(uniqueSet.size, 3, 'All unique values should be different');

    for (const item of items) {
      assert.ok(item.unique.endsWith('pubspec.yaml'));
      assert.ok(item.uniqueBuild.endsWith(':build'));
      assert.ok(item.uniqueWatch.endsWith(':watch'));
    }
  });

  it('should handle monorepo with deeply nested packages', () => {
    const packages = [
      { name: 'lib/common', uri: vsc.Uri.file('/project/lib/common/pubspec.yaml') },
      { name: 'lib/features/auth', uri: vsc.Uri.file('/project/lib/features/auth/pubspec.yaml') },
      { name: 'lib/features/home', uri: vsc.Uri.file('/project/lib/features/home/pubspec.yaml') },
      { name: 'apps/mobile', uri: vsc.Uri.file('/project/apps/mobile/pubspec.yaml') },
      { name: 'apps/web', uri: vsc.Uri.file('/project/apps/web/pubspec.yaml') },
    ];

    const items = packages.map(p => new ProjectTreeItem(p.name, p.uri));
    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 5);
  });

  it('should handle monorepo with similar package names in different paths', () => {
    const items = [
      new ProjectTreeItem('lib/utils', vsc.Uri.file('/project/lib/utils/pubspec.yaml')),
      new ProjectTreeItem('apps/utils', vsc.Uri.file('/project/apps/utils/pubspec.yaml')),
      new ProjectTreeItem('packages/utils', vsc.Uri.file('/project/packages/utils/pubspec.yaml')),
    ];

    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 3);

    const titleSet = new Set(items.map(i => i.title));
    assert.strictEqual(titleSet.size, 3, 'Titles should be different due to path prefix');
  });

  it('should handle monorepo with packages having same name but different versions', () => {
    const items = [
      new ProjectTreeItem('v1/app', vsc.Uri.file('/project/v1/app/pubspec.yaml')),
      new ProjectTreeItem('v2/app', vsc.Uri.file('/project/v2/app/pubspec.yaml')),
    ];

    assert.notStrictEqual(items[0].unique, items[1].unique);
    assert.notStrictEqual(items[0].uniqueBuild, items[1].uniqueBuild);
    assert.notStrictEqual(items[0].uniqueWatch, items[1].uniqueWatch);
  });

  it('should handle monorepo with workspace root pubspec.yaml', () => {
    const items = [
      new ProjectTreeItem('', vsc.Uri.file('/monorepo/pubspec.yaml')),
      new ProjectTreeItem('packages/core', vsc.Uri.file('/monorepo/packages/core/pubspec.yaml')),
      new ProjectTreeItem('packages/app', vsc.Uri.file('/monorepo/packages/app/pubspec.yaml')),
    ];

    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 3);
  });

  it('should handle monorepo with mixed path separators (Windows-style)', () => {
    const items = [
      new ProjectTreeItem('packages\\core', vsc.Uri.file('C:\\monorepo\\packages\\core\\pubspec.yaml')),
      new ProjectTreeItem('packages\\ui', vsc.Uri.file('C:\\monorepo\\packages\\ui\\pubspec.yaml')),
    ];

    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 2);
  });

  it('should handle monorepo with special characters in package paths', () => {
    const items = [
      new ProjectTreeItem('packages/my-app', vsc.Uri.file('/monorepo/packages/my-app/pubspec.yaml')),
      new ProjectTreeItem('packages/my_app_v2', vsc.Uri.file('/monorepo/packages/my_app_v2/pubspec.yaml')),
      new ProjectTreeItem('packages/@scope/pkg', vsc.Uri.file('/monorepo/packages/@scope/pkg/pubspec.yaml')),
    ];

    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 3);
  });

  it('should handle large monorepo with many packages', () => {
    const packages = Array.from({ length: 50 }, (_, i) => ({
      name: `packages/pkg${String(i).padStart(2, '0')}`,
      uri: vsc.Uri.file(`/monorepo/packages/pkg${String(i).padStart(2, '0')}/pubspec.yaml`),
    }));

    const items = packages.map(p => new ProjectTreeItem(p.name, p.uri));
    const uniqueSet = new Set(items.map(i => i.unique));
    assert.strictEqual(uniqueSet.size, 50);

    const buildSet = new Set(items.map(i => i.uniqueBuild));
    assert.strictEqual(buildSet.size, 50);

    const watchSet = new Set(items.map(i => i.uniqueWatch));
    assert.strictEqual(watchSet.size, 50);
  });

  it('should sort monorepo items correctly by title', () => {
    const items = [
      new ProjectTreeItem('packages/zebra', vsc.Uri.file('/m/packages/zebra/pubspec.yaml')),
      new ProjectTreeItem('packages/alpha', vsc.Uri.file('/m/packages/alpha/pubspec.yaml')),
      new ProjectTreeItem('packages/middle', vsc.Uri.file('/m/packages/middle/pubspec.yaml')),
    ];

    items.sort((a, b) => a.title.localeCompare(b.title));
    assert.strictEqual(items[0].title, 'packages/alpha');
    assert.strictEqual(items[1].title, 'packages/middle');
    assert.strictEqual(items[2].title, 'packages/zebra');
  });

  it('should handle monorepo where workspace path is substring of package path', () => {
    const _workspacePath = '/project';
    const packagePath = '/project-extended/packages/core/pubspec.yaml';
    const item = new ProjectTreeItem('packages/core', vsc.Uri.file(packagePath));

    assert.ok(item.unique === packagePath);
    assert.ok(item.unique.startsWith('/project-extended'));
  });
});
