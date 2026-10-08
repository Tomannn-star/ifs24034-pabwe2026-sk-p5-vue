import { describe, it, expect, vi, beforeEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import {
  getAucationsApi,
  getAucationDetailApi,
  addAucationApi,
  updateAucationApi,
  changeCoverAucationApi,
  deleteAucationApi,
  addBidApi,
  deleteBidApi,
  deleteAllAucationsApi,
} from "./aucationApi";

describe("aucationApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should get all aucations with query params", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await getAucationsApi({ is_me: 1, is_closed: 0 });
    expect(spy).toHaveBeenCalledWith("/aucations", { params: { is_me: 1, is_closed: 0 } });
  });

  it("should get aucation detail by id", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await getAucationDetailApi(5);
    expect(spy).toHaveBeenCalledWith("/aucations/5");
  });

  it("should add new aucation", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const payload = { title: "Item", description: "Desc", start_bid: 1000, closed_at: "2026-12-31" };
    await addAucationApi(payload);
    expect(spy).toHaveBeenCalledWith("/aucations", {
      method: "POST",
      body: payload,
    });
  });

  it("should update aucation", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const payload = { title: "Item Updated", description: "Desc", start_bid: 1500, closed_at: "2026-12-31" };
    await updateAucationApi(5, payload);
    expect(spy).toHaveBeenCalledWith("/aucations/5", {
      method: "PUT",
      body: payload,
    });
  });

  it("should change aucation cover", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const formData = new FormData();
    await changeCoverAucationApi(5, formData);
    expect(spy).toHaveBeenCalledWith("/aucations/5/cover", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  });

  it("should delete aucation", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await deleteAucationApi(5);
    expect(spy).toHaveBeenCalledWith("/aucations/5", {
      method: "DELETE",
    });
  });

  it("should add bid", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await addBidApi(5, { bid: 50000 });
    expect(spy).toHaveBeenCalledWith("/aucations/5/bids", {
      method: "POST",
      body: { bid: 50000 },
    });
  });

  it("should delete bid", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await deleteBidApi(5);
    expect(spy).toHaveBeenCalledWith("/aucations/5/bids", {
      method: "DELETE",
    });
  });

  it("should delete all aucations", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    await deleteAllAucationsApi();
    expect(spy).toHaveBeenCalledWith("/aucations", {
      method: "DELETE",
    });
  });
});

