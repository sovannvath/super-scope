import { describe, it } from "node:test";
import assert from "node:assert/strict"; // for expectations

import { cn } from "./utils";

describe("cn function", () => {
  it("should combine class names correctly", () => {
    assert.strictEqual(cn("class1", "class2"), "class1 class2");
    assert.strictEqual(cn("class1", "", "class2"), "class1 class2");
    assert.strictEqual(cn("class1", null, "class2"), "class1 class2");
    assert.strictEqual(cn("class1", undefined, "class2"), "class1 class2");
    assert.strictEqual(cn("class1", false, "class2"), "class1 class2");
  });

  it("should handle conditional class names", () => {
    assert.strictEqual(cn("class1", true && "class2"), "class1 class2");
    assert.strictEqual(cn("class1", false && "class2"), "class1");
  });

  it("should merge Tailwind CSS classes correctly", () => {
    assert.strictEqual(cn("p-4", "p-6"), "p-6");
    assert.strictEqual(cn("text-red-500", "text-blue-500"), "text-blue-500");
  });

  it("should handle mixed inputs", () => {
    assert.strictEqual(cn("p-4", "font-bold", "text-lg", false && "hidden"), "p-4 font-bold text-lg");
  });
});
