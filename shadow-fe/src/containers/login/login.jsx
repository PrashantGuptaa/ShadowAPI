import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  Link as ChakraLink,
  // Field,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";
import InputWithLabel from "../../components/InputWithLabel/inputWithLabel";
import { isValidEmail, isValidPassword } from "../../utils/validationUtils";
import apiRequestUtils from "../../utils/apiRequestUtils";
import { LOGIN_ENDPOINT } from "../../utils/apiEndpoints";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically handle the login logic, e.g., API call
    console.log("Email:", email);
    console.log("Password:", password);
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
      const result = await apiRequestUtils.post(LOGIN_ENDPOINT, {
        email,
        password,
      });
      console.log("result", result);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      toast({
        title: errorMessage,
        position: "top",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
      
    }

 
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      // alignItems="center"
      justifyContent="flex-end"
      bgImage="url('/assets/login2.png')"
      bgSize="cover"
      bgPosition="center"
    >
      <Box
        p={8}
        rounded="md"
        shadow="xl"
        maxW="400px"
        borderRadius="0"
        w="100%"
        bg="brand.surface"
      >
        <Heading textAlign="center" mb={6} size="lg">
          Welcome Back
        </Heading>
        <form>
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
              isInvalid={!isValidEmail(email) || errors.email}
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
              isInvalid={!isValidPassword(password) || errors.password}
              error="Invalid password."
            />
            <Flex justify="flex-end">
              <ChakraLink fontSize="sm">Forgot password?</ChakraLink>
            </Flex>
            <Button
              variant="outline"
              type="submit"
              width="full"
              onClick={handleSubmit}
            >
              Login
            </Button>
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
