import { defineStore } from "pinia";
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
} from "../api/aucationApi";
import { showSuccessDialog, showErrorDialog } from "../../../helpers/toolsHelper";

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,
    isAucationAdd: false,
    isAucationAdded: false,
    isAucationChange: false,
    isAucationChanged: false,
    isAucationChangeCover: false,
    isAucationChangedCover: false,
    isAucationDelete: false,
    isAucationDeleted: false,
    isBidAdd: false,
    isBidAdded: false,
    isBidDelete: false,
    isBidDeleted: false,
    isAucationDeleteAll: false,
    isAucationDeletedAll: false,
    error: null,
  }),
  actions: {
    async fetchAucations(params = {}) {
      this.isAucation = true;
      this.error = null;
      try {
        const response = await getAucationsApi(params);
        this.aucations = response?.data?.aucations || [];
        return this.aucations;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isAucation = false;
      }
    },

    async fetchAucationDetail(id) {
      this.isAucation = true;
      this.error = null;
      try {
        const response = await getAucationDetailApi(id);
        this.aucation = response?.data?.aucation || null;
        return this.aucation;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.isAucation = false;
      }
    },

    async addAucation(payload) {
      this.isAucationAdd = true;
      this.isAucationAdded = false;
      this.error = null;
      try {
        const response = await addAucationApi(payload);
        this.isAucationAdded = true;
        await showSuccessDialog(response?.message || "Lelang berhasil dibuat!");
        await this.fetchAucations();
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal membuat lelang");
        throw err;
      } finally {
        this.isAucationAdd = false;
      }
    },

    async changeAucation(id, payload) {
      this.isAucationChange = true;
      this.isAucationChanged = false;
      this.error = null;
      try {
        const response = await updateAucationApi(id, payload);
        this.isAucationChanged = true;
        await showSuccessDialog(response?.message || "Lelang berhasil diperbarui!");
        await this.fetchAucationDetail(id);
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal memperbarui lelang");
        throw err;
      } finally {
        this.isAucationChange = false;
      }
    },

    async changeAucationCover(id, formData) {
      this.isAucationChangeCover = true;
      this.isAucationChangedCover = false;
      this.error = null;
      try {
        const response = await changeCoverAucationApi(id, formData);
        this.isAucationChangedCover = true;
        await showSuccessDialog(response?.message || "Foto cover berhasil diperbarui!");
        await this.fetchAucationDetail(id);
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal memperbarui cover");
        throw err;
      } finally {
        this.isAucationChangeCover = false;
      }
    },

    async deleteAucation(id) {
      this.isAucationDelete = true;
      this.isAucationDeleted = false;
      this.error = null;
      try {
        const response = await deleteAucationApi(id);
        this.isAucationDeleted = true;
        this.aucation = null;
        await showSuccessDialog(response?.message || "Lelang berhasil dihapus!");
        await this.fetchAucations();
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal menghapus lelang");
        throw err;
      } finally {
        this.isAucationDelete = false;
      }
    },

    async addBid(id, payload) {
      this.isBidAdd = true;
      this.isBidAdded = false;
      this.error = null;
      try {
        const response = await addBidApi(id, payload);
        this.isBidAdded = true;
        await showSuccessDialog(response?.message || "Tawaran berhasil diajukan!");
        await this.fetchAucationDetail(id);
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal mengajukan tawaran");
        throw err;
      } finally {
        this.isBidAdd = false;
      }
    },

    async deleteBid(id) {
      this.isBidDelete = true;
      this.isBidDeleted = false;
      this.error = null;
      try {
        const response = await deleteBidApi(id);
        this.isBidDeleted = true;
        await showSuccessDialog(response?.message || "Tawaran berhasil dibatalkan!");
        await this.fetchAucationDetail(id);
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal membatalkan tawaran");
        throw err;
      } finally {
        this.isBidDelete = false;
      }
    },

    async deleteAllAucations() {
      this.isAucationDeleteAll = true;
      this.isAucationDeletedAll = false;
      this.error = null;
      try {
        const response = await deleteAllAucationsApi();
        this.isAucationDeletedAll = true;
        this.aucations = [];
        await showSuccessDialog(response?.message || "Semua data lelang berhasil dihapus!");
        return response;
      } catch (err) {
        this.error = err.message;
        await showErrorDialog(err.message || "Gagal menghapus semua lelang");
        throw err;
      } finally {
        this.isAucationDeleteAll = false;
      }
    },
  },
});

