import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BidModal from "./BidModal.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("BidModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const dummyAucation = {
    id: 1,
    start_bid: 100000,
    bids: [{ id: 1, bid: 150000 }, { id: 2, bid: null }],
  };

  it("should render bid modal and show min required bid", async () => {
    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });
    expect(wrapper.text()).toContain("Ajukan Tawaran (Bid)");
    expect(wrapper.text()).toContain("150.000");

    await wrapper.find("button[aria-label='Close']").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should render loading state when isBidAdd is true", () => {
    const store = useAucationsStore();
    store.isBidAdd = true;

    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });
    expect(wrapper.text()).toContain("Mengirim...");
  });

  it("should compute min bid based on start_bid when bids is empty", () => {
    const wrapper = mount(BidModal, {
      props: { aucation: { id: 2, start_bid: 50000, bids: [] } },
    });
    expect(wrapper.text()).toContain("50.000");
  });

  it("should compute min bid based on default 0 when start_bid is absent and bids is empty", () => {
    const wrapper = mount(BidModal, {
      props: { aucation: { id: 3, bids: [] } },
    });
    expect(wrapper.text()).toContain("1.000");
  });

  it("should handle cancel button click", async () => {
    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });
    const cancelBtn = wrapper.findAll("button").find((b) => b.text().includes("Batal"));
    await cancelBtn.trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should validate if bid amount is below minimum", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });

    await wrapper.find("input#bid_amount").setValue(120000);
    await wrapper.find("form").trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalled();
  });

  it("should submit bid successfully when valid", async () => {
    const store = useAucationsStore();
    const bidSpy = vi.spyOn(store, "addBid").mockResolvedValue({ status: "success" });

    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });

    await wrapper.find("input#bid_amount").setValue(200000);
    await wrapper.find("form").trigger("submit.prevent");

    expect(bidSpy).toHaveBeenCalledWith(1, { bid: 200000 });
    expect(wrapper.emitted("success")).toBeTruthy();
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should handle submission error gracefully", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "addBid").mockRejectedValue(new Error("Fail"));

    const wrapper = mount(BidModal, {
      props: { aucation: dummyAucation },
    });

    await wrapper.find("input#bid_amount").setValue(200000);
    await wrapper.find("form").trigger("submit.prevent");
    expect(wrapper.emitted("success")).toBeFalsy();
  });
});
