import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { createMockPinia } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

const mockPush = vi.fn();
vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const customStubs = {
    RouterLink: {
      template: "<a><slot /></a>",
    },
  };

  it("should render login form elements", () => {
    const wrapper = mount(LoginPage, {
      global: {
        stubs: customStubs,
      },
    });
    expect(wrapper.find("input#email").exists()).toBe(true);
    expect(wrapper.find("input#password").exists()).toBe(true);
    expect(wrapper.find("button[type='submit']").text()).toContain("Masuk");
    expect(wrapper.text()).toContain("Daftar sekarang");
  });

  it("should validate empty fields", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(LoginPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Email dan kata sandi wajib diisi!");
  });

  it("should submit login and navigate to home on success", async () => {
    const store = useAuthStore();
    const loginSpy = vi.spyOn(store, "login").mockResolvedValue({ status: "success" });

    const wrapper = mount(LoginPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("input#email").setValue("toman@delcom.org");
    await wrapper.find("input#password").setValue("secret123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(loginSpy).toHaveBeenCalledWith({
      email: "toman@delcom.org",
      password: "secret123",
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("should catch and handle login errors gracefully", async () => {
    const store = useAuthStore();
    vi.spyOn(store, "login").mockRejectedValue(new Error("Login failed"));

    const wrapper = mount(LoginPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("input#email").setValue("toman@delcom.org");
    await wrapper.find("input#password").setValue("wrong");
    await wrapper.find("form").trigger("submit.prevent");

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should render loading state when isAuthLogin is true", () => {
    const store = useAuthStore();
    store.isAuthLogin = true;

    const wrapper = mount(LoginPage, {
      global: { stubs: customStubs },
    });
    expect(wrapper.text()).toContain("Memproses...");
  });
});
