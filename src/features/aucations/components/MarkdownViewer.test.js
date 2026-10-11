import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import MarkdownViewer from "./MarkdownViewer.vue";

const { mockSetMarkdown, mockState } = vi.hoisted(() => {
  const mockSetMarkdown = vi.fn();
  let mode = "normal"; // "normal" | "no-factory" | "throw"

  return {
    mockSetMarkdown,
    mockState: {
      setMode: (m) => {
        mode = m;
      },
      getMode: () => mode,
    },
  };
});

vi.mock("@toast-ui/editor", () => {
  return {
    default: {
      get factory() {
        if (mockState.getMode() === "no-factory") {
          return undefined;
        }
        return vi.fn().mockImplementation(() => {
          if (mockState.getMode() === "throw") {
            throw new Error("Viewer fail");
          }
          return {
            setMarkdown: mockSetMarkdown,
          };
        });
      },
    },
  };
});

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.setMode("normal");
  });

  it("should mount and render viewer with content and update content", async () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: "# Judul Deskripsi" },
    });
    expect(wrapper.exists()).toBe(true);

    // Update with non-empty content
    await wrapper.setProps({ content: "Updated content" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("Updated content");

    // Update with empty content (covers newVal || "")
    await wrapper.setProps({ content: "" });
    expect(mockSetMarkdown).toHaveBeenCalledWith("");
  });

  it("should mount with default/empty content", () => {
    const wrapper = mount(MarkdownViewer, {
      props: { content: "" },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("should fallback when Editor.factory is not available", async () => {
    mockState.setMode("no-factory");

    const wrapper = mount(MarkdownViewer, {
      props: { content: "No factory fallback text" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("No factory fallback text");
  });

  it("should fallback when factory throws and ignore watch when viewerInstance is null", async () => {
    mockState.setMode("throw");

    const wrapper = mount(MarkdownViewer, {
      props: { content: "Fallback text" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Fallback text");

    // Watch triggers while viewerInstance is null
    await wrapper.setProps({ content: "Changed fallback text" });
    expect(wrapper.text()).toContain("Changed fallback text");
  });
});
