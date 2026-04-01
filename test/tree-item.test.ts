import * as assert from 'node:assert';
import * as path from 'node:path';
import * as vsc from 'vscode';
import { ProjectTreeItem } from '../src/tree-view';

suite('ProjectTreeItem - Edge Cases', () => {
  it('should handle empty title', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('', uri);
    assert.strictEqual(item.title, '');
    assert.strictEqual(item.unique, uri.fsPath);
  });

  it('should handle title with special characters', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const specialTitles = [
      'my-app_v2.0',
      'package@scope/name',
      'app with spaces',
      'tabs\there',
      'new\nline',
    ];

    for (const title of specialTitles) {
      const item = new ProjectTreeItem(title, uri);
      assert.strictEqual(item.title, title);
    }
  });

  it('should handle deeply nested paths', () => {
    const deepPath = path.join('a', 'b', 'c', 'd', 'e', 'pubspec.yaml');
    const uri = vsc.Uri.file(deepPath);
    const item = new ProjectTreeItem('deep', uri);
    assert.ok(item.unique.includes('a'));
    assert.ok(item.unique.includes('e'));
  });

  it('should handle paths with spaces', () => {
    const uri = vsc.Uri.file(path.join('my workspace', 'my project', 'pubspec.yaml'));
    const item = new ProjectTreeItem('my app', uri);
    assert.ok(item.unique.includes('my workspace'));
  });

  it('uniqueBuild and uniqueWatch should maintain path integrity with spaces', () => {
    const uri = vsc.Uri.file(path.join('path', 'with spaces', 'pubspec.yaml'));
    const item = new ProjectTreeItem('test', uri);
    assert.ok(item.uniqueBuild.endsWith(':build'));
    assert.ok(item.uniqueWatch.endsWith(':watch'));
    assert.ok(item.uniqueBuild.includes('with spaces'));
  });

  it('command arguments should contain exact resourceUri', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('test', uri);
    assert.deepStrictEqual(item.command?.arguments, [uri]);
  });

  it('tooltip should use path not fsPath', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('test', uri);
    assert.strictEqual(item.tooltip, uri.path);
    assert.notStrictEqual(item.tooltip, uri.fsPath);
  });

  it('contextValue should always be "file" regardless of URI', () => {
    const dirUri = vsc.Uri.file('/some/directory');
    const fileUri = vsc.Uri.file('/some/pubspec.yaml');
    const dirItem = new ProjectTreeItem('dir', dirUri);
    const fileItem = new ProjectTreeItem('file', fileUri);
    assert.strictEqual(dirItem.contextValue, 'file');
    assert.strictEqual(fileItem.contextValue, 'file');
  });

  it('unique values should be unique across different URIs', () => {
    const uris = [
      vsc.Uri.file('/project1/pubspec.yaml'),
      vsc.Uri.file('/project2/pubspec.yaml'),
      vsc.Uri.file('/project1/sub/pubspec.yaml'),
    ];

    const items = uris.map(uri => new ProjectTreeItem('test', uri));
    const uniques = items.map(i => i.unique);
    const uniqueSet = new Set(uniques);
    assert.strictEqual(uniqueSet.size, uniques.length);
  });

  it('should handle URI with query parameters', () => {
    const uri = vsc.Uri.parse('file:///test/pubspec.yaml?query=value');
    const item = new ProjectTreeItem('test', uri);
    assert.strictEqual(item.unique, uri.fsPath);
  });

  it('same URI different titles should have same unique values', () => {
    const uri = vsc.Uri.file('/same/pubspec.yaml');
    const item1 = new ProjectTreeItem('title1', uri);
    const item2 = new ProjectTreeItem('title2', uri);
    assert.strictEqual(item1.unique, item2.unique);
    assert.strictEqual(item1.uniqueBuild, item2.uniqueBuild);
    assert.strictEqual(item1.uniqueWatch, item2.uniqueWatch);
    assert.notStrictEqual(item1.title, item2.title);
  });

  it('should handle very long titles', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const longTitle = 'a'.repeat(1000);
    const item = new ProjectTreeItem(longTitle, uri);
    assert.strictEqual(item.title.length, 1000);
  });

  it('should handle Unicode and emoji in titles', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('项目_🚀_test', uri);
    assert.strictEqual(item.title, '项目_🚀_test');
  });
});
