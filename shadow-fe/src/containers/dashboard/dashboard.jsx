import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from "@chakra-ui/react";
import { FETCH_RULES_ENDPOINT } from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await ApiRequestUtils.get(
          FETCH_RULES_ENDPOINT(pagination.currentPage, pagination.pageSize)
        );
        console.log("Response:", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <Box
      bg="brand.surface"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      {loading ? (
        <CircularProgress isIndeterminate size="120px" thickness="4px" />
      ) : (
        <Table variant="simple">
          <Thead bg="brand.primary">
            <Tr>
              <Th color="#121212">Name</Th>
              <Th color="#121212">Email</Th>
              <Th color="#121212">Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr _hover={{ bg: "#2A2A2A" }}>
              <Td color="brand.text">John Doe</Td>
              <Td color="brand.text">john@example.com</Td>
              <Td color="brand.text">Admin</Td>
            </Tr>
            <Tr _hover={{ bg: "#2A2A2A" }}>
              <Td color="brand.text">John Doe</Td>
              <Td color="brand.text">john@example.com</Td>
              <Td color="brand.text">Admin</Td>
            </Tr>
            {/* more rows... */}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default Dashboard;
