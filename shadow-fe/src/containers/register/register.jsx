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
import { REGISTER_ENDPOINT } from "../../utils/apiEndpoints";

export default function Register() {
  const [userDetails, setUserDetails] = useState({});
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const handleInputChange = (key, value) => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [key]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [key]: false, // Reset error for the field being edited
    }));
  };

  const checkForErrors = () => {
    const updatedErrors = {};
    const { email, password, retypePassword, name } = userDetails;

    if (!isValidEmail(email)) {
      updatedErrors.email = true;
    }
    if (!isValidPassword(password)) {
      updatedErrors.password = true;
    }
    if (!isValidPassword(retypePassword) || retypePassword !== password) {
      updatedErrors.retypePassword = true;
    }
    if (!name || name.length < 3) {
      updatedErrors.name = true;
    }

    setErrors(updatedErrors);
    return Object.keys(updatedErrors).length > 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorExist = checkForErrors();
    if (errorExist) {
      toast({
        title: "Make sure you've filled all fields correctly marked with *",
        position: "top",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // register user logic here
    try {
      console.log("User Details:", userDetails);
      const response = await apiRequestUtils.post(REGISTER_ENDPOINT, userDetails);
      // Here you would typically handle the registration logic, e.g., API call
      toast({
        title: "Registration successful!",
        description: "You'll receive a verification email shortly. Please check your inbox and spam folder.",
        position: "top",
        status: "success",
        duration: 25000,
        isClosable: false,
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed. Please try again.",
        description: error?.response?.data?.error || "An unexpected error occurred.",
        position: "top",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const { email, password, retypePassword, name } = userDetails;
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
        w="100%"
        bg="brand.surface"
        borderRadius="0"
      >
        <form>
          <Stack spacing={4}>
            <InputWithLabel
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              isRequired
              helperText="Password must be 8+ characters, include uppercase, lowercase, number & special character."
              isInvalid={!isValidPassword(password) || errors.password}
              error="Password must be at least 8 characters long."
            />
            <InputWithLabel
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              isRequired
              helperText="Please re-enter your password."
              value={retypePassword}
              onChange={(e) => handleInputChange("retypePassword", e.target.value)}
              isInvalid={!isValidPassword(retypePassword) || errors.retypePassword}
              error="Passwords do not match."
            />
            <InputWithLabel
              label="Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              isRequired
              helperText="Please enter your full name."
              isInvalid={errors.name}
              value={name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              minLength={3}
              maxLength={50}
              error="Name must be at least 3 characters long."
            />
            <Button
              variant="outline"
              type="submit"
              width="full"
              onClick={handleSubmit}
            >
              Register
            </Button>
            <Text fontSize="sm">
              Already have an account?{" "}
              <ChakraLink as={RouterLink} to="/login" fontWeight="medium">
                Login
              </ChakraLink>
            </Text>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
