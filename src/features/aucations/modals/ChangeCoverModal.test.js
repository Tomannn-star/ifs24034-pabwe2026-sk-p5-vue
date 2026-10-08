import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChangeCoverModal from "./ChangeCoverModal.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should render modal, loading state, and emit close", async () => {
    const store = useAucationsStore();
    store.isAucationChangeCover = true;

    const wrapper = mount(ChangeCoverModal, {
      props: { aucationId: 1 },
    });
    expect(wrapper.text()).toContain("Ganti Foto Cover");
    expect(wrapper.text()).toContain("Mengunggah...");

    await wrapper.find("button[aria-label='Close']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();

    const cancelBtn = wrapper.findAll("button").find((b) => b.text().includes("Batal"));
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close").length).toBe(2);
  });

  it("should validate empty file", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(ChangeCoverModal, {
      props: { aucationId: 1 },
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Pilih file gambar cover terlebih dahulu!");
  });

  it("should handle empty change event", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucationId: 1 },
    });
    const input = wrapper.find("input#cover_file");
    Object.defineProperty(input.element, "files", {
      value: [],
    });
    await input.trigger("change");
    expect(wrapper.vm.file).toBeNull();
  });

  it("should handle file selection and submit successfully", async () => {
    const store = useAucationsStore();
    const coverSpy = vi.spyOn(store, "changeAucationCover").mockResolvedValue({ status: "success" });

    const wrapper = mount(ChangeCoverModal, {
      props: { aucationId: 1 },
    });

    const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
    const input = wrapper.find("input#cover_file");
    Object.defineProperty(input.element, "files", {
      value: [file],
    });
    await input.trigger("change");

    expect(wrapper.find("img[alt='Preview']").exists()).toBe(true);

    await wrapper.find("form").trigger("submit.prevent");
    expect(coverSpy).toHaveBeenCalled();
    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle upload error gracefully", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "changeAucationCover").mockRejectedValue(new Error("Upload fail"));

    const wrapper = mount(ChangeCoverModal, {
      props: { aucationId: 1 },
    });

    const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });
    const input = wrapper.find("input#cover_file");
    Object.defineProperty(input.element, "files", {
      value: [file],
    });
    await input.trigger("change");

    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("success")).toBeFalsy();
  });
});
