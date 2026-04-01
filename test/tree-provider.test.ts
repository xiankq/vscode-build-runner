import * as assert from 'node:assert';
import * as vsc from 'vscode';
import { ProjectTreeItem } from '../src/tree-view';

class TestTreeProvider implements vsc.TreeDataProvider<ProjectTreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vsc.EventEmitter<void>();
  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private items: ProjectTreeItem[] = [];

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  setItems(items: ProjectTreeItem[]): void {
    this.items = items;
  }

  getTreeItem(element: ProjectTreeItem): ProjectTreeItem {
    return element;
  }

  getChildren(): ProjectTreeItem[] {
    return this.items;
  }
}

suite('TreeProvider - Edge Cases', () => {
  let provider: TestTreeProvider;

  setup(() => {
    provider = new TestTreeProvider();
  });

  it('getTreeItem should return the same element', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('test', uri);
    assert.strictEqual(provider.getTreeItem(item), item);
  });

  it('getChildren should return empty array when no items', () => {
    assert.deepStrictEqual(provider.getChildren(), []);
  });

  it('getChildren should return all items', () => {
    const uri1 = vsc.Uri.file('/test/a/pubspec.yaml');
    const uri2 = vsc.Uri.file('/test/b/pubspec.yaml');
    const item1 = new ProjectTreeItem('a', uri1);
    const item2 = new ProjectTreeItem('b', uri2);
    provider.setItems([item1, item2]);
    assert.strictEqual(provider.getChildren().length, 2);
    assert.deepStrictEqual(provider.getChildren(), [item1, item2]);
  });

  it('should handle setting items multiple times', () => {
    const uri1 = vsc.Uri.file('/test/a/pubspec.yaml');
    const item1 = new ProjectTreeItem('a', uri1);
    provider.setItems([item1]);
    assert.strictEqual(provider.getChildren().length, 1);

    const uri2 = vsc.Uri.file('/test/b/pubspec.yaml');
    const item2 = new ProjectTreeItem('b', uri2);
    provider.setItems([item2]);
    assert.strictEqual(provider.getChildren().length, 1);
    assert.strictEqual(provider.getChildren()[0], item2);
  });

  it('should handle setting empty items after having items', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('test', uri);
    provider.setItems([item]);
    assert.strictEqual(provider.getChildren().length, 1);

    provider.setItems([]);
    assert.deepStrictEqual(provider.getChildren(), []);
  });

  it('should handle setting duplicate items', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('test', uri);
    provider.setItems([item, item]);
    assert.strictEqual(provider.getChildren().length, 2);
    assert.strictEqual(provider.getChildren()[0], provider.getChildren()[1]);
  });

  it('should handle large number of items', () => {
    const items = Array.from({ length: 1000 }, (_, i) =>
      new ProjectTreeItem(`item${i}`, vsc.Uri.file(`/test/${i}/pubspec.yaml`)));
    provider.setItems(items);
    assert.strictEqual(provider.getChildren().length, 1000);
  });

  it('refresh should fire onDidChangeTreeData event', (done) => {
    provider.onDidChangeTreeData(() => {
      done();
    });
    provider.refresh();
  });

  it('should handle items with same title but different URIs', () => {
    const uri1 = vsc.Uri.file('/project1/pubspec.yaml');
    const uri2 = vsc.Uri.file('/project2/pubspec.yaml');
    const item1 = new ProjectTreeItem('same_name', uri1);
    const item2 = new ProjectTreeItem('same_name', uri2);
    provider.setItems([item1, item2]);
    assert.strictEqual(provider.getChildren().length, 2);
    assert.notStrictEqual(provider.getChildren()[0].resourceUri, provider.getChildren()[1].resourceUri);
  });

  it('should preserve item order', () => {
    const items = [
      new ProjectTreeItem('c', vsc.Uri.file('/c/pubspec.yaml')),
      new ProjectTreeItem('a', vsc.Uri.file('/a/pubspec.yaml')),
      new ProjectTreeItem('b', vsc.Uri.file('/b/pubspec.yaml')),
    ];
    provider.setItems(items);
    assert.strictEqual(provider.getChildren()[0].title, 'c');
    assert.strictEqual(provider.getChildren()[1].title, 'a');
    assert.strictEqual(provider.getChildren()[2].title, 'b');
  });

  it('should handle multiple refresh events', (done) => {
    let refreshCount = 0;
    provider.onDidChangeTreeData(() => {
      refreshCount++;
      if (refreshCount === 3) {
        done();
      }
    });
    provider.refresh();
    provider.refresh();
    provider.refresh();
  });

  it('should handle rapid setItems calls', () => {
    const items1 = [new ProjectTreeItem('a', vsc.Uri.file('/a/pubspec.yaml'))];
    const items2 = [new ProjectTreeItem('b', vsc.Uri.file('/b/pubspec.yaml'))];
    const items3 = [new ProjectTreeItem('c', vsc.Uri.file('/c/pubspec.yaml'))];

    provider.setItems(items1);
    provider.setItems(items2);
    provider.setItems(items3);

    assert.strictEqual(provider.getChildren().length, 1);
    assert.strictEqual(provider.getChildren()[0].title, 'c');
  });

  it('should handle items with null-like titles', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const nullTitleItem = new ProjectTreeItem('null', uri);
    const undefinedTitleItem = new ProjectTreeItem('undefined', uri);
    provider.setItems([nullTitleItem, undefinedTitleItem]);
    assert.strictEqual(provider.getChildren().length, 2);
  });

  it('should handle items with numeric-looking titles', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const items = [
      new ProjectTreeItem('123', uri),
      new ProjectTreeItem('0', uri),
      new ProjectTreeItem('-1', uri),
      new ProjectTreeItem('3.14', uri),
    ];
    provider.setItems(items);
    assert.strictEqual(provider.getChildren().length, 4);
  });

  it('should handle items with titles that look like paths', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const items = [
      new ProjectTreeItem('example/my_app', uri),
      new ProjectTreeItem('/absolute/path', uri),
      new ProjectTreeItem('./relative/path', uri),
    ];
    provider.setItems(items);
    assert.strictEqual(provider.getChildren().length, 3);
  });

  it('should handle items with titles containing colons', () => {
    const uri = vsc.Uri.file('/test/pubspec.yaml');
    const item = new ProjectTreeItem('name:with:colons', uri);
    provider.setItems([item]);
    assert.strictEqual(provider.getChildren()[0].title, 'name:with:colons');
  });
});
