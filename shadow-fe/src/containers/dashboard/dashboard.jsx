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
  Button,
} from "@chakra-ui/react";
import {
  FETCH_ACTIVE_RULES_ENDPOINT,
  FETCH_RULES_ENDPOINT,
  UPDATE_RULE_STATUS_ENDPOINT,
} from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
import { RULE_DASHBOARD_COLUMNS } from "./dashboard.config";
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

  const handleActiveToggle = async (ruleId, isActive) => {
    try {
      setLoading(true);
      const response = await ApiRequestUtils.put(UPDATE_RULE_STATUS_ENDPOINT, {
        ruleId,
        isActive,
      });
      const rule = response?.data?.data;
      const updatedRules = rules.map((r) =>
        r.ruleId === ruleId ? { ...r, isActive: rule.isActive } : r
      );
      setRules(updatedRules);
      console.log("F-2 Response", response);
    } catch (error) {
      console.error("Error updating rule status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchActiveRules = async () => {
    try {
      const response = await ApiRequestUtils.get(FETCH_ACTIVE_RULES_ENDPOINT);
      console.log("Active rules", response);
    } catch (e) {
      console.error("Error fetching active rules:", e);
    }
  };
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
        <Flex
          justifyContent={"center"}
          flexDirection={"column"}
          alignItems={"center"}
        >
          <CircularProgress
            isIndeterminate
            size="60px"
            thickness="4px"
            color="brand.primary"
          />
        </Flex>
      ) : (
        <Box>
          <Flex pb={2} justifyContent={"space-between"} alignItems="center">
            <Text>{`Showing ${rules?.length} out of ${totalRules} rule(s)`}</Text>
            <Button colorScheme="steel" onClick={handleFetchActiveRules}>
              Fetch Active Rules
            </Button>
          </Flex>

          <Table variant="simple">
            <Thead bg="brand.primary">
              <Tr>
                {RULE_DASHBOARD_COLUMNS.map((column) => (
                  <Th key={column} color="#121212">
                    {column}
                  </Th>
                ))}
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
