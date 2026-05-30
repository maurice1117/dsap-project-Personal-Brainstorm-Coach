import assert from 'node:assert/strict';
import test from 'node:test';
import { getVisibleMvpItems, shouldShowMvpToggle } from '../src/lib/projectDisplay';

const mvpItems = [
  '建立問答表單',
  '呼叫點子生成 API',
  '渲染專案卡片',
  '加入重新生成按鈕',
  '加入修改條件流程',
];

test('getVisibleMvpItems returns first three MVP items when collapsed', () => {
  assert.deepEqual(
    getVisibleMvpItems(mvpItems, false),
    ['建立問答表單', '呼叫點子生成 API', '渲染專案卡片']
  );
});

test('getVisibleMvpItems returns all MVP items when expanded', () => {
  assert.deepEqual(getVisibleMvpItems(mvpItems, true), mvpItems);
});

test('shouldShowMvpToggle only appears when there are hidden MVP items', () => {
  assert.equal(shouldShowMvpToggle(mvpItems.slice(0, 3)), false);
  assert.equal(shouldShowMvpToggle(mvpItems.slice(0, 4)), true);
});
