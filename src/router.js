import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import { getAccessToken } from "./helpers/apiHelper";

const LoginPage = () => import("./features/auth/pages/LoginPage.vue");
const RegisterPage = () => import("./features/auth/pages/RegisterPage.vue");
const HomePage = () => import("./features/aucations/pages/HomePage.vue");
const DetailPage = () => import("./features/aucations/pages/DetailPage.vue");
const UsersPage = () => import("./features/users/pages/UsersPage.vue");
const ProfilePage = () => import("./features/users/pages/ProfilePage.vue");
const NotFoundPage = () => import("./features/common/pages/NotFoundPage.vue");

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
