import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("AddModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  it("should render modal elements, loading state, and close on click cancel", async () => {
    const store = useAucationsStore();
    store.isAucationAdd = true;

    const wrapper = mount(AddModal, {
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<textarea :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" data-testid='desc-input'></textarea>",
            props: ["modelValue"],
          },
        },
      },
    });

    expect(wrapper.text()).toContain("Tambah Barang Lelang");
    expect(wrapper.text()).toContain("Menyimpan...");
    await wrapper.find("button[aria-label='Close']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.findAll("button").find((b) => b.text().includes("Batal"));
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should validate empty fields", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(AddModal, {
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
    expect(errSpy).toHaveBeenCalledWith("Semua kolom wajib diisi!");
  });

  it("should submit new auction successfully with 16 and 19 char closed_at", async () => {
    const store = useAucationsStore();
    const addSpy = vi.spyOn(store, "addAucation").mockResolvedValue({ status: "success" });

    const wrapper = mount(AddModal, {
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<textarea :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" data-testid='desc-input'></textarea>",
            props: ["modelValue"],
          },
        },
      },
    });

    await wrapper.find("input#title").setValue("Laptop Dell");
    await wrapper.find("input#start_bid").setValue(5000000);
    await wrapper.find("input#closed_at").setValue("2026-12-31T23:59");
    await wrapper.find("[data-testid='desc-input']").setValue("Kondisi mulus");

    await wrapper.find("form").trigger("submit.prevent");

    expect(addSpy).toHaveBeenCalledWith({
      title: "Laptop Dell",
      description: "Kondisi mulus",
      start_bid: 5000000,
      closed_at: "2026-12-31 23:59:00",
    });
    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();

    // Now test with 19 chars (including seconds)
    await wrapper.find("input#closed_at").setValue("2026-12-31T23:59:30");
    await wrapper.find("form").trigger("submit.prevent");
    expect(addSpy).toHaveBeenCalledWith({
      title: "Laptop Dell",
      description: "Kondisi mulus",
      start_bid: 5000000,
      closed_at: "2026-12-31 23:59:30",
    });
  });

  it("should handle submission error gracefully", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "addAucation").mockRejectedValue(new Error("Error"));

    const wrapper = mount(AddModal, {
      global: {
        stubs: {
          MarkdownEditor: {
            template: "<textarea :value='modelValue' @input=\"$emit('update:modelValue', $event.target.value)\" data-testid='desc-input'></textarea>",
            props: ["modelValue"],
          },
        },
      },
    });

    await wrapper.find("input#title").setValue("Laptop Dell");
    await wrapper.find("input#start_bid").setValue(5000000);
    await wrapper.find("input#closed_at").setValue("2026-12-31T23:59");
    await wrapper.find("[data-testid='desc-input']").setValue("Kondisi mulus");
    await wrapper.find("form").trigger("submit.prevent");

    expect(wrapper.emitted("success")).toBeFalsy();
  });
});
