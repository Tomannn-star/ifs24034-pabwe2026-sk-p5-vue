import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import UsersPage from "./UsersPage.vue";
import { createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  it("should fetch users on mount and render list", async () => {
    const store = useUsersStore();
    const fetchSpy = vi.spyOn(store, "fetchUsers").mockImplementation(async () => {
      store.users = [
        { id: 1, name: "Toman", email: "toman@delcom.org", photo: null, created_at: "2026-10-01" },
      ];
    });

    const wrapper = mount(UsersPage);
    expect(fetchSpy).toHaveBeenCalled();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Toman");
    expect(wrapper.text()).toContain("toman@delcom.org");
  });

  it("should render loading state when isUsers is true", () => {
    const store = useUsersStore();
    store.isUsers = true;

    const wrapper = mount(UsersPage);
    expect(wrapper.find("[data-testid='loading']").exists()).toBe(true);
  });

  it("should render empty state when users is empty", () => {
    const store = useUsersStore();
    store.users = [];
    store.isUsers = false;

    const wrapper = mount(UsersPage);
    expect(wrapper.text()).toContain("Belum ada data pengguna.");
  });

  it("should fallback on image error", async () => {
    const store = useUsersStore();
    store.users = [{ id: 1, name: "Test", email: "test@delcom.org", photo: "broken.jpg" }];

    const wrapper = mount(UsersPage);
    const img = wrapper.find("img");
    await img.trigger("error");
    expect(img.attributes("src")).toContain("ui-avatars.com");
  });
});

