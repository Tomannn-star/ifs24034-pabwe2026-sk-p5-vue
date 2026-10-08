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
});
