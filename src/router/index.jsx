import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Root from "@/layouts/Root";
import { getRouteConfig } from "@/router/route.utils";
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
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      createRoute({
        path: "login",
        element: <Login />
      }),
      createRoute({
        path: "signup",
        element: <Signup />
      }),
      createRoute({
        path: "callback",
        element: <Callback />
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />
      }),
      {
        path: "/",
        element: <Layout />,
        children: [
          createRoute({
            index: true,
            element: <Home />
          }),
          createRoute({
            path: "popular",
            element: <Popular />
          }),
          createRoute({
            path: "communities",
            element: <Communities />
          }),
          createRoute({
            path: "search",
            element: <SearchResults />
          }),
          createRoute({
            path: "community/:communityName",
            element: <CommunityDetail />
          }),
          createRoute({
            path: "post/:id",
            element: <PostDetail />
          }),
          createRoute({
            path: "saved",
            element: <Saved />
          }),
          createRoute({
            path: "user/:username",
            element: <Profile />
          }),
          createRoute({
            path: "*",
            element: <NotFound />
          })
        ]
      }
    ]
  }
];

export const router = createBrowserRouter(routes);