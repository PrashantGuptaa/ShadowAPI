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
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/shadowGolden.png";
import { useNavigate } from "react-router";

const AppHeader = () => {
  const navigate = useNavigate();
  return (
    <div style={{ width: "100%", position: "sticky", top: 0, zIndex: 10000 }}>
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
            <IconButton borderRadius={"full"} aria-label="Search database">
              <FaUserCircle />
            </IconButton>
            <MenuList>
              <MenuItem value="profile">Profile</MenuItem>
              <MenuItem value="sign-out">Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Box>
    </div>
  );
};

export default AppHeader;
