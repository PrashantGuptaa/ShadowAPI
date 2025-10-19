import {
  Box,
  Flex,
  Heading,
  Spacer,
  Image,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Avatar,
} from "@chakra-ui/react";
import logo from "../../assets/shadowGolden.png";
import { useNavigate } from "react-router";
import { clearLocalStorage } from "../../utils/commonUtils";

const AppHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    clearLocalStorage();

    navigate("/login");
  };

  return (
    <div style={{ width: "100%", position: "sticky", top: 0, zIndex: 1 }}>
      <Box
        as="header"
        px={6}
        py={3}
        boxShadow="inner"
        position="sticky"
        top={0}
        bg="brand.bg"
        zIndex={1}
      >
        <Flex align="center">
          <Flex align="center" gap={3}>
            <Image src={logo} alt="App Logo" boxSize="40px" />
            <Heading
              size="md"
              onClick={() => navigate("/dashboard")}
              cursor="pointer"
            >
              ShadowAPI
            </Heading>
          </Flex>
          <Spacer />
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="User Menu"
              icon={
                <Avatar
                  size="sm"
                  name={localStorage.getItem("name")}
                  src={localStorage.getItem("picture")}
                  bg="brand.primary"
                />
              }
              borderRadius="full"
              variant="ghost"
            />
            <MenuList>
              <MenuItem value="profile">Profile</MenuItem>
              <MenuItem value="sign-out" onClick={handleSignOut}>
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    </div>
  );
};

export default AppHeader;
