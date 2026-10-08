import { fetchApi } from "../../../helpers/apiHelper";

export async function getAucationsApi(params) {
  return await fetchApi("/aucations", { params });
}

export async function getAucationDetailApi(id) {
  return await fetchApi(`/aucations/${id}`);
}

export async function addAucationApi(payload) {
  return await fetchApi("/aucations", {
    method: "POST",
    body: payload,
  });
}

export async function updateAucationApi(id, payload) {
  return await fetchApi(`/aucations/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function changeCoverAucationApi(id, formData) {
  return await fetchApi(`/aucations/${id}/cover`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function deleteAucationApi(id) {
  return await fetchApi(`/aucations/${id}`, {
    method: "DELETE",
  });
}

export async function addBidApi(id, payload) {
  return await fetchApi(`/aucations/${id}/bids`, {
    method: "POST",
    body: payload,
  });
}

export async function deleteBidApi(id) {
  return await fetchApi(`/aucations/${id}/bids`, {
    method: "DELETE",
  });
}

export async function deleteAllAucationsApi() {
  return await fetchApi("/aucations", {
    method: "DELETE",
  });
}

