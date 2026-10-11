import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProfilePage from "./ProfilePage.vue";
import { createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createMockPinia();
  });

  const dummyProfile = {
    id: 1,
    name: "Toman Sihombing",
    email: "toman@delcom.org",
    photo: null,
    created_at: "2026-10-01",
  };

  it("should fetch profile on mount and display info", async () => {
    const store = useUsersStore();
    const fetchSpy = vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });

    const wrapper = mount(ProfilePage);
    expect(fetchSpy).toHaveBeenCalled();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Toman Sihombing");
    expect(wrapper.text()).toContain("toman@delcom.org");
  });

  it("should render loading when isProfile is true", () => {
    const store = useUsersStore();
    store.isProfile = true;

    const wrapper = mount(ProfilePage);
    expect(wrapper.find("[data-testid='profile-loading']").exists()).toBe(true);
  });

  it("should handle update profile submission", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const updateSpy = vi.spyOn(store, "updateProfile").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.find("input#name").setValue("New Name");
    await wrapper.find("form").trigger("submit.prevent");
    expect(updateSpy).toHaveBeenCalledWith({ name: "New Name" });
  });

  it("should validate empty name on profile update", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.find("input#name").setValue("");
    await wrapper.findAll("form")[0].trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Nama tidak boleh kosong!");
  });

  it("should handle photo update submission", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const updatePhotoSpy = vi.spyOn(store, "updatePhoto").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const fileInput = wrapper.find("input#photo");

    // Empty files trigger
    Object.defineProperty(fileInput.element, "files", {
      value: [],
      configurable: true,
    });
    await fileInput.trigger("change");

    // Valid file trigger
    Object.defineProperty(fileInput.element, "files", {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger("change");

    await wrapper.findAll("form")[1].trigger("submit.prevent");
    expect(updatePhotoSpy).toHaveBeenCalled();
  });

  it("should validate empty photo on photo update", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.findAll("form")[1].trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Pilih file foto terlebih dahulu!");
  });

  it("should handle change password submission", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const changePwdSpy = vi.spyOn(store, "updatePassword").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.find("input#oldPassword").setValue("old123");
    await wrapper.find("input#newPassword").setValue("new123");
    await wrapper.find("input#confirmNewPassword").setValue("new123");
    await wrapper.findAll("form")[2].trigger("submit.prevent");

    expect(changePwdSpy).toHaveBeenCalledWith({
      password: "old123",
      new_password: "new123",
      new_password_confirmation: "new123",
    });
  });

  it("should validate empty fields in change password", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.findAll("form")[2].trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Seluruh kolom kata sandi wajib diisi!");
  });

  it("should validate password mismatch in change password", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.profile = dummyProfile;
      store.isProfile = false;
    });
    const errSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockResolvedValue();

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    await wrapper.find("input#oldPassword").setValue("old123");
    await wrapper.find("input#newPassword").setValue("new123");
    await wrapper.find("input#confirmNewPassword").setValue("different");
    await wrapper.findAll("form")[2].trigger("submit.prevent");
    expect(errSpy).toHaveBeenCalledWith("Konfirmasi kata sandi baru tidak cocok!");
  });

  it("should fallback on image error", async () => {
    const store = useUsersStore();
    store.profile = { id: 1, name: "Test", photo: "broken.png" };
    store.isProfile = false;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.isProfile = false;
    });

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    const img = wrapper.find("img");
    await img.trigger("error");
    expect(img.attributes("src")).toContain("ui-avatars.com");
  });

  it("should show updating loading text when updating state is active", async () => {
    const store = useUsersStore();
    store.profile = dummyProfile;
    store.isProfile = false;
    store.isProfileUpdating = true;
    store.isPhotoUpdating = true;
    store.isPasswordUpdating = true;
    vi.spyOn(store, "fetchProfile").mockImplementation(async () => {
      store.isProfile = false;
    });

    const wrapper = mount(ProfilePage);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Menyimpan...");
    expect(wrapper.text()).toContain("Mengunggah...");
    expect(wrapper.text()).toContain("Memproses...");
  });
});
