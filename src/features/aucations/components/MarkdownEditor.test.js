import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownEditor from "./MarkdownEditor.vue";
import Editor from "@toast-ui/editor";

vi.mock("@toast-ui/editor", () => {
  return {
    default: vi.fn().mockImplementation(function (options) {
      this.getMarkdown = vi.fn().mockReturnValue(options?.initialValue || "");
      this.setMarkdown = vi.fn();
      this.destroy = vi.fn();
      if (options?.events?.change) {
        options.events.change();
      }
    }),
  };
});

describe("MarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mount, initialize editor, and trigger change event", async () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "Initial content" },
    });
    expect(wrapper.exists()).toBe(true);

    await wrapper.setProps({ modelValue: "Updated content" });
    wrapper.unmount();
  });

  it("should fallback to textarea if Editor fails to initialize", async () => {
    Editor.mockImplementationOnce(() => {
      throw new Error("Initialization failed");
    });

    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "Fallback content" },
    });

    await wrapper.vm.$nextTick();

    const textarea = wrapper.find("textarea");
    expect(textarea.exists()).toBe(true);
    await textarea.setValue("Typed text");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });
});
