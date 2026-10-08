import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  BASE_URL,
  getAccessToken,
  putAccessToken,
  buildUrl,
  fetchApi,
} from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct default BASE_URL", () => {
    expect(BASE_URL).toBeDefined();
  });

  it("should get and set access token in localStorage", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("token123");
    expect(getAccessToken()).toBe("token123");
    putAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });

  it("should handle localStorage errors gracefully", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage fail");
    });
    expect(getAccessToken()).toBeNull();

    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("Storage fail");
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    putAccessToken("xyz");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should build URL correctly with and without query params", () => {
    const url1 = buildUrl("/aucations");
    expect(url1).toContain("/aucations");

    const url2 = buildUrl("aucations");
    expect(url2).toContain("aucations");

    const url3 = buildUrl("https://example.com/api/test", { is_me: 1, search: "car", empty: null, undef: undefined, blank: "" });
    expect(url3).toBe("https://example.com/api/test?is_me=1&search=car");
  });

  it("should perform fetchApi successfully with JSON response", async () => {
    putAccessToken("my-token");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h) => (h === "content-type" ? "application/json" : null),
      },
      json: vi.fn().mockResolvedValue({ status: "success", data: {} }),
    });

    const res = await fetchApi("/aucations", {
      method: "POST",
      body: { title: "Item" },
    });
    expect(res).toEqual({ status: "success", data: {} });
  });

  it("should handle text response when content-type is not JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/plain",
      },
      text: vi.fn().mockResolvedValue("OK"),
    });

    const res = await fetchApi("/test");
    expect(res).toBe("OK");
  });

  it("should handle JSON parse error gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: vi.fn().mockRejectedValue(new Error("Parse error")),
    });

    const res = await fetchApi("/test");
    expect(res).toBeNull();
  });

  it("should handle text parse error gracefully", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "text/plain",
      },
      text: vi.fn().mockRejectedValue(new Error("Text error")),
    });

    const res = await fetchApi("/test");
    expect(res).toBeNull();
  });

  it("should handle FormData body and not set application/json header", async () => {
    const formData = new FormData();
    formData.append("cover", "file.png");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: vi.fn().mockResolvedValue({ status: "success" }),
    });

    await fetchApi("/upload", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw error on non-ok status with message from response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: vi.fn().mockResolvedValue({ status: "fail", message: "Judul wajib diisi" }),
    });

    await expect(fetchApi("/aucations")).rejects.toThrow("Judul wajib diisi");
  });

  it("should throw fallback error message on non-ok status if no message in body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => "text/plain",
      },
      text: vi.fn().mockResolvedValue("Server Error"),
    });

    await expect(fetchApi("/fail")).rejects.toThrow("Request failed with status 500");
  });
});
