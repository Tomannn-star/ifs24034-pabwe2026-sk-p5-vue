import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const dummyAucation = {
    id: 1,
    title: "Old Title",
    start_bid: 100000,
    closed_at: "2026-10-10 12:00:00",
    description: "Old Desc",
  };

  it("should render modal with existing values, loading state, and close", async () => {
    const store = useAucationsStore();
    store.isAucationChange = true;

    const wrapper = mount(ChangeModal, {
      props: { aucation: dummyAucation },
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<div></div>",
            props: ["modelValue"],
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Ubah Data Lelang");
    expect(wrapper.text()).toContain("Menyimpan...");
    await wrapper.find("button[aria-label='Close']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.findAll("button").find((b) => b.text().includes("Batal"));
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should handle empty or fallback props", () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: { id: 2 } },
      global: {
        stubs: {
          MarkdownEditor: true,
        },
      },
    });
    expect(wrapper.find("input#edit_title").element.value).toBe("");
  });

  it("should validate empty fields", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(ChangeModal, {
      props: { aucation: dummyAucation },
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<div></div>",
            props: ["modelValue"],
          },
        },
      },
    });

    await wrapper.find("input#edit_title").setValue("");
    await wrapper.find("form").trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Semua kolom wajib diisi!");
  });

  it("should submit updated auction successfully with 16 and 19 char date", async () => {
    const store = useAucationsStore();
    const changeSpy = vi.spyOn(store, "changeAucation").mockResolvedValue({ status: "success" });

    const wrapper = mount(ChangeModal, {
      props: { aucation: dummyAucation },
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<textarea :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" data-testid='desc-input'></textarea>",
            props: ["modelValue"],
          },
        },
      },
    });

    await wrapper.find("input#edit_title").setValue("New Title");
    await wrapper.find("input#edit_closed_at").setValue("2026-10-10T12:00");
    await wrapper.find("[data-testid='desc-input']").setValue("New Desc");
    await wrapper.find("form").trigger("submit.prevent");

    expect(changeSpy).toHaveBeenCalled();
    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();

    await wrapper.find("input#edit_closed_at").setValue("2026-10-10T12:00:30");
    await wrapper.find("form").trigger("submit.prevent");
    expect(changeSpy).toHaveBeenCalled();
  });

  it("should handle update error gracefully", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "changeAucation").mockRejectedValue(new Error("Fail"));

    const wrapper = mount(ChangeModal, {
      props: { aucation: dummyAucation },
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<div></div>",
            props: ["modelValue"],
          },
        },
      },
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("success")).toBeFalsy();
  });
});
