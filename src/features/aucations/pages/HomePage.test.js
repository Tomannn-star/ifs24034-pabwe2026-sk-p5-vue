import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "../states/aucationsStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const dummyAucations = [
    {
      id: 1,
      title: "MacBook Pro",
      description: "Super mulus",
      cover: null,
      start_bid: 10000000,
      closed_at: "2026-12-31 23:59:59",
      bids: [{ id: 1, bid: 11000000 }],
    },
    {
      id: 2,
      title: "iPhone 13",
      description: "Mulus",
      cover: "broken.jpg",
      start_bid: 7000000,
      closed_at: "2020-01-01 00:00:00",
      bids: [],
    },
    {
      id: 3,
      title: "Tanpa Tanggal",
      description: "No date",
      closed_at: null,
      start_bid: 1000,
      bids: [],
    },
    {
      id: 4,
      title: "Fallback Bid Item",
      description: "Test fallback bid and start_bid",
      closed_at: null,
      start_bid: null,
      bids: [{ id: 99, bid: null }],
    },
    {
      id: 5,
      title: "Fallback Start Bid Only",
      description: "Test fallback start_bid",
      closed_at: null,
      start_bid: null,
      bids: [],
    },
  ];

  it("should fetch aucations on mount and render list", async () => {
    const store = useAucationsStore();
    const fetchSpy = vi.spyOn(store, "fetchAucations").mockImplementation(async () => {
      store.aucations = dummyAucations;
    });

    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          RouterLink: { template: "<a><slot /></a>" },
          AddModal: { template: "<div data-testid='add-modal'></div>" },
        },
      },
    });

    expect(fetchSpy).toHaveBeenCalled();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("MacBook Pro");
    expect(wrapper.text()).toContain("iPhone 13");
  });

  it("should render loading state", () => {
    const store = useAucationsStore();
    store.isAucation = true;

    const wrapper = mount(HomePage, {
      global: { stubs: ["RouterLink", "AddModal"] },
    });
    expect(wrapper.find("[data-testid='loading']").exists()).toBe(true);
  });

  it("should render empty state", () => {
    const store = useAucationsStore();
    store.aucations = [];
    store.isAucation = false;

    const wrapper = mount(HomePage, {
      global: { stubs: ["RouterLink", "AddModal"] },
    });
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan.");
  });

  it("should filter auctions by search query", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "fetchAucations").mockImplementation(async () => {
      store.aucations = dummyAucations;
    });

    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          RouterLink: { template: "<a><slot /></a>" },
          AddModal: { template: "<div data-testid='add-modal'></div>" },
        },
      },
    });

    await wrapper.vm.$nextTick();
    await wrapper.find("input[placeholder='Cari lelang...']").setValue("MacBook");
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("MacBook Pro");
    expect(wrapper.text()).not.toContain("iPhone 13");
  });

  it("should switch tabs and refetch with correct params", async () => {
    const store = useAucationsStore();
    const fetchSpy = vi.spyOn(store, "fetchAucations").mockResolvedValue();

    const wrapper = mount(HomePage, {
      global: { stubs: ["RouterLink", "AddModal"] },
    });

    const tabButtons = wrapper.findAll("button").filter((b) => b.text().includes("Lelang Saya"));
    await tabButtons[0].trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_me: 1 });

    const openTab = wrapper.findAll("button").filter((b) => b.text().includes("Sedang Berlangsung"));
    await openTab[0].trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_closed: 1 });

    const closedTab = wrapper.findAll("button").filter((b) => b.text().includes("Ditutup"));
    await closedTab[0].trigger("click");
    expect(fetchSpy).toHaveBeenCalledWith({ is_closed: 0 });
  });

  it("should open, handle success, and close AddModal", async () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          RouterLink: true,
          AddModal: {
            template: `<div>
              <button @click="$emit('success')" data-testid='success-add'></button>
              <button @click="$emit('close')" data-testid='close-add'></button>
            </div>`,
          },
        },
      },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.vm.showAddModal).toBe(true);

    await wrapper.find("[data-testid='success-add']").trigger("click");
    await wrapper.find("[data-testid='close-add']").trigger("click");
    expect(wrapper.vm.showAddModal).toBe(false);
  });

  it("should handle delete all with confirmation", async () => {
    const store = useAucationsStore();
    const deleteSpy = vi.spyOn(store, "deleteAllAucations").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);

    const wrapper = mount(HomePage, {
      global: { stubs: ["RouterLink", "AddModal"] },
    });

    const deleteBtn = wrapper.findAll("button").find((b) => b.text().includes("Hapus Semua"));
    await deleteBtn.trigger("click");

    expect(deleteSpy).toHaveBeenCalled();
  });

  it("should cancel delete all", async () => {
    const store = useAucationsStore();
    const deleteSpy = vi.spyOn(store, "deleteAllAucations").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);

    const wrapper = mount(HomePage, {
      global: { stubs: ["RouterLink", "AddModal"] },
    });

    const deleteBtn = wrapper.findAll("button").find((b) => b.text().includes("Hapus Semua"));
    await deleteBtn.trigger("click");

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("should fallback on image error", async () => {
    const store = useAucationsStore();
    vi.spyOn(store, "fetchAucations").mockImplementation(async () => {
      store.aucations = dummyAucations;
    });

    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          RouterLink: { template: "<a><slot /></a>" },
          AddModal: { template: "<div data-testid='add-modal'></div>" },
        },
      },
    });

    await wrapper.vm.$nextTick();
    const img = wrapper.findAll("img")[0];
    await img.trigger("error");
    expect(img.attributes("src")).toContain("unsplash.com");
  });
});
