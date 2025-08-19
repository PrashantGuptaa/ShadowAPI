import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { Link } from "react-router";
import InputWithLabel from "../../components/InputWithLabel/inputWithLabel";
import { forgotPasswordAPI } from "../../utils/apiRequestUtils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPasswordAPI({ email });
      setSuccess(true);
      toast({
        title: "Email Sent",
        description:
          response.message || "Password reset instructions sent to your email",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send reset email",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          rounded="md"
          shadow="xl"
          maxW="400px"
          w="100%"
          bg="brand.surface"
        >
          <VStack spacing={6}>
            <Alert status="success" rounded="md">
              <AlertIcon />
              <AlertDescription>
                Password reset instructions have been sent to your email
                address. Please check your inbox and follow the instructions to
                reset your password.
              </AlertDescription>
            </Alert>

            <VStack spacing={4} w="full">
              <Button
                as={Link}
                to="/login"
                variant="outline"
                w="full"
                _hover={{ bg: "brand.accent", color: "brand.bg" }}
              >
                Back to Login
              </Button>

              <Button
                variant="ghost"
                size="sm"
                color="brand.textSecondary"
                onClick={() => setSuccess(false)}
              >
                Try different email
              </Button>
            </VStack>
          </VStack>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex
      height="100vh"
      width="100vw"
      justifyContent="flex-end"
      bgImage="url('/assets/login2.png')"
      bgSize="cover"
      bgPosition="center"
    >
      <Box p={8} shadow="xl" maxW="400px" w="100%" bg="brand.surface">
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="brand.text">
              Forgot Password?
            </Text>
            <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              <InputWithLabel
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                isLoading={loading}
                loadingText="Sending..."
                w="full"
                size="lg"
                variant="outline"
                _hover={{ bg: "brand.accent", color: "brand.bg" }}
              >
                Send Reset Link
              </Button>
            </VStack>
          </Box>

          <HStack spacing={4} w="full" justify="center">
            <Button
              as={Link}
              to="/login"
              variant="ghost"
              size="sm"
              color="brand.textSecondary"
            >
              Back to Login
            </Button>

            <Text color="brand.textSecondary">•</Text>

            <Button
              as={Link}
              to="/register"
              variant="ghost"
              size="sm"
              color="brand.textSecondary"
            >
              Create Account
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ForgotPassword;
