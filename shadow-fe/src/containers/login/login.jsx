import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Link as ChakraLink,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router";
import InputWithLabel from "../../components/InputWithLabel/inputWithLabel";
import { isValidEmail, isValidPassword } from "../../utils/validationUtils";
import { loginAPI } from "../../utils/apiRequestUtils";
import { GOOGLE_AUTH_ENDPOINT } from "../../utils/apiEndpoints";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedErrors = {};
    if (!isValidEmail(email)) {
      updatedErrors.email = true;
    }
    if (!isValidPassword(password)) {
      updatedErrors.password = true;
    }
    setErrors(updatedErrors);
    if (Object.keys(updatedErrors).length > 0) {
      toast({
        title: "Make sure your email and password are valid.",
        position: "top",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const result = await loginAPI({
        email,
        password,
      });
      console.log("result", result);
      localStorage.setItem("authToken", result?.data?.data?.token);
      toast({
        title: `Welcome back, ${result?.data?.data?.name || "User"}!`,
        position: "top",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      // Check if this is an email verification error
      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("verify your email")
      ) {
        toast({
          title: "Email Verification Required",
          description:
            error.response.data.message ||
            "Please check your email and verify your account",
          status: "warning",
          duration: 7000,
          isClosable: true,
        });
      } else {
        const errorMessage =
          error.response?.data?.error || "Login failed. Please try again.";
        toast({
          title: errorMessage,
          position: "top",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      return;
    }
  };

  // const handleGoogleLogin = () => {
  //   window.location.href = GOOGLE_AUTH_ENDPOINT;
  // };

  return (
    <Flex
      height="100vh"
      width="100vw"
      justifyContent="flex-end"
      bgImage="url('/assets/login2.png')"
      bgSize="cover"
      bgPosition="center"
    >
      <Box
        p={8}
        shadow="xl"
        maxW="400px"
        w="100%"
        bg="brand.surface"
      >
        <Heading textAlign="center" mb={6} size="lg">
          Welcome Back
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <InputWithLabel
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              isRequired
              helperText="We'll never share your email."
              isInvalid={errors.email}
              error="Please enter a valid email address."
            />
            <InputWithLabel
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              isRequired
              helperText="Password must be 8+ characters, include uppercase, lowercase, number & special character."
              isInvalid={errors.password}
              error="Invalid password."
            />
            <Flex justify="flex-end">
              <ChakraLink as={RouterLink} to="/forgot-password" fontSize="sm">
                Forgot password?
              </ChakraLink>
            </Flex>
            <Button variant="outline" type="submit" width="full">
              Login
            </Button>
            {/* <Button onClick={handleGoogleLogin}>Continue with Google</Button> */}
            <Text fontSize="sm">
              Don't have an account?{" "}
              <ChakraLink as={RouterLink} to="/register" fontWeight="medium">
                Register
              </ChakraLink>
            </Text>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
