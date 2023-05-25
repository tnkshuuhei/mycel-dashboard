import { createBrowserRouter, Outlet } from "react-router-dom";

import IgntHeader from "../components/IgntHeader";
import PortfolioView from "../views/PortfolioView";
import ResolveView from "../views/ResolveView";
import SendView from "../views/SendView";
import ExploreView from "../views/ExploreView";
import RegisterView from "../views/RegisterView";

const items = [
  {
    label: "Portfolio",
    to: "/",
  },
  {
    label: "Resolve Domain",
    to: "/resolve",
  },
  {
    label: "Send Token",
    to: "/send",
  },
  {
    label: "Explore",
    to: "/explore",
  },
  {
    label: "Register",
    to: "/register",
  },
];
const Layout = () => {
  return (
    <>
      <IgntHeader navItems={items} />
      <Outlet />
    </>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <PortfolioView /> },
      { path: "/resolve", element: <ResolveView /> },
      { path: "/send", element: <SendView /> },
      { path: "/explore", element: <ExploreView /> },
      { path: "/register", element: <RegisterView /> },
    ],
  },
]);

export default router;
