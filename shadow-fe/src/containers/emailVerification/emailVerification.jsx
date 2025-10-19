import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { VERIFY_EMAIL_ENDPOINT } from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
import { getOptimizedImageSrc, preloadImages } from "../../utils/imageUtils";
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
  const [searchParams] = useSearchParams();

  const [alertData, setAlertData] = useState({
    status: "info",
    title: "Verification Pending",
    description: "Please wait while we verify your email.",
    image: pending, // Use optimized image
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
        localStorage.setItem("authToken", response?.data?.data);
        setAlertData({
          status: "success",
          title: "Email Verified Successfully",
          description: "You'll be redirected to dashboard shortly.",
          image: happy, // Use optimized image
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
          image: sad, // Use optimized image
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
      height="95vh"
      width="100%"
      bgImage={alertData.image}
      bgSize="cover"
      bgRepeat="no-repeat"
      bgPosition="center"
      // bg={!alertData.image ? "brand.bg" : undefined} // Fallback background
      overflow="hidden"
    >
      <Alert status={alertData.status} boxShadow="xl" borderRadius={0}>
        <AlertIcon />
        <AlertTitle>{alertData.title}</AlertTitle>
        <AlertDescription>{alertData.description}</AlertDescription>
      </Alert>
    </MotionBox>
  );
};

export default EmailVerification;
