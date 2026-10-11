import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockPush = vi.fn();
let mockParams = { aucationId: 1 };
vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
    useRoute: () => ({ params: mockParams }),
  };
});

describe("DetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
    mockParams = { aucationId: 1 };
  });

  const customStubs = {
    RouterLink: {
      template: "<a><slot /></a>",
    },
    MarkdownViewer: true,
    ChangeModal: {
      template: "<button @click=\"$emit('close'); $emit('success')\" data-testid='close-edit'></button>",
    },
    ChangeCoverModal: {
      template: "<button @click=\"$emit('close'); $emit('success')\" data-testid='close-cover'></button>",
    },
    BidModal: {
      template: "<button @click=\"$emit('close'); $emit('success')\" data-testid='close-bid'></button>",
    },
  };

  const dummyAucation = {
    id: 1,
    user_id: 1,
    title: "Detail Auction Item",
    cover: "img.png",
    description: "Good condition",
    start_bid: 1000000,
    closed_at: "2026-12-31 23:59:59",
    author: { name: "Toman" },
    bids: [
      { id: 10, bid: 1500000, created_at: "2026-10-01" },
    ],
    my_bid: { id: 10, bid: 1500000 },
  };

  it("should render owner actions and handle modals", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = dummyAucation;
    vi.spyOn(aucStore, "fetchAucationDetail").mockResolvedValue(dummyAucation);

    const usrStore = useUsersStore();
    usrStore.profile = { id: 1, name: "Toman" };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Detail Auction Item");
    expect(wrapper.text()).toContain("Kembali ke Dashboard");

    // Open & close edit modal
    await wrapper.findAll("button").find((b) => b.text().includes("Ubah")).trigger("click");
    expect(wrapper.vm.showEditModal).toBe(true);
    await wrapper.find("[data-testid='close-edit']").trigger("click");
    expect(wrapper.vm.showEditModal).toBe(false);

    // Open & close cover modal
    await wrapper.findAll("button").find((b) => b.text().includes("Ganti Cover")).trigger("click");
    expect(wrapper.vm.showCoverModal).toBe(true);
    await wrapper.find("[data-testid='close-cover']").trigger("click");
    expect(wrapper.vm.showCoverModal).toBe(false);
  });

  it("should render participant actions and handle bid modal", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = dummyAucation;
    vi.spyOn(aucStore, "fetchAucationDetail").mockResolvedValue(dummyAucation);

    const usrStore = useUsersStore();
    usrStore.profile = { id: 2, name: "Other User" };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Ajukan Tawaran");

    await wrapper.findAll("button").find((b) => b.text().includes("Ajukan Tawaran")).trigger("click");
    expect(wrapper.vm.showBidModal).toBe(true);
    await wrapper.find("[data-testid='close-bid']").trigger("click");
    expect(wrapper.vm.showBidModal).toBe(false);
  });

  it("should handle delete auction confirmation and cancellation", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = dummyAucation;
    const deleteSpy = vi.spyOn(aucStore, "deleteAucation").mockResolvedValue();

    const usrStore = useUsersStore();
    usrStore.profile = { id: 1 };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    // Cancel deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    await wrapper.findAll("button").find((b) => b.text().includes("Hapus")).trigger("click");
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirm deletion
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    await wrapper.findAll("button").find((b) => b.text().includes("Hapus")).trigger("click");
    expect(deleteSpy).toHaveBeenCalledWith(1);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should handle cancel bid confirmation and cancellation", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = dummyAucation;
    const cancelBidSpy = vi.spyOn(aucStore, "deleteBid").mockResolvedValue();

    const usrStore = useUsersStore();
    usrStore.profile = { id: 2 };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    // Cancel cancellation
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);
    await wrapper.findAll("button").find((b) => b.text().includes("Batalkan Tawaran")).trigger("click");
    expect(cancelBidSpy).not.toHaveBeenCalled();

    // Confirm cancellation
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);
    await wrapper.findAll("button").find((b) => b.text().includes("Batalkan Tawaran")).trigger("click");
    expect(cancelBidSpy).toHaveBeenCalledWith(1);
  });

  it("should render when auction has no bids and closed_at is in past", () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = {
      id: 3,
      user_id: 3,
      title: "Closed with no bids",
      closed_at: "2020-01-01 00:00:00",
      start_bid: 50000,
      bids: null,
    };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    expect(wrapper.text()).toContain("Ditutup");
    expect(wrapper.text()).toContain("Belum ada penawaran untuk lelang ini.");
    expect(wrapper.vm.sortedBids).toEqual([]);
  });

  it("should handle image error", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = dummyAucation;
    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    const img = wrapper.find("img");
    await img.trigger("error");
    expect(img.attributes("src")).toContain("unsplash.com");
  });

  it("should render loading state when isAucation is true and aucation is null", () => {
    const aucStore = useAucationsStore();
    aucStore.isAucation = true;
    aucStore.aucation = null;

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    expect(wrapper.find("[data-testid='detail-loading']").exists()).toBe(true);
  });

  it("should handle profile fetch rejection and missing aucationId param", async () => {
    mockParams = { aucationId: null };
    const usrStore = useUsersStore();
    usrStore.profile = null;
    vi.spyOn(usrStore, "fetchProfile").mockRejectedValue(new Error("Profile fail"));

    const aucStore = useAucationsStore();
    const fetchSpy = vi.spyOn(aucStore, "fetchAucationDetail").mockResolvedValue();

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    await wrapper.vm.$nextTick();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should handle auction with null closed_at, null cover, and bids with fallback bid values", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = {
      id: 5,
      user_id: 99,
      title: "No Date No Cover Auction",
      closed_at: null,
      cover: null,
      start_bid: null,
      bids: [
        { id: 1, bid: null, created_at: "2026-10-01" },
        { id: 2, bid: null, created_at: "2026-10-02" },
        { id: 3, bid: 200000, created_at: "2026-10-03" },
        { id: 4, bid: 100000, created_at: "2026-10-04" },
      ],
    };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Berlangsung");
    expect(wrapper.find("img").attributes("src")).toBe("/default-auction.png");
    expect(wrapper.vm.sortedBids).toHaveLength(4);
  });

  it("should handle empty bids and null start_bid", async () => {
    const aucStore = useAucationsStore();
    aucStore.aucation = {
      id: 6,
      user_id: 99,
      title: "Zero Start Bid",
      closed_at: null,
      start_bid: null,
      bids: [],
    };

    const wrapper = mount(DetailPage, {
      global: { stubs: customStubs },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Rp 0");
  });
});
