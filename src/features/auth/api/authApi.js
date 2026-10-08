import { fetchApi } from "../../../helpers/apiHelper";

export async function loginApi({ email, password }) {
  return await fetchApi("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function registerApi({ name, email, password }) {
  return await fetchApi("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

export async function logoutApi() {
  return await fetchApi("/auth/logout", {
    method: "POST",
  });
}

