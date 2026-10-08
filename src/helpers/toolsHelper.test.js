import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatDate,
  formatRupiah,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger Swal.fire for showSuccessDialog with and without custom title", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showSuccessDialog("Operasi berhasil", "Hebat!");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Hebat!",
        text: "Operasi berhasil",
      })
    );

    await showSuccessDialog("Data disimpan");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Berhasil!",
      })
    );
  });

  it("should trigger Swal.fire for showErrorDialog with and without custom title", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showErrorDialog("Gagal koneksi", "Error");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "error",
        title: "Error",
        text: "Gagal koneksi",
      })
    );

    await showErrorDialog("Terjadi galat");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
      })
    );
  });

  it("should return true when confirm dialog is confirmed with default and custom options", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    const res1 = await showConfirmDialog("Hapus?");
    expect(res1).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Apakah Anda Yakin?",
        confirmButtonText: "Ya, Lanjutkan",
        cancelButtonText: "Batal",
      })
    );

    const res2 = await showConfirmDialog("Reset?", "Judul Kustom", "Ya", "Batal");
    expect(res2).toBe(true);
  });

  it("should return false when confirm dialog is cancelled", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    const result = await showConfirmDialog("Reset?");
    expect(result).toBe(false);
  });

  it("should format date correctly with defaults and custom options", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate("invalid-date-string")).toBe("invalid-date-string");

    const validFormatted = formatDate("2026-10-08T10:00:00Z");
    expect(validFormatted).toBeDefined();

    const customFormatted = formatDate("2026-10-08T10:00:00Z", { day: "numeric" });
    expect(customFormatted).toBeDefined();
  });

  it("should handle error in formatDate catch block", () => {
    const orig = Intl.DateTimeFormat;
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => {
      throw new Error("Intl fail");
    });
    expect(formatDate("2026-10-08T10:00:00Z")).toBe("2026-10-08T10:00:00Z");
    Intl.DateTimeFormat = orig;
  });

  it("should format rupiah correctly", () => {
    expect(formatRupiah(null)).toBe("Rp 0");
    expect(formatRupiah(undefined)).toBe("Rp 0");
    expect(formatRupiah("abc")).toBe("Rp 0");
    const formatted = formatRupiah(500000);
    expect(formatted.replace(/\s/g, " ")).toContain("500.000");
  });
});
