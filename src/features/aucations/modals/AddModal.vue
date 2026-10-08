<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900">Tambah Barang Lelang</h2>
        <button
          type="button"
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4 overflow-y-auto flex-1">
        <div>
          <label for="title" class="block text-sm font-medium text-slate-700 mb-1">Judul Lelang</label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            placeholder="Contoh: MacBook Pro M2 16 Inch"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="start_bid" class="block text-sm font-medium text-slate-700 mb-1">Harga Awal (Start Bid)</label>
          <input
            id="start_bid"
            v-model.number="start_bid"
            type="number"
            min="1000"
            required
            placeholder="Contoh: 1500000"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="closed_at" class="block text-sm font-medium text-slate-700 mb-1">Batas Waktu Penutupan</label>
          <input
            id="closed_at"
            v-model="closed_at"
            type="datetime-local"
            required
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Deskripsi Barang</label>
          <MarkdownEditor v-model="description" />
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="aucationsStore.isAucationAdd"
            class="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
          >
            <span v-if="aucationsStore.isAucationAdd">Menyimpan...</span>
            <span v-else>Simpan Lelang</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAucationsStore } from "../states/aucationsStore";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits(["close", "success"]);
const aucationsStore = useAucationsStore();

const title = ref("");
const start_bid = ref(null);
const closed_at = ref("");
const description = ref("");

async function handleSubmit() {
  if (!title.value || !start_bid.value || !closed_at.value || !description.value) {
    await showErrorDialog("Semua kolom wajib diisi!");
    return;
  }

  // Format closed_at from YYYY-MM-DDTHH:mm to YYYY-MM-DD HH:mm:ss
  const formattedDate = closed_at.value.replace("T", " ") + (closed_at.value.length === 16 ? ":00" : "");

  try {
    await aucationsStore.addAucation({
      title: title.value,
      description: description.value,
      start_bid: Number(start_bid.value),
      closed_at: formattedDate,
    });
    emit("success");
    emit("close");
  } catch (err) {
    // handled in store
  }
}
</script>

