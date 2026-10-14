<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <div class="flex items-center gap-2">
      <RouterLink to="/" class="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
        &larr; Kembali ke Dashboard
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="aucationsStore.isAucation && !aucation" class="flex justify-center py-16" data-testid="detail-loading">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- Content -->
    <div v-else-if="aucation" class="space-y-8">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="h-72 md:h-96 bg-slate-100 relative overflow-hidden flex items-center justify-center">
          <img
            :src="aucation.cover || '/default-auction.png'"
            :alt="aucation.title"
            class="w-full h-full object-cover"
            @error="handleImgError"
          />
          <div class="absolute top-4 right-4">
            <span
              :class="[
                'px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm',
                isClosed
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              ]"
            >
              {{ isClosed ? 'Ditutup' : 'Berlangsung' }}
            </span>
          </div>
        </div>

        <div class="p-6 md:p-8">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">{{ aucation.title }}</h1>
              <div class="flex items-center gap-3 text-sm text-slate-500">
                <span>Dibuat oleh: <strong class="text-slate-700">{{ aucation.author?.name || 'Anonim' }}</strong></span>
                <span>&bull;</span>
                <span>Batas Waktu: <strong class="text-slate-700">{{ formatDate(aucation.closed_at) }}</strong></span>
              </div>
            </div>

            <!-- Action buttons for Owner / Participant -->
            <div class="flex flex-wrap gap-2">
              <template v-if="isOwner">
                <button
                  type="button"
                  @click="showEditModal = true"
                  class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  @click="showCoverModal = true"
                  class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
                >
                  Ganti Cover
                </button>
                <button
                  type="button"
                  @click="handleDelete"
                  class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 font-semibold rounded-lg text-sm transition"
                >
                  Hapus
                </button>
              </template>

              <template v-else-if="!isClosed">
                <button
                  type="button"
                  @click="showBidModal = true"
                  class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
                >
                  Ajukan Tawaran
                </button>
                <button
                  v-if="aucation.my_bid"
                  type="button"
                  @click="handleCancelBid"
                  class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg text-sm transition"
                >
                  Batalkan Tawaran Saya
                </button>
              </template>
            </div>
          </div>

          <!-- Price & Bids Overview -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span class="text-xs text-slate-500 font-medium block mb-1">Harga Awal</span>
              <span class="text-xl font-bold text-slate-800">{{ formatRupiah(aucation.start_bid) }}</span>
            </div>
            <div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100">
              <span class="text-xs text-blue-600 font-medium block mb-1">Tawaran Tertinggi Saat Ini</span>
              <span class="text-xl font-extrabold text-blue-700">{{ formatRupiah(highestBid) }}</span>
            </div>
          </div>

          <!-- Description -->
          <div class="pt-2">
            <h2 class="text-lg font-bold text-slate-900 mb-3">Deskripsi Barang</h2>
            <div class="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <MarkdownViewer :content="aucation.description || '-'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bid History -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Riwayat Tawaran ({{ aucation.bids?.length || 0 }})</h2>

        <div v-if="!aucation.bids || aucation.bids.length === 0" class="text-slate-500 text-sm py-4">
          Belum ada penawaran untuk lelang ini. Jadilah penawar pertama!
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="bid in sortedBids"
            :key="bid.id"
            class="py-3 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                #
              </div>
              <div>
                <span class="font-bold text-slate-800">{{ formatRupiah(bid.bid) }}</span>
                <span v-if="aucation.my_bid?.id === bid.id" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Tawaran Anda
                </span>
              </div>
            </div>
            <div class="text-xs text-slate-600">
              {{ formatDate(bid.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ChangeModal
      v-if="showEditModal && aucation"
      :aucation="aucation"
      @close="showEditModal = false"
      @success="loadDetail"
    />

    <ChangeCoverModal
      v-if="showCoverModal && aucation"
      :aucation-id="aucation.id"
      @close="showCoverModal = false"
      @success="loadDetail"
    />

    <BidModal
      v-if="showBidModal && aucation"
      :aucation="aucation"
      @close="showBidModal = false"
      @success="loadDetail"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import BidModal from "../modals/BidModal.vue";
import { formatRupiah, formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const showEditModal = ref(false);
const showCoverModal = ref(false);
const showBidModal = ref(false);

const aucation = computed(() => aucationsStore.aucation);

const isOwner = computed(() => {
  if (!aucation.value || !usersStore.profile) return false;
  return Number(aucation.value.user_id) === Number(usersStore.profile.id);
});

const isClosed = computed(() => {
  if (!aucation.value?.closed_at) return false;
  return new Date(aucation.value.closed_at).getTime() < Date.now();
});

const highestBid = computed(() => {
  if (aucation.value?.bids && aucation.value.bids.length > 0) {
    return Math.max(...aucation.value.bids.map((b) => Number(b.bid || 0)));
  }
  return Number(aucation.value?.start_bid || 0);
});

const sortedBids = computed(() => {
  if (!aucation.value?.bids) return [];
  return [...aucation.value.bids].sort((a, b) => Number(b.bid || 0) - Number(a.bid || 0));
});

function handleImgError(e) {
  e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
}

async function loadDetail() {
  const id = route.params.aucationId;
  if (id) {
    await aucationsStore.fetchAucationDetail(id);
  }
}

async function handleDelete() {
  const confirmed = await showConfirmDialog("Apakah Anda yakin ingin menghapus lelang ini?", "Hapus Lelang");
  if (confirmed && aucation.value) {
    await aucationsStore.deleteAucation(aucation.value.id);
    router.push("/");
  }
}

async function handleCancelBid() {
  const confirmed = await showConfirmDialog("Batalkan tawaran Anda pada lelang ini?", "Batal Tawaran");
  if (confirmed && aucation.value) {
    await aucationsStore.deleteBid(aucation.value.id);
  }
}

onMounted(async () => {
  if (!usersStore.profile) {
    await usersStore.fetchProfile().catch(() => {});
  }
  await loadDetail();
});
</script>

