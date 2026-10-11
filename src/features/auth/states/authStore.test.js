import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./authStore";
import * as authApi from "../api/authApi";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as apiHelper from "../../../helpers/apiHelper";

describe("authStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should handle login with response.token fallback", async () => {
    vi.spyOn(authApi, "loginApi").mockResolvedValue({
      token: "top_level_token",
    });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();
    vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const store = useAuthStore();
    await store.login({ email: "user@test.com", password: "123" });

    expect(store.token).toBe("top_level_token");
  });

  it("should handle login successfully with data.token", async () => {
    vi.spyOn(authApi, "loginApi").mockResolvedValue({
      status: "success",
      message: "Sukses",
      data: { token: "token_abc" },
    });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const store = useAuthStore();
    await store.login({ email: "user@test.com", password: "123" });

    expect(store.token).toBe("token_abc");
    expect(putTokenSpy).toHaveBeenCalledWith("token_abc");
    expect(store.isAuthLogin).toBe(false);
  });

  it("should handle login failure", async () => {
    vi.spyOn(authApi, "loginApi").mockRejectedValue(new Error("Email salah"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAuthStore();
    await expect(store.login({ email: "wrong@test.com", password: "123" })).rejects.toThrow("Email salah");

    expect(store.error).toBe("Email salah");
    expect(store.isAuthLogin).toBe(false);
  });

  it("should handle register successfully with and without message", async () => {
    vi.spyOn(authApi, "registerApi").mockResolvedValueOnce({
      status: "success",
      message: "Akun dibuat",
    }).mockResolvedValueOnce({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAuthStore();
    await store.register({ name: "User", email: "user@test.com", password: "123" });
    await store.register({ name: "User2", email: "user2@test.com", password: "123" });

    expect(store.isAuthRegister).toBe(false);
  });

  it("should handle register failure", async () => {
    vi.spyOn(authApi, "registerApi").mockRejectedValue(new Error("Email sudah terdaftar"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAuthStore();
    await expect(
      store.register({ name: "User", email: "user@test.com", password: "123" })
    ).rejects.toThrow("Email sudah terdaftar");

    expect(store.error).toBe("Email sudah terdaftar");
  });

  it("should handle logout and clear token", async () => {
    vi.spyOn(authApi, "logoutApi").mockResolvedValue({ status: "success" });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const store = useAuthStore();
    store.token = "active_token";
    await store.logout();

    expect(store.token).toBeNull();
    expect(putTokenSpy).toHaveBeenCalledWith(null);
    expect(store.isAuthLogout).toBe(false);
  });

  it("should handle logout failure gracefully and still clear token", async () => {
    vi.spyOn(authApi, "logoutApi").mockRejectedValue(new Error("Server error"));
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const store = useAuthStore();
    store.token = "active_token";
    await store.logout();

    expect(store.token).toBeNull();
    expect(putTokenSpy).toHaveBeenCalledWith(null);
    expect(store.error).toBe("Server error");
  });

  it("should handle login and register errors with empty error message", async () => {
    const emptyErr = new Error("");
    vi.spyOn(authApi, "loginApi").mockRejectedValue(emptyErr);
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAuthStore();
    await expect(store.login({ email: "user@test.com", password: "123" })).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Login gagal");

    vi.spyOn(authApi, "registerApi").mockRejectedValue(emptyErr);
    await expect(store.register({ name: "User", email: "user@test.com", password: "123" })).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Registrasi gagal");
  });
});
