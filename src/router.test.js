import { describe, it, expect, vi, beforeEach } from "vitest";
import router, { routes } from "./router";
import * as apiHelper from "./helpers/apiHelper";

describe("router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct routes definition", () => {
    expect(routes).toHaveLength(3);
    expect(routes[0].path).toBe("/auth");
    expect(routes[1].path).toBe("/");
    expect(routes[2].path).toBe("/:pathMatch(.*)*");
  });

  it("should redirect unauthenticated users to /auth/login", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    await router.push("/profile");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("should allow unauthenticated users to access /auth/register", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    await router.push("/auth/register");
    expect(router.currentRoute.value.path).toBe("/auth/register");
  });

  it("should allow authenticated users to access protected routes", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    await router.push("/users");
    expect(router.currentRoute.value.path).toBe("/users");
  });

  it("should redirect authenticated users from /auth/login to /", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    // Navigate away first to ensure a location change occurs
    await router.push("/users");
    await router.push("/auth/login");
    expect(router.currentRoute.value.path).toBe("/");
  });
});
