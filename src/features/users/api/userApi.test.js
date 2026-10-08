import { describe, it, expect, vi, beforeEach } from "vitest";
import * as apiHelper from "../../../helpers/apiHelper";
import {
  getUsersApi,
  getUserByIdApi,
  getProfileApi,
  updateProfileApi,
  changePhotoProfileApi,
  changePasswordApi,
} from "./userApi";

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch all users", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success", data: { users: [] } });
    const res = await getUsersApi();
    expect(spy).toHaveBeenCalledWith("/users");
    expect(res).toEqual({ status: "success", data: { users: [] } });
  });

  it("should fetch user by ID", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success", data: { user: {} } });
    const res = await getUserByIdApi(1);
    expect(spy).toHaveBeenCalledWith("/users/1");
    expect(res).toEqual({ status: "success", data: { user: {} } });
  });

  it("should fetch profile", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success", data: { user: {} } });
    const res = await getProfileApi();
    expect(spy).toHaveBeenCalledWith("/users/me");
    expect(res).toEqual({ status: "success", data: { user: {} } });
  });

  it("should update profile", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await updateProfileApi({ name: "Updated Name" });
    expect(spy).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Updated Name" },
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should change profile photo", async () => {
    const formData = new FormData();
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await changePhotoProfileApi(formData);
    expect(spy).toHaveBeenCalledWith("/users/me/photo", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should change password with primary route /users/password", async () => {
    const spy = vi.spyOn(apiHelper, "fetchApi").mockResolvedValue({ status: "success" });
    const res = await changePasswordApi({ password: "old", new_password: "new", new_password_confirmation: "new" });
    expect(spy).toHaveBeenCalledWith("/users/password", {
      method: "PUT",
      body: { password: "old", new_password: "new", new_password_confirmation: "new" },
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should fallback to /users/me/password if /users/password returns 404", async () => {
    const err404 = new Error("Not Found");
    err404.status = 404;

    const spy = vi.spyOn(apiHelper, "fetchApi")
      .mockRejectedValueOnce(err404)
      .mockResolvedValueOnce({ status: "success" });

    const res = await changePasswordApi({ password: "old", new_password: "new", new_password_confirmation: "new" });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenNthCalledWith(2, "/users/me/password", {
      method: "PUT",
      body: { password: "old", new_password: "new", new_password_confirmation: "new" },
    });
    expect(res).toEqual({ status: "success" });
  });

  it("should rethrow error if not 404", async () => {
    const err500 = new Error("Internal Server Error");
    err500.status = 500;
    vi.spyOn(apiHelper, "fetchApi").mockRejectedValue(err500);

    await expect(
      changePasswordApi({ password: "old", new_password: "new", new_password_confirmation: "new" })
    ).rejects.toThrow("Internal Server Error");
  });
});

