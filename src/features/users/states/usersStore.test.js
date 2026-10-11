import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useUsersStore } from "./usersStore";
import * as userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("usersStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should fetch all users successfully with and without users array", async () => {
    vi.spyOn(userApi, "getUsersApi")
      .mockResolvedValueOnce({
        status: "success",
        data: { users: [{ id: 1, name: "User 1" }] },
      })
      .mockResolvedValueOnce({});

    const store = useUsersStore();
    const result = await store.fetchUsers();
    expect(result).toHaveLength(1);

    const result2 = await store.fetchUsers();
    expect(result2).toHaveLength(0);
  });

  it("should handle error in fetchUsers", async () => {
    vi.spyOn(userApi, "getUsersApi").mockRejectedValue(new Error("Network error"));

    const store = useUsersStore();
    await expect(store.fetchUsers()).rejects.toThrow("Network error");
    expect(store.error).toBe("Network error");
  });

  it("should fetch user by ID with and without user object", async () => {
    vi.spyOn(userApi, "getUserByIdApi")
      .mockResolvedValueOnce({
        status: "success",
        data: { user: { id: 2, name: "User 2" } },
      })
      .mockResolvedValueOnce({});

    const store = useUsersStore();
    const result = await store.fetchUserById(2);
    expect(result.name).toBe("User 2");

    const result2 = await store.fetchUserById(3);
    expect(result2).toBeNull();
  });

  it("should handle error in fetchUserById", async () => {
    vi.spyOn(userApi, "getUserByIdApi").mockRejectedValue(new Error("Not found"));

    const store = useUsersStore();
    await expect(store.fetchUserById(99)).rejects.toThrow("Not found");
  });

  it("should fetch profile successfully with and without user object", async () => {
    vi.spyOn(userApi, "getProfileApi")
      .mockResolvedValueOnce({
        status: "success",
        data: { user: { id: 1, name: "My Profile" } },
      })
      .mockResolvedValueOnce({});

    const store = useUsersStore();
    const result = await store.fetchProfile();
    expect(result.name).toBe("My Profile");

    const result2 = await store.fetchProfile();
    expect(result2).toBeNull();
  });

  it("should handle error in fetchProfile", async () => {
    vi.spyOn(userApi, "getProfileApi").mockRejectedValue(new Error("Unauthorized"));

    const store = useUsersStore();
    await expect(store.fetchProfile()).rejects.toThrow("Unauthorized");
    expect(store.error).toBe("Unauthorized");
  });

  it("should update profile successfully with and without existing profile", async () => {
    vi.spyOn(userApi, "updateProfileApi")
      .mockResolvedValueOnce({ status: "success", message: "Profil diupdate" })
      .mockResolvedValueOnce({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useUsersStore();
    store.profile = { id: 1, name: "Old Name" };
    await store.updateProfile({ name: "New Name" });
    expect(store.profile.name).toBe("New Name");

    store.profile = null;
    await store.updateProfile({ name: "Another" });
    expect(store.profile).toBeNull();
  });

  it("should handle update profile error", async () => {
    vi.spyOn(userApi, "updateProfileApi").mockRejectedValue(new Error("Gagal"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useUsersStore();
    await expect(store.updateProfile({ name: "Error" })).rejects.toThrow("Gagal");
    expect(store.error).toBe("Gagal");
  });

  it("should update photo successfully with and without message", async () => {
    vi.spyOn(userApi, "changePhotoProfileApi")
      .mockResolvedValueOnce({ status: "success", message: "Updated" })
      .mockResolvedValueOnce({});
    vi.spyOn(userApi, "getProfileApi").mockResolvedValue({ status: "success", data: { user: { id: 1 } } });
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useUsersStore();
    await store.updatePhoto(new FormData());
    await store.updatePhoto(new FormData());
    expect(store.isPhotoUpdating).toBe(false);
  });

  it("should handle update photo error", async () => {
    vi.spyOn(userApi, "changePhotoProfileApi").mockRejectedValue(new Error("Upload fail"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useUsersStore();
    await expect(store.updatePhoto(new FormData())).rejects.toThrow("Upload fail");
    expect(store.error).toBe("Upload fail");
  });

  it("should update password successfully with and without message", async () => {
    vi.spyOn(userApi, "changePasswordApi")
      .mockResolvedValueOnce({ status: "success", message: "Updated" })
      .mockResolvedValueOnce({});
    vi.spyOn(toolsHelper, "showSuccessDialog").mockResolvedValue();

    const store = useUsersStore();
    await store.updatePassword({ password: "old", new_password: "new", new_password_confirmation: "new" });
    await store.updatePassword({ password: "old", new_password: "new", new_password_confirmation: "new" });
    expect(store.isPasswordUpdating).toBe(false);
  });

  it("should handle update password error", async () => {
    vi.spyOn(userApi, "changePasswordApi").mockRejectedValue(new Error("Password salah"));
    vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useUsersStore();
    await expect(store.updatePassword({})).rejects.toThrow("Password salah");
    expect(store.error).toBe("Password salah");
  });

  it("should handle updateProfile, updatePhoto, and updatePassword with empty error message", async () => {
    const emptyErr = new Error("");
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const store = useUsersStore();

    vi.spyOn(userApi, "updateProfileApi").mockRejectedValue(emptyErr);
    await expect(store.updateProfile({ name: "Error" })).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal memperbarui profil");

    vi.spyOn(userApi, "changePhotoProfileApi").mockRejectedValue(emptyErr);
    await expect(store.updatePhoto(new FormData())).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal memperbarui foto");

    vi.spyOn(userApi, "changePasswordApi").mockRejectedValue(emptyErr);
    await expect(store.updatePassword({})).rejects.toThrow();
    expect(errSpy).toHaveBeenCalledWith("Gagal mengubah kata sandi");
  });
});
