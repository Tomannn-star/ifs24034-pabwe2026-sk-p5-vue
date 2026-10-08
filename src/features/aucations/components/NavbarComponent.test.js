import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { createMockPinia } from "../../../test-utils";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockPush = vi.fn();
vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => ({ push: mockPush }),
  };
});

describe("NavbarComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const customStubs = {
    RouterLink: {
      template: "<a><slot /></a>",
    },
  };

  it("should render navbar correctly and emit toggle-sidebar", async () => {
    const wrapper = mount(NavbarComponent, {
      global: { stubs: customStubs },
    });
    expect(wrapper.text()).toContain("Delcom Auction");
    await wrapper.find("button[aria-label='Toggle Sidebar']").trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toBeTruthy();
  });

  it("should fetch profile on mount if not yet fetched", () => {
    const usersStore = useUsersStore();
    usersStore.profile = null;
    const fetchSpy = vi.spyOn(usersStore, "fetchProfile").mockResolvedValue();

    mount(NavbarComponent, {
      global: { stubs: customStubs },
    });
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should handle logout when confirmed", async () => {
    const authStore = useAuthStore();
    const logoutSpy = vi.spyOn(authStore, "logout").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(true);

    const wrapper = mount(NavbarComponent, {
      global: { stubs: customStubs },
    });
    await wrapper.find("button[title='Keluar']").trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should not logout when cancelled", async () => {
    const authStore = useAuthStore();
    const logoutSpy = vi.spyOn(authStore, "logout").mockResolvedValue();
    vi.spyOn(toolsHelper, "showConfirmDialog").mockResolvedValue(false);

    const wrapper = mount(NavbarComponent, {
      global: { stubs: customStubs },
    });
    await wrapper.find("button[title='Keluar']").trigger("click");

    expect(logoutSpy).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should handle image error gracefully", async () => {
    const usersStore = useUsersStore();
    usersStore.profile = { name: "User", photo: "broken.png" };

    const wrapper = mount(NavbarComponent, {
      global: { stubs: customStubs },
    });
    const img = wrapper.find("img[alt='User']");
    await img.trigger("error");
    expect(img.attributes("src")).toContain("ui-avatars.com");
  });
});
