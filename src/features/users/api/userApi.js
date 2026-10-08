import { fetchApi } from "../../../helpers/apiHelper";

export async function getUsersApi() {
  return await fetchApi("/users");
}

export async function getUserByIdApi(id) {
  return await fetchApi(`/users/${id}`);
}

export async function getProfileApi() {
  return await fetchApi("/users/me");
}

export async function updateProfileApi(payload) {
  return await fetchApi("/users/me", {
    method: "PUT",
    body: payload,
  });
}

export async function changePhotoProfileApi(formData) {
  return await fetchApi("/users/me/photo", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function changePasswordApi(payload) {
  try {
    return await fetchApi("/users/password", {
      method: "PUT",
      body: payload,
    });
  } catch (error) {
    if (error.status === 404) {
      return await fetchApi("/users/me/password", {
        method: "PUT",
        body: payload,
      });
    }
    throw error;
  }
}

