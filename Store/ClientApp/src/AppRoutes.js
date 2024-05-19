import CartPage from "./components/user/CartPage";
import UserProfilePage from "./components/user/UserProfilePage";
import { Home } from "./components/Home";
import { RegisterPage } from "./components/authentication/RegisterPage";
import { LoginPage } from "./components/authentication/LoginPage";
import AdminPage from "./components/administrator/AdminPage";
import ManagerPage from "./components/manager/ManagerPage";
import ProductPage from "./components/ProductPage";
import CartItem from "./components/user/CartItem";
import OrderButton from "./components/user/OrderButton";

const AppRoutes = [
  {
    path: '/user/CartItem',
    element: <CartItem />
  },
  {
    path: '/user/OrderButton',
    element: <OrderButton />
  },

  {
    index: true,
    element: <Home />
  },
  {
    path: '/authentication/RegisterPage',
    element: <RegisterPage />
  },
  {
    path: '/authentication/LoginPage',
    element: <LoginPage />
  },
  {
      path: '/administrator/AdminPage',
      element: <AdminPage />
  },
  {
      path: '/administrator/ManagerPage',
      element: <ManagerPage />
  },
  {
    path: '/user/UserProfilePage',
    element: <UserProfilePage />
  },
  {
  path: '/user/CartPage',
  element: <CartPage />
  },
  {
  path: '/components/ProductPage',
  element: <ProductPage />
  },
];

export default AppRoutes;
