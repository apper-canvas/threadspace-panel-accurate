import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

const Home = lazy(() => import("@/components/pages/Home"));
const Popular = lazy(() => import("@/components/pages/Popular"));
const Communities = lazy(() => import("@/components/pages/Communities"));
const UserProfile = lazy(() => import("@/components/pages/UserProfile"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Home />
      </Suspense>
    )
  },
  {
    path: "popular",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Popular />
      </Suspense>
    )
  },
{
    path: "communities",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Communities />
      </Suspense>
    )
  },
    {
      path: "user/:username",
      element: (
        <Suspense fallback={<div>Loading.....</div>}>
          <UserProfile />
        </Suspense>
      ),
    },
{
    path: "*",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);