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
  Switch,
  Text,
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
  const [rules, setRules] = useState([]);
  const [totalRules, setTotalRules] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await ApiRequestUtils.get(
          FETCH_RULES_ENDPOINT(pagination.currentPage, pagination.pageSize)
        );
        console.log("Response:", response);
        setRules(response.data?.data?.rules || []);
        setTotalRules(response.data?.data?.totalCount || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActiveToggle = async (ruleId, isActive) => {};
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
        <Box>
          <Text
            pb={"4"}
          >{`Showing ${rules?.length} out of ${totalRules} rule(s)`}</Text>
          <Table variant="simple">
            <Thead bg="brand.primary">
              <Tr>
                <Th color="#121212">Name</Th>
                <Th color="#121212">Description</Th>
                <Th color="#121212">Method</Th>
                <Th color="#121212">URL</Th>
                <Th color="#121212">Active</Th>
                <Th color="#121212">Last Updated At</Th>
                <Th color="#121212">Last Updated By</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rules.map((rule) => {
                const {
                  name,
                  description,
                  method,
                  url,
                  isActive,
                  updatedAt,
                  updatedBy,
                  ruleId,
                } = rule;
                return (
                  <Tr>
                    <Td color="brand.text">{name}</Td>
                    <Td color="brand.text">{description.slice(0, 40)}</Td>
                    <Td color={"brand.text"}>{method}</Td>
                    <Td color={"brand.text"}>{url}</Td>
                    <Td color={"brand.text"}>
                      <Switch
                        id="active-toggle"
                        isChecked={isActive}
                        onChange={(e) =>
                          handleActiveToggle(ruleId, e.target.checked)
                        }
                        colorScheme="amber"
                      />
                    </Td>
                    <Td color={"brand.text"}>
                      {new Date(updatedAt).toLocaleDateString()}
                    </Td>
                    <Td color={"brand.text"}>{updatedBy}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
