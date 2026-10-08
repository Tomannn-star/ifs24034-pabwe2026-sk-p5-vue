import { defineStore } from "pinia";
import { loginApi, registerApi, logoutApi } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    token: getAccessToken() || null,
    error: null,
  }),
  actions: {
    async login({ email, password }) {
      this.isAuthLogin = true;
      this.error = null;
      try {
        const response = await loginApi({ email, password });
        const token = response?.data?.token || response?.token;
        if (token) {
          this.token = token;
          putAccessToken(token);
        }
        await showSuccessDialog(response?.message || "Login berhasil!");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Login gagal");
        throw err;
      } finally {
        this.isAuthLogin = false;
      }
    },

    async register({ name, email, password }) {
      this.isAuthRegister = true;
      this.error = null;
      try {
        const response = await registerApi({ name, email, password });
        await showSuccessDialog(response?.message || "Registrasi berhasil! Silakan login.");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Registrasi gagal");
        throw err;
      } finally {
        this.isAuthRegister = false;
      }
    },

    async logout() {
      this.isAuthLogout = true;
      this.error = null;
      try {
        await logoutApi();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.token = null;
        putAccessToken(null);
        this.isAuthLogout = false;
        await showSuccessDialog("Berhasil logout!");
      }
    },
  },
});

