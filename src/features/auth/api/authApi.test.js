import { describe, it, expect, vi, beforeEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import { loginApi, registerApi, logoutApi } from "./authApi";

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should call /auth/login with POST and credentials", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await loginApi({ email: "test@delcom.org", password: "password" });
    expect(spy).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "test@delcom.org", password: "password" },
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should call /auth/register with POST and payload", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await registerApi({ name: "User", email: "user@delcom.org", password: "secret" });
    expect(spy).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "User", email: "user@delcom.org", password: "secret" },
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should call /auth/logout with POST", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await logoutApi();
    expect(spy).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
    });
    expect(res).toEqual({ status: "success" });
  });
});

