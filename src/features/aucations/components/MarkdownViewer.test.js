import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownViewer from "./MarkdownViewer.vue";
import Editor from "@toast-ui/editor";

vi.mock("@toast-ui/editor", () => {
  return {
    default: {
      factory: vi.fn().mockReturnValue({
        setMarkdown: vi.fn(),
      }),
    },
  };
});

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mount and render viewer", async () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: "# Judul Deskripsi" },
    });
    expect(wrapper.exists()).toBe(true);

    await wrapper.setProps({ content: "Updated content" });
  });

  it("should fallback when factory throws", async () => {
    Editor.factory.mockImplementationOnce(() => {
      throw new Error("Viewer fail");
    });

    const wrapper = mount(MarkdownViewer, {
      props: { content: "Fallback text" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Fallback text");
  });
});
