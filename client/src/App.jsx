import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useUser } from './UserContext';
import './index.css';

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SignupForm from "./components/customer/SignupForm";
import LoginForm from "./components/customer/LoginForm";
import Home from "./components/Home";
import Orders from "./components/customer/Orders";
import CustomerProtectedRoute from './components/customer/CustomerProtectedRoute';
import OrderNow from './components/customer/OrderNow';
import FoodTray from './components/customer/FoodTray';
import ResRegistrationForm from './components/restaurant/ResRegistrationForm';
import AddMenu from './components/restaurant/AddMenu';

import UpdateMenu from './components/restaurant/updateMenu';

import Test from './components/Test';


function App() {
  const { setUserName, setUserId, setUserType, userId, userName, userType, serverResponseForCustomer, setServerResponseForCustomer, emailId, setEmailId, userPhone, setUserPhone, itemCount, setItemCount } = useUser();

  const checkLoginStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/iscustomer", {
        method: "GET",
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user_id", JSON.stringify(data._id));
        setUserName(data.fname + ' ' + data.lname);
        setUserId(data._id);
        setUserType("customer");
        setEmailId(data.email);
        setUserPhone(data.phone);
      } else {
        localStorage.removeItem("user_id");
        setUserName(null);
        setUserId(null);
        setUserType(null);
        setEmailId(null);
        setUserPhone(null);

        setServerResponseForCustomer(response.status);
      }
    } catch (error) {
      localStorage.removeItem("user_id");
      setUserName(null);
      setUserId(null);
      setUserType(null);
      setEmailId(null);
      setUserPhone(null);

      setServerResponseForCustomer(401);
    }
  };

  const fetchCart = async () => {
    const response = await fetch('http://localhost:5000/customer/cart-items', {
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    let count = 0;
    data.menu.forEach((category) => {
      count = count + category.item.length;
    })

    setItemCount(count);
  }

  useEffect(() => {
    checkLoginStatus();
    fetchCart();
  }, []);


  const router = createBrowserRouter([
    {
      path: "/",
      element: <><Navbar /> <Home /> <Footer /></>
    },
    {
      path: "/test",
      element: <><Navbar /> <Test /> <Footer /></>
    },
    {
      path: "/new-user/signup",
      element: <><Navbar /> <SignupForm /> <Footer /></>
    },
    {
      path: "/customer/login",
      element: <><Navbar /> <LoginForm /> <Footer /></>
    },
    {
      path: "/restaurant/register",
      element: <><Navbar /> <ResRegistrationForm /> <Footer /></>
    },
    {
      path: "/restaurant/manage-menu",
      element: <><Navbar /> <UpdateMenu /> <Footer /></>
    }, ,
    {
      path: "/customer/ordernow",
      element: <><Navbar /> <OrderNow /> <Footer /></>
    },
    {
      path: "/customer/orders",
      element: (
        <CustomerProtectedRoute>
          <Navbar />
          <Orders />
          <Footer />
        </CustomerProtectedRoute>
      )
    },
    {
      path: "/customer/tray",
      element: (
        <>
          <CustomerProtectedRoute>
            <Navbar />
            <FoodTray />
            <Footer />
          </CustomerProtectedRoute>
        </>
      )
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
