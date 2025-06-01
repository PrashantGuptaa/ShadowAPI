import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { VERIFY_EMAIL_ENDPOINT } from "../../utils/apiEndpoints";
import { ApiRequestUtils } from "../../utils/apiRequestUtls";

const EmailVerification = () => {
  // fetch token from url
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState("Account verification in progress...");
  console.info("Email verification token:", token);
  // verify token with backend
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        const response = await ApiRequestUtils.post(
          VERIFY_EMAIL_ENDPOINT(token)
        );
        if (response.status === 200) {
          console.info("Email verified successfully:", response.data);
          // Optionally, redirect to a success page or show a success message
              setMessage("Your email has been successfully verified!");
        } else {
          console.error("Email verification failed:", response.data);
        }
      } catch (error) {
        console.error("Error verifying email:", error);
      }
    };
    verifyEmail();
  }, [token]);
  return <Box>
      <h3>{message}</h3>
  </Box>;
};

export default EmailVerification;
