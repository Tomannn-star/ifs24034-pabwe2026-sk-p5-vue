import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
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

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const customStubs = {
    RouterLink: {
      template: "<a><slot /></a>",
    },
  };

  it("should render registration form elements", () => {
    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });
    expect(wrapper.find("input#name").exists()).toBe(true);
    expect(wrapper.find("input#email").exists()).toBe(true);
    expect(wrapper.find("input#password").exists()).toBe(true);
    expect(wrapper.find("input#confirmPassword").exists()).toBe(true);
    expect(wrapper.text()).toContain("Masuk di sini");
  });

  it("should validate empty fields", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("form").trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Semua kolom wajib diisi!");
  });

  it("should validate mismatched passwords", async () => {
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();
    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("input#name").setValue("Toman");
    await wrapper.find("input#email").setValue("toman@delcom.org");
    await wrapper.find("input#password").setValue("pass123");
    await wrapper.find("input#confirmPassword").setValue("different");
    await wrapper.find("form").trigger("submit.prevent");

    expect(errSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");
  });

  it("should submit register and navigate to login on success", async () => {
    const store = useAuthStore();
    const regSpy = vi.spyOn(store, "register").mockResolvedValue({ status: "success" });

    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("input#name").setValue("Toman");
    await wrapper.find("input#email").setValue("toman@delcom.org");
    await wrapper.find("input#password").setValue("pass123");
    await wrapper.find("input#confirmPassword").setValue("pass123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(regSpy).toHaveBeenCalledWith({
      name: "Toman",
      email: "toman@delcom.org",
      password: "pass123",
    });
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle register error gracefully", async () => {
    const store = useAuthStore();
    vi.spyOn(store, "register").mockRejectedValue(new Error("Gagal"));

    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });

    await wrapper.find("input#name").setValue("Toman");
    await wrapper.find("input#email").setValue("toman@delcom.org");
    await wrapper.find("input#password").setValue("pass123");
    await wrapper.find("input#confirmPassword").setValue("pass123");
    await wrapper.find("form").trigger("submit.prevent");

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should render loading state when isAuthRegister is true", () => {
    const store = useAuthStore();
    store.isAuthRegister = true;

    const wrapper = mount(RegisterPage, {
      global: { stubs: customStubs },
    });
    expect(wrapper.text()).toContain("Mendaftarkan...");
  });
});
