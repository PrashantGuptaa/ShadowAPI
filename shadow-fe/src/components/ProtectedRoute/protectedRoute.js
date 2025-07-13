// ProtectedRoute.jsx
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { VALIDATE_AND_ISSUE_TOKEN_ENDPOINT } from "../../utils/apiEndpoints";
import apiRequestUtils from "../../utils/apiRequestUtils";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  // const isLoggedIn = localStorage.getItem("authToken"); // or from context/state
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      setIsLoggedIn(false);
      navigate("/login");
    }
    // validating the token
    const validateToken = async () => {
      try {
        const response = await apiRequestUtils.get(
          VALIDATE_AND_ISSUE_TOKEN_ENDPOINT
        );
        const token = response?.data?.data?.token;
        if (token) {
          localStorage.setItem("authToken", token);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsLoggedIn(false);
        navigate("/login");
      }
    };
    validateToken();
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
