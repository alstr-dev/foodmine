import React from "react";
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DeliveryLogin from "./pages/DeliveryLogin"
import DpHome from "./pages/DpHome";
import DpProtectedRoute from "./DpProtectedRoute";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <DpProtectedRoute>
          <div className="">
            <DpHome />
          </div>
        </DpProtectedRoute>
      ),
    },
    {
      path: "/login",
      element: (
        <>
          <div>
            <DeliveryLogin />
          </div>
        </>
      ),
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;