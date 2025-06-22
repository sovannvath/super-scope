import { cn } from "./utils";

describe("cn function", () => {
  it("should combine class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", "", "class2")).toBe("class1 class2");
    expect(cn("class1", null, "class2")).toBe("class1 class2");
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    expect(cn("class1", false, "class2")).toBe("class1 class2");
  });

  it("should handle conditional class names", () => {
    expect(cn("class1", true && "class2")).toBe("class1 class2");
    expect(cn("class1", false && "class2")).toBe("class1");
  });

  it("should merge Tailwind CSS classes correctly", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle mixed inputs", () => {
    expect(cn("p-4", "font-bold", "text-lg", false && "hidden")).toBe("p-4 font-bold text-lg");
  });
});

