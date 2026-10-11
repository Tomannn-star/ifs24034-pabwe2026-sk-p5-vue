import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAucationsStore } from "./aucationsStore";
import * as aucationApi from "../api/aucationApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("aucationsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should fetch aucations successfully with and without aucations list", async () => {
    vi.spyOn(aucationApi, "getAucationsApi")
      .mockResolvedValueOnce({
        status: "success",
        data: { aucations: [{ id: 1, title: "Item 1" }] },
      })
      .mockResolvedValueOnce({});

    const store = useAucationsStore();
    const result = await store.fetchAucations();
    expect(result).toHaveLength(1);

    const result2 = await store.fetchAucations();
    expect(result2).toHaveLength(0);
  });

  it("should handle error in fetchAucations", async () => {
    vi.spyOn(aucationApi, "getAucationsApi").mockRejectedValue(new Error("Network err"));

    const store = useAucationsStore();
    await expect(store.fetchAucations()).rejects.toThrow("Network err");
    expect(store.error).toBe("Network err");
  });

  it("should fetch aucation detail successfully with and without aucation object", async () => {
    vi.spyOn(aucationApi, "getAucationDetailApi")
      .mockResolvedValueOnce({
        status: "success",
        data: { aucation: { id: 1, title: "Detail Item" } },
      })
      .mockResolvedValueOnce({});

    const store = useAucationsStore();
    const result = await store.fetchAucationDetail(1);
    expect(result.title).toBe("Detail Item");

    const result2 = await store.fetchAucationDetail(2);
    expect(result2).toBeNull();
  });

  it("should handle error in fetchAucationDetail", async () => {
    vi.spyOn(aucationApi, "getAucationDetailApi").mockRejectedValue(new Error("Not found"));

    const store = useAucationsStore();
    await expect(store.fetchAucationDetail(99)).rejects.toThrow("Not found");
  });

  it("should add aucation successfully with and without message", async () => {
    vi.spyOn(aucationApi, "addAucationApi")
      .mockResolvedValueOnce({ status: "success", message: "Created" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationsApi").mockResolvedValue({ status: "success", data: { aucations: [] } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.addAucation({ title: "New" });
    await store.addAucation({ title: "New2" });
    expect(store.isAucationAdded).toBe(true);
  });

  it("should handle error in addAucation", async () => {
    vi.spyOn(aucationApi, "addAucationApi").mockRejectedValue(new Error("Fail create"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.addAucation({})).rejects.toThrow("Fail create");
    expect(store.error).toBe("Fail create");
  });

  it("should change aucation successfully with and without message", async () => {
    vi.spyOn(aucationApi, "updateAucationApi")
      .mockResolvedValueOnce({ status: "success", message: "Updated" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationDetailApi").mockResolvedValue({ status: "success", data: { aucation: { id: 1 } } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.changeAucation(1, { title: "Updated" });
    await store.changeAucation(1, { title: "Updated2" });
    expect(store.isAucationChanged).toBe(true);
  });

  it("should handle error in changeAucation", async () => {
    vi.spyOn(aucationApi, "updateAucationApi").mockRejectedValue(new Error("Update fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.changeAucation(1, {})).rejects.toThrow("Update fail");
  });

  it("should change aucation cover successfully with and without message", async () => {
    vi.spyOn(aucationApi, "changeCoverAucationApi")
      .mockResolvedValueOnce({ status: "success", message: "Cover updated" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationDetailApi").mockResolvedValue({ status: "success", data: { aucation: { id: 1 } } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.changeAucationCover(1, new FormData());
    await store.changeAucationCover(1, new FormData());
    expect(store.isAucationChangedCover).toBe(true);
  });

  it("should handle error in changeAucationCover", async () => {
    vi.spyOn(aucationApi, "changeCoverAucationApi").mockRejectedValue(new Error("Cover fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.changeAucationCover(1, new FormData())).rejects.toThrow("Cover fail");
  });

  it("should delete aucation successfully with and without message", async () => {
    vi.spyOn(aucationApi, "deleteAucationApi")
      .mockResolvedValueOnce({ status: "success", message: "Deleted" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationsApi").mockResolvedValue({ status: "success", data: { aucations: [] } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.deleteAucation(1);
    await store.deleteAucation(2);
    expect(store.isAucationDeleted).toBe(true);
  });

  it("should handle error in deleteAucation", async () => {
    vi.spyOn(aucationApi, "deleteAucationApi").mockRejectedValue(new Error("Delete fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.deleteAucation(1)).rejects.toThrow("Delete fail");
  });

  it("should add bid successfully with and without message", async () => {
    vi.spyOn(aucationApi, "addBidApi")
      .mockResolvedValueOnce({ status: "success", message: "Bid ok" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationDetailApi").mockResolvedValue({ status: "success", data: { aucation: { id: 1 } } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.addBid(1, { bid: 50000 });
    await store.addBid(1, { bid: 60000 });
    expect(store.isBidAdded).toBe(true);
  });

  it("should handle error in addBid", async () => {
    vi.spyOn(aucationApi, "addBidApi").mockRejectedValue(new Error("Bid too low"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.addBid(1, { bid: 1000 })).rejects.toThrow("Bid too low");
  });

  it("should delete bid successfully with and without message", async () => {
    vi.spyOn(aucationApi, "deleteBidApi")
      .mockResolvedValueOnce({ status: "success", message: "Cancelled" })
      .mockResolvedValueOnce({});
    vi.spyOn(aucationApi, "getAucationDetailApi").mockResolvedValue({ status: "success", data: { aucation: { id: 1 } } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.deleteBid(1);
    await store.deleteBid(1);
    expect(store.isBidDeleted).toBe(true);
  });

  it("should handle error in deleteBid", async () => {
    vi.spyOn(aucationApi, "deleteBidApi").mockRejectedValue(new Error("Cancel fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.deleteBid(1)).rejects.toThrow("Cancel fail");
  });

  it("should delete all aucations successfully with and without message", async () => {
    vi.spyOn(aucationApi, "deleteAllAucationsApi")
      .mockResolvedValueOnce({ status: "success", message: "All deleted" })
      .mockResolvedValueOnce({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useAucationsStore();
    await store.deleteAllAucations();
    await store.deleteAllAucations();
    expect(store.isAucationDeletedAll).toBe(true);
  });

  it("should handle error in deleteAllAucations", async () => {
    vi.spyOn(aucationApi, "deleteAllAucationsApi").mockRejectedValue(new Error("Delete all fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();
    await expect(store.deleteAllAucations()).rejects.toThrow("Delete all fail");
  });

  it("should handle empty error message in addAucation, changeAucation, changeCover, delete, addBid, deleteBid, deleteAll", async () => {
    const emptyErr = new Error("");
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useAucationsStore();

    vi.spyOn(aucationApi, "addAucationApi").mockRejectedValue(emptyErr);
    await expect(store.addAucation({})).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal membuat lelang");

    vi.spyOn(aucationApi, "updateAucationApi").mockRejectedValue(emptyErr);
    await expect(store.changeAucation(1, {})).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal memperbarui lelang");

    vi.spyOn(aucationApi, "changeCoverAucationApi").mockRejectedValue(emptyErr);
    await expect(store.changeAucationCover(1, new FormData())).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal memperbarui cover");

    vi.spyOn(aucationApi, "deleteAucationApi").mockRejectedValue(emptyErr);
    await expect(store.deleteAucation(1)).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal menghapus lelang");

    vi.spyOn(aucationApi, "addBidApi").mockRejectedValue(emptyErr);
    await expect(store.addBid(1, {})).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal mengajukan tawaran");

    vi.spyOn(aucationApi, "deleteBidApi").mockRejectedValue(emptyErr);
    await expect(store.deleteBid(1)).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal membatalkan tawaran");

    vi.spyOn(aucationApi, "deleteAllAucationsApi").mockRejectedValue(emptyErr);
    await expect(store.deleteAllAucations()).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal menghapus semua lelang");
  });
});
