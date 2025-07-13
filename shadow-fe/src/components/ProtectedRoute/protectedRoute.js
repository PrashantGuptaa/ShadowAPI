// ProtectedRoute.jsx
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { VALIDATE_AND_ISSUE_TOKEN_ENDPOINT } from "../../utils/apiEndpoints";
import apiRequestUtils from "../../utils/apiRequestUtils";
import { clearLocalStorage } from "../../utils/commonUtils";

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
        const name = response?.data?.data?.name;
        const picture = response?.data?.data?.picture;
        if (token) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("name", name);
          localStorage.setItem("picture", picture);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        clearLocalStorage();
        setIsLoggedIn(false);
        navigate("/login");
      }
    };
    validateToken();
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
