async function getSwal() {
  const module = await import("sweetalert2");
  return module.default;
}

export async function showSuccessDialog(message, title = "Berhasil!") {
  const Swal = await getSwal();
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#2563eb",
    timer: 2500,
    timerProgressBar: true,
  });
}

export async function showErrorDialog(message, title = "Terjadi Kesalahan") {
  const Swal = await getSwal();
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#ef4444",
  });
}

export async function showConfirmDialog(
  message,
  title = "Apakah Anda Yakin?",
  confirmButtonText = "Ya, Lanjutkan",
  cancelButtonText = "Batal"
) {
  const Swal = await getSwal();
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export function formatDate(dateString, customOptions) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);

    const defaultOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Intl.DateTimeFormat("id-ID", customOptions || defaultOptions).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatRupiah(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

