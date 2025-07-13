import { CircularProgress, Flex } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [token]);

  return (
    <Flex justifyContent="center" alignItems="center">
      <CircularProgress
        isIndeterminate
        size="60px"
        thickness="4px"
        color="brand.primary"
      />
    </Flex>
  );
};

export default AuthSuccess;
