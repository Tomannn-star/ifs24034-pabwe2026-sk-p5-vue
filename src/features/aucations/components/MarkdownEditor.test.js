import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownEditor from "./MarkdownEditor.vue";

const { MockEditor, getMockState } = vi.hoisted(() => {
  let shouldThrow = false;
  let lastInstance = null;

  class MockEditor {
    constructor(options) {
      if (shouldThrow) {
        throw new Error("Initialization failed");
      }
      this.options = options;
      this.getMarkdown = vi.fn().mockReturnValue(options?.initialValue || "");
      this.setMarkdown = vi.fn();
      this.destroy = vi.fn();
      lastInstance = this;
    }
  }

  return {
    MockEditor,
    getMockState: () => ({
      setShouldThrow: (val) => {
        shouldThrow = val;
      },
      getLastInstance: () => lastInstance,
    }),
  };
});

vi.mock("@toast-ui/editor", () => {
  return {
    default: MockEditor,
  };
});

describe("MarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMockState().setShouldThrow(false);
  });

  it("should mount, initialize editor, handle change, watch props, and destroy on unmount", async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "Initial content" },
    });
    expect(wrapper.exists()).toBe(true);
    const instance = getMockState().getLastInstance();
    expect(instance).toBeDefined();

    // Trigger change event from editor
    instance.getMarkdown.mockReturnValue("Typed in editor");
    instance.options.events.change();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Typed in editor"]);

    // Update props to new value
    await wrapper.setProps({ modelValue: "Updated content" });
    expect(instance.setMarkdown).toHaveBeenCalledWith("Updated content");

    // Update props to empty string (covers newVal || "")
    await wrapper.setProps({ modelValue: "" });
    expect(instance.setMarkdown).toHaveBeenCalledWith("");

    // Update props to same value as editor markdown (covers !== newVal branch)
    instance.getMarkdown.mockReturnValue("Same");
    await wrapper.setProps({ modelValue: "Same" });

    // Unmount properly destroys editorInstance
    wrapper.unmount();
    expect(instance.destroy).toHaveBeenCalled();
  });

  it("should fallback to textarea if Editor fails to initialize and handle unmount", async () => {
    getMockState().setShouldThrow(true);

    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "Fallback content" },
    });

    await wrapper.vm.$nextTick();

    const textarea = wrapper.find("textarea");
    expect(textarea.exists()).toBe(true);
    await textarea.setValue("Typed text");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();

    // Changing props in fallback mode
    await wrapper.setProps({ modelValue: "New fallback" });

    // Unmount in fallback mode (editorInstance is null)
    wrapper.unmount();
  });
});
