import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  Link as ChakraLink,
  Field,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the login logic, e.g., API call
    console.log("Email:", email);
    console.log("Password:", password);

    toaster.create({
      description: "File saved successfully",
      type: "info",
    });
  };
  return (
    <Flex
      height="100vh"
      width="100vw"
      // alignItems="center"
      justifyContent="flex-end"
      bgImage="url('/assets/login.jpg')"
      bgSize="cover"
      bgPosition="center"
    >
      <Box
        bg="whiteAlpha.900"
        p={8}
        rounded="md"
        shadow="xl"
        maxW="400px"
        w="100%"
      >
        <Heading textAlign="center" mb={6} size="lg" color="teal.600">
          Welcome Back
        </Heading>
        <form>
          <Stack spacing={4}>
            <Field.Root required>
              <Field.Label>
                Email <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>
                Email <Field.RequiredIndicator />
              </Field.Label>
              <Input
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Field.HelperText>
                Password must be 8+ characters, include uppercase, lowercase,
                number & special character.
              </Field.HelperText>
            </Field.Root>
            <Flex justify="flex-end">
              <ChakraLink color="teal.500" fontSize="sm">
                Forgot password?
              </ChakraLink>
            </Flex>
            <Button
              colorPalette="teal"
              variant="outline"
              type="submit"
              width="full"
              bg={"teal.500"}
              color="white"
              onClick={handleSubmit}
            >
              Login
            </Button>
            <Text fontSize="sm">
              Don't have an account?{" "}
              <ChakraLink
                as={RouterLink}
                to="/register"
                color="blue.500"
                fontWeight="medium"
              >
                Register
              </ChakraLink>
            </Text>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
