import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Cookies from "js-cookie";

function ProtectedRouteLogin( children ) {
  const { Component } = children;
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      // Fetch session data from the server
      const { data } = await axios.get("http://localhost:3000/auth/getsession", {
        withCredentials: true,
      });
      console.log("Session data here:", data);
      if (data.error) {
        Cookies.remove("session");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      // Clear the session cookie in case of an error
      // navigate("/");
    }
  };

  const handleCheckAndRedirect = async () => {
    await checkSession();

    // Redirect to the login page if the session cookie is not set
    if (!Cookies.get("session")) {
      console.log("Redirecting");
      navigate("/"); // Redirect to the login page
    }
    else{
      console.log("heree")
      navigate("/instructor")
    }
  };

  useEffect(() => {
    handleCheckAndRedirect();
  }, []); // Empty dependency array to mimic componentDidMount

  // Render the entire page along with the Component
  return (
    <div>
      {/* Your full page content here */}
      {/* <h1>Welcome to Your App</h1> */}
      {/* Render the Component if the condition is met */}
      {!Cookies.get("session") && <Component />}
    </div>
  );
}

export default ProtectedRouteLogin;
