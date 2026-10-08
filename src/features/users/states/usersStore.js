import { defineStore } from "pinia";
import {
  getUsersApi,
  getUserByIdApi,
  getProfileApi,
  updateProfileApi,
  changePhotoProfileApi,
  changePasswordApi,
} from "../api/userApi";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isUsers: false,
    isProfile: false,
    isProfileUpdating: false,
    isPhotoUpdating: false,
    isPasswordUpdating: false,
    error: null,
  }),
  actions: {
    async fetchUsers() {
      this.isUsers = true;
      this.error = null;
      try {
        const response = await getUsersApi();
        this.users = response?.data?.users || [];
        return this.users;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isUsers = false;
      }
    },

    async fetchUserById(id) {
      this.error = null;
      try {
        const response = await getUserByIdApi(id);
        this.user = response?.data?.user || null;
        return this.user;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchProfile() {
      this.isProfile = true;
      this.error = null;
      try {
        const response = await getProfileApi();
        this.profile = response?.data?.user || null;
        return this.profile;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isProfile = false;
      }
    },

    async updateProfile(payload) {
      this.isProfileUpdating = true;
      this.error = null;
      try {
        const response = await updateProfileApi(payload);
        if (this.profile) {
          this.profile = { ...this.profile, ...payload };
        }
        await showSuccessDialog(response?.message || "Profil berhasil diperbarui!");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal memperbarui profil");
        throw err;
      } finally {
        this.isProfileUpdating = false;
      }
    },

    async updatePhoto(formData) {
      this.isPhotoUpdating = true;
      this.error = null;
      try {
        const response = await changePhotoProfileApi(formData);
        await this.fetchProfile();
        await showSuccessDialog(response?.message || "Foto profil berhasil diperbarui!");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal memperbarui foto");
        throw err;
      } finally {
        this.isPhotoUpdating = false;
      }
    },

    async updatePassword(payload) {
      this.isPasswordUpdating = true;
      this.error = null;
      try {
        const response = await changePasswordApi(payload);
        await showSuccessDialog(response?.message || "Kata sandi berhasil diubah!");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal mengubah kata sandi");
        throw err;
      } finally {
        this.isPasswordUpdating = false;
      }
    },
  },
});

