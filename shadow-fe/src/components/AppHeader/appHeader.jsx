import {
  Box,
  Flex,
  Heading,
  Avatar,
  Spacer,
  Image,
  IconButton,
  Menu,
  Portal,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { FaUserCircle } from "react-icons/fa";
import logo from "../../assets/shadowGolden.png";

const AppHeader = () => {
  return (
    <div style={{ width: "100%", position: "sticky", top: 0, zIndex: 10000 }}>
      <Box
        as="header"
        px={6}
        py={3}
        boxShadow="inner"
        position="sticky"
        top={0}
        zIndex={10000}
      >
        <Flex align="center">
          {/* Logo and App Name */}
          <Flex align="center" gap={3}>
            <Image src={logo} alt="App Logo" boxSize="40px" />
            <Heading size="md">ShadowAPI</Heading>
          </Flex>

          <Spacer />
          <Menu>
            {/* <MenuButton> */}
            <IconButton borderRadius={"full"} aria-label="Search database">
              <FaUserCircle />
            </IconButton>
            {/* </MenuButton> */}
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
