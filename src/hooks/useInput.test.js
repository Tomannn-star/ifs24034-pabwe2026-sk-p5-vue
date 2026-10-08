import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("should initialize with initial value", () => {
    const [val] = useInput("hello");
    expect(val.value).toBe("hello");
  });

  it("should update value with event target value", () => {
    const [val, onChange] = useInput("");
    onChange({ target: { type: "text", value: "new text" } });
    expect(val.value).toBe("new text");
  });

  it("should update checkbox target checked", () => {
    const [val, onChange] = useInput(false);
    onChange({ target: { type: "checkbox", checked: true } });
    expect(val.value).toBe(true);
  });

  it("should update direct value", () => {
    const [val, onChange, setValue] = useInput("init");
    onChange("direct-val");
    expect(val.value).toBe("direct-val");

    setValue("manual-val");
    expect(val.value).toBe("manual-val");
  });
});

