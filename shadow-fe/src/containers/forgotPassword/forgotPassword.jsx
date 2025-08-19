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
import { Link, useNavigate } from "react-router";
import { forgotPasswordAPI } from "../../utils/apiRequestUtils";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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
        justifyContent="center"
        alignItems="center"
        bg="gray.50"
      >
        <Box
          bg="white"
          p={8}
          rounded="lg"
          shadow="lg"
          maxW="md"
          w="full"
          mx={4}
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
              <Button as={Link} to="/login" variant="outline" w="full">
                Back to Login
              </Button>

              <Button
                variant="ghost"
                size="sm"
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
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <Box bg="white" p={8} rounded="lg" shadow="lg" maxW="md" w="full" mx={4}>
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Forgot Password?
            </Text>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              No worries! Enter your email address and we'll send you a link to
              reset your password.
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.500",
                  bg: "white",
                }}
              />

              <Button
                type="submit"
                isLoading={loading}
                loadingText="Sending..."
                w="full"
                size="lg"
                colorScheme="blue"
              >
                Send Reset Link
              </Button>
            </VStack>
          </Box>

          <HStack spacing={4} w="full" justify="center">
            <Button as={Link} to="/login" variant="ghost" size="sm">
              Back to Login
            </Button>

            <Text color="gray.400">•</Text>

            <Button as={Link} to="/register" variant="ghost" size="sm">
              Create Account
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ForgotPassword;
