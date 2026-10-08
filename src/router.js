import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";
import { getAccessToken } from "./helpers/apiHelper";

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AucationLayout,
    children: [
      { path: "", component: HomePage },
      { path: "aucations/:aucationId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = getAccessToken();
  const isAuthRoute = to.path.startsWith("/auth");

  if (!token && !isAuthRoute && to.path !== "/404") {
    return "/auth/login";
  }
  if (token && isAuthRoute) {
    return "/";
  }
});

export default router;
