import { createBrowserRouter, redirect } from "react-router-dom";
import React from "react";
import App from "../App";

// 使用React.lazy实现路由懒加载
const About = React.lazy(() => import("../pages/About"));
const Login = React.lazy(() => import("../pages/Login/Login"));
const Register = React.lazy(() => import("../pages/Register/Register"));
// 需求管理相关路由
const Demand = React.lazy(() => import("../pages/Demand/Demand"));
const DemandDetail = React.lazy(() => import("../pages/Demand/DemandDetail"));
const DemandForm = React.lazy(() => import("../pages/Demand/DemandForm"));
// 我需要模块相关路由
const INeed = React.lazy(() => import("../pages/INeed/INeed"));
const INeedDetail = React.lazy(() => import("../pages/INeed/INeedDetail"));
const INeedForm = React.lazy(() => import("../pages/INeed/INeedForm"));
// 我服务模块相关路由
const IServe = React.lazy(() => import("../pages/IServe/IServe"));
const IServeResponseForm = React.lazy(() =>
  import("../pages/IServe/IServeResponseForm")
);
// 统计分析模块相关路由
const Analytics = React.lazy(() => import("../pages/Analytics/Analytics"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        loader: () => redirect("/demand"),
      },
      {
        path: "about",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <About />
          </React.Suspense>
        ),
      },
      // 需求管理相关路由
      {
        path: "demand",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Demand />
          </React.Suspense>
        ),
      },
      {
        path: "demand/:id",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DemandDetail />
          </React.Suspense>
        ),
      },
      {
        path: "demand/create",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DemandForm />
          </React.Suspense>
        ),
      },
      {
        path: "demand/edit/:id",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DemandForm />
          </React.Suspense>
        ),
      },
      // 我需要模块相关路由
      {
        path: "i-need",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <INeed />
          </React.Suspense>
        ),
      },
      {
        path: "i-need/:id",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <INeedDetail />
          </React.Suspense>
        ),
      },
      {
        path: "i-need/create",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <INeedForm />
          </React.Suspense>
        ),
      },
      {
        path: "i-need/edit/:id",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <INeedForm />
          </React.Suspense>
        ),
      },
      // 我服务模块相关路由
      {
        path: "i-serve",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <IServe />
          </React.Suspense>
        ),
      },
      {
        path: "i-serve/response/:demandId",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <IServeResponseForm />
          </React.Suspense>
        ),
      },
      // 统计分析模块相关路由
      {
        path: "analytics",
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Analytics />
          </React.Suspense>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Login />
      </React.Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Register />
      </React.Suspense>
    ),
  },
]);