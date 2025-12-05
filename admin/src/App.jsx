import React from "react";
import { useEffect } from "react";
import './index.css'
import './common.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DelBoyReg from "./pages/DelBoyReg"
import AddMenu from "./pages/AddMenu";
import Menu from "./pages/Menu";
import TestFile from "./pages/TestFile";
import AdminLogin from "./pages/AdminLogin";
import HomePage from "./pages/HomePage";
import AdminProtectedRoute from "./AdminProtectedRoute";
import { AdminProvider } from "./AdminContext";
import DelPartners from "./pages/DelPartners";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <Home />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/orders",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <Orders />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/menu/add-menu",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <AddMenu />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/menu",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <Menu />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/delivery-partners/register-new",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <DelBoyReg />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/delivery-partners",
      element: (
        <AdminProtectedRoute>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <DelPartners />
          </div>
        </AdminProtectedRoute>
      ),
    },
    {
      path: "/testpage",
      element: (
        <>
          <div className="fixed">
            <Sidebar />
          </div>
          <div className="flex-1 w-10/12 absolute right-0">
            <TestFile />
          </div>
        </>
      ),
    },
    {
      path: "/admin-login",
      element: (
        <div className="mx-0 my-0">
          <AdminLogin />
        </div>
      ),
    },
    {
      path: "/home-page",
      element: (
        <div className="mx-0 my-0">
          <HomePage />
        </div>
      ),
    }
  ]);

  return (
    <div className="App">
      <AdminProvider>
        <RouterProvider router={router} />
      </AdminProvider>
    </div>
  );
}

export default App;
