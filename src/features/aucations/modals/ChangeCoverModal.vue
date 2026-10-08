<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900">Ganti Foto Cover</h2>
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

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label for="cover_file" class="block text-sm font-medium text-slate-700 mb-1">Pilih Gambar Cover</label>
          <input
            id="cover_file"
            type="file"
            accept="image/*"
            required
            @change="handleFileChange"
            class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div v-if="previewUrl" class="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-48">
          <img :src="previewUrl" alt="Preview" class="max-h-full max-w-full object-contain" />
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
            :disabled="aucationsStore.isAucationChangeCover || !file"
            class="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
          >
            <span v-if="aucationsStore.isAucationChangeCover">Mengunggah...</span>
            <span v-else>Unggah Cover</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucationId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["close", "success"]);
const aucationsStore = useAucationsStore();

const file = ref(null);
const previewUrl = ref("");

function handleFileChange(e) {
  const selected = e.target.files?.[0];
  if (selected) {
    file.value = selected;
    previewUrl.value = URL.createObjectURL(selected);
  }
}

async function handleSubmit() {
  if (!file.value) {
    await showErrorDialog("Pilih file gambar cover terlebih dahulu!");
    return;
  }

  const formData = new FormData();
  formData.append("cover", file.value);

  try {
    await aucationsStore.changeAucationCover(props.aucationId, formData);
    emit("success");
    emit("close");
  } catch (err) {
    // handled in store
  }
}
</script>

