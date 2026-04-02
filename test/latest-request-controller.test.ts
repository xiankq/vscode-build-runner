import * as assert from 'node:assert';
import { LatestRequestController } from '../src/tree-view';

suite('LatestRequestController', () => {
  it('accepts the most recent request only', () => {
    const controller = new LatestRequestController();
    const firstRequest = controller.beginRequest();
    const secondRequest = controller.beginRequest();

    assert.strictEqual(controller.isLatestRequest(firstRequest), false);
    assert.strictEqual(controller.isLatestRequest(secondRequest), true);
  });

  it('treats the initial request as current until a newer one starts', () => {
    const controller = new LatestRequestController();
    const requestId = controller.beginRequest();

    assert.strictEqual(controller.isLatestRequest(requestId), true);
  });
});
