import * as assert from "node:assert";
import { describe } from "node:test";
import {compile} from "../src/rawrdino.js"

describe("Complier", () => {
  it("should complie", () => {
    assert.equal(compile(), "eventually this will return the compiled code");
    assert.strictEqual(1 + 1, 2);
  });
});
