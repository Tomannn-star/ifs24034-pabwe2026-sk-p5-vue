<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
      <div class="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 class="text-xl font-bold text-slate-900">Ajukan Tawaran (Bid)</h2>
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
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Harga Awal:</span>
            <span class="font-semibold text-slate-800">{{ formatRupiah(aucation?.start_bid) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Tawaran Tertinggi:</span>
            <span class="font-bold text-blue-600">{{ formatRupiah(currentHighestBid) }}</span>
          </div>
        </div>

        <div>
          <label for="bid_amount" class="block text-sm font-medium text-slate-700 mb-1">
            Nominal Tawaran Anda (Minimal: {{ formatRupiah(minRequiredBid) }})
          </label>
          <input
            id="bid_amount"
            v-model.number="bidAmount"
            type="number"
            :min="minRequiredBid"
            required
            placeholder="Masukkan nominal tawaran"
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-lg"
          />
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
            :disabled="aucationsStore.isBidAdd"
            class="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
          >
            <span v-if="aucationsStore.isBidAdd">Mengirim...</span>
            <span v-else>Kirim Tawaran</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "success"]);
const aucationsStore = useAucationsStore();

const bidAmount = ref(null);

const currentHighestBid = computed(() => {
  if (props.aucation?.bids && props.aucation.bids.length > 0) {
    return Math.max(...props.aucation.bids.map((b) => Number(b.bid || 0)));
  }
  return Number(props.aucation?.start_bid || 0);
});

const minRequiredBid = computed(() => currentHighestBid.value + 1000);

async function handleSubmit() {
  if (!bidAmount.value || Number(bidAmount.value) < minRequiredBid.value) {
    await showErrorDialog(
      `Nominal tawaran harus minimal ${formatRupiah(minRequiredBid.value)}!`
    );
    return;
  }

  try {
    await aucationsStore.addBid(props.aucation.id, {
      bid: Number(bidAmount.value),
    });
    emit("success");
    emit("close");
  } catch (err) {
    // handled in store
  }
}
</script>

