import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { VERIFY_EMAIL_ENDPOINT } from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
import happy from "../../assets/happy.jpg";
import sad from "../../assets/sad.jpg";
import pending from "../../assets/pending.jpg";
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const EmailVerification = () => {
  // fetch token from url
  const [searchParams, setSearchParams] = useSearchParams();
  const [alertData, setAlertData] = useState({
    status: "info",
    title: "Verification Pending",
    description: "Please wait while we verify your email.",
    image: pending,
  });
  const navigate = useNavigate();
  // verify token with backend
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        console.info("Email verification token:", token);
        const response = await ApiRequestUtils.put(VERIFY_EMAIL_ENDPOINT, {
          token,
        });
        console.info("Email verification response:", response);
        localStorage.setItem("authToken", response.data.token);
        setAlertData({
          status: "success",
          title: "Email Verified Successfully",
          description: "You'll be redirected to dashboard shortly.",
          image: happy,
        });
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000); // Redirect after 2 seconds
      } catch (error) {
        console.error("Error verifying email:", error);
        setAlertData({
          status: "error",
          title: "Email Verification Failed",
          description: "The verification link is invalid or expired.",
          image: sad,
        });
      }
    };
    verifyEmail();
  }, []);
  return (
    <MotionBox
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      height="100%"
      width="100%"
      // alignItems="center"
      // justifyContent="flex-end"
      bgImage={alertData.image}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPosition="center"
      overflow={"hidden"}
    >
      <Alert status={alertData.status} color={"black"}>
        <AlertIcon />
        <AlertTitle>{alertData.title}</AlertTitle>
        <AlertDescription>{alertData.description}</AlertDescription>
      </Alert>
    </MotionBox>
  );
};

export default EmailVerification;
