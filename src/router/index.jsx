import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

const Home = lazy(() => import("@/components/pages/Home"));
const Popular = lazy(() => import("@/components/pages/Popular"));
const Communities = lazy(() => import("@/components/pages/Communities"));
const Saved = lazy(() => import("@/components/pages/Saved"));
const SearchResults = lazy(() => import("@/components/pages/SearchResults"));
const CommunityDetail = lazy(() => import("@/components/pages/CommunityDetail"));
const PostDetail = lazy(() => import("@/components/pages/PostDetail"));
const Profile = lazy(() => import("@/components/pages/Profile"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "popular",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Popular />
      </Suspense>
    ),
  },
  {
    path: "communities",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Communities />
      </Suspense>
    ),
  },
  {
path: "search",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <SearchResults />
      </Suspense>
    )
  },
  {
    path: "community/:communityName",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <CommunityDetail />
      </Suspense>
    ),
  },
  {
path: "post/:id",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <PostDetail />
      </Suspense>
    )
  },
  {
path: "saved",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
<Saved />
      </Suspense>
    )
  },
  {
    path: "user/:username",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Profile />
      </Suspense>
    )
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