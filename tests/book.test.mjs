import { test } from "node:test";
import assert from "node:assert/strict";
import { nextBookPage } from "../src/components/book-model.ts";
test("six-site automatic sequence reaches both ends and reverses without skipping", () => {
  let page = 0,
    direction = 1;
  const actual = [page];
  for (let i = 0; i < 12; i++) {
    const next = nextBookPage(page, direction, 6);
    page = next.page;
    direction = next.direction;
    actual.push(page);
  }
  assert.deepEqual(actual, [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0, 1, 2]);
});
