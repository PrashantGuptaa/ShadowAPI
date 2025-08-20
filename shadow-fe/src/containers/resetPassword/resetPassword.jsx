import React, { useState, useEffect } from "react";
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
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Link, useNavigate, useSearchParams } from "react-router";
import InputWithLabel from "../../components/InputWithLabel/inputWithLabel";
import { resetPasswordAPI } from "../../utils/apiRequestUtils";
import {
  validatePassword,
  checkPasswordStrength,
} from "../../utils/inputSanitizer";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      toast({
        title: "Invalid Link",
        description: "This password reset link is invalid or expired",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/forgot-password");
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate, toast]);

  // Handle password change with real-time validation
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords are identical",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid Password",
        description:
          "Password must be 8+ characters with uppercase, lowercase, number & special character",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordAPI({ token, newPassword: password });
      setSuccess(true);
      toast({
        title: "Password Reset Successful",
        description:
          response.message || "Your password has been reset successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast({
        title: "Reset Failed",
        description:
          error.response?.data?.message ||
          "Failed to reset password. The link may be expired.",
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
                Your password has been reset successfully! You can now login
                with your new password. Redirecting to login page...
              </AlertDescription>
            </Alert>

            <Button
              as={Link}
              to="/login"
              variant="outline"
              _hover={{ bg: "brand.accent", color: "brand.bg" }}
              w="full"
            >
              Go to Login
            </Button>
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
      <Box
        p={8}
        rounded="md"
        shadow="xl"
        maxW="400px"
        w="100%"
        bg="brand.surface"
      >
        <VStack spacing={6}>
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="brand.text">
              Reset Password
            </Text>
            <Text fontSize="sm" color="brand.textSecondary" textAlign="center">
              Enter your new password below
            </Text>
          </VStack>

          <Box as="form" onSubmit={handleSubmit} w="full">
            <VStack spacing={4}>
              <InputWithLabel
                label="New Password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  />
                }
              />

              <InputWithLabel
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                rightElement={
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  />
                }
              />

              <Text
                fontSize="xs"
                color="brand.textSecondary"
                textAlign="left"
                w="full"
              >
                Password must be 8+ characters with uppercase, lowercase, number
                & special character
              </Text>

              <Button
                type="submit"
                isLoading={loading}
                loadingText="Resetting..."
                w="full"
                size="lg"
                variant="outline"
                _hover={{ bg: "brand.accent", color: "brand.bg" }}
                isDisabled={!token}
              >
                Reset Password
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
              to="/forgot-password"
              variant="ghost"
              size="sm"
              color="brand.textSecondary"
            >
              Request New Link
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default ResetPassword;
