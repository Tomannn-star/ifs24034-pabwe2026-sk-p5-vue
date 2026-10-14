<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Dashboard Lelang</h1>
        <p class="text-slate-600 text-sm">Jelajahi dan tawar berbagai barang lelang yang tersedia.</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="showAddModal = true"
          class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition shadow-sm text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Lelang
        </button>

        <button
          type="button"
          @click="handleDeleteAll"
          class="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-medium px-4 py-2.5 rounded-lg transition text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus Semua
        </button>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="flex flex-wrap gap-2 w-full md:w-auto">
        <button
          type="button"
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-sm font-medium transition',
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          {{ tab.name }}
        </button>
      </div>

      <div class="w-full md:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari lelang..."
          class="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="aucationsStore.isAucation" class="flex justify-center py-16" data-testid="loading">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAucations.length === 0" class="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-200">
      <p class="text-slate-500 font-medium">Tidak ada lelang yang ditemukan.</p>
    </div>

    <!-- Auction Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredAucations"
        :key="item.id"
        class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition"
      >
        <div class="h-48 bg-slate-100 relative overflow-hidden">
          <img
            :src="item.cover || '/default-auction.png'"
            :alt="item.title"
            class="w-full h-full object-cover"
            @error="handleImgError"
          />
          <div class="absolute top-3 right-3">
            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                isClosed(item)
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              ]"
            >
              {{ isClosed(item) ? 'Ditutup' : 'Berlangsung' }}
            </span>
          </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{{ item.title }}</h2>
            <p class="text-xs text-slate-500 mb-4">
              Batas Waktu: {{ formatDate(item.closed_at) }}
            </p>

            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg mb-4 text-xs">
              <div>
                <span class="text-slate-500 block">Harga Awal</span>
                <span class="font-semibold text-slate-800">{{ formatRupiah(item.start_bid) }}</span>
              </div>
              <div>
                <span class="text-slate-500 block">Tawaran Tertinggi</span>
                <span class="font-bold text-blue-600">{{ formatRupiah(getHighestBid(item)) }}</span>
              </div>
            </div>
          </div>

          <RouterLink
            :to="`/aucations/${item.id}`"
            class="block w-full text-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 rounded-lg transition text-sm"
          >
            Lihat Detail & Tawaran
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <AddModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @success="fetchData"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import AddModal from "../modals/AddModal.vue";
import { formatRupiah, formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";

const aucationsStore = useAucationsStore();
const activeTab = ref("all");
const searchQuery = ref("");
const showAddModal = ref(false);

const tabs = [
  { id: "all", name: "Semua Lelang" },
  { id: "my", name: "Lelang Saya" },
  { id: "open", name: "Sedang Berlangsung" },
  { id: "closed", name: "Ditutup" },
];

function isClosed(item) {
  if (!item?.closed_at) return false;
  return new Date(item.closed_at).getTime() < Date.now();
}

function getHighestBid(item) {
  if (item?.bids && item.bids.length > 0) {
    return Math.max(...item.bids.map((b) => Number(b.bid || 0)));
  }
  return Number(item?.start_bid || 0);
}

function handleImgError(e) {
  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
}

const filteredAucations = computed(() => {
  return aucationsStore.aucations.filter((item) => {
    const q = searchQuery.value.toLowerCase();
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);
    return matchSearch;
  });
});

async function fetchData() {
  const params = {};
  if (activeTab.value === "my") {
    params.is_me = 1;
  } else if (activeTab.value === "open") {
    params.is_closed = 1;
  } else if (activeTab.value === "closed") {
    params.is_closed = 0;
  }
  await aucationsStore.fetchAucations(params);
}

async function handleDeleteAll() {
  const confirmed = await showConfirmDialog(
    "Apakah Anda yakin ingin menghapus semua lelang?",
    "Hapus Semua Lelang",
    "Ya, Hapus Semua"
  );
  if (confirmed) {
    await aucationsStore.deleteAllAucations();
  }
}

watch(activeTab, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

