import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  FETCH_RULES_ENDPOINT,
  UPDATE_RULE_STATUS_ENDPOINT,
} from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
import { RULE_DASHBOARD_COLUMNS } from "./dashboard.config";
import { useNavigate, Link } from "react-router";
import Pagination from "../../components/Pagination";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });
  const [rules, setRules] = useState([]);
  const [totalRules, setTotalRules] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await ApiRequestUtils.get(
          FETCH_RULES_ENDPOINT(pagination.currentPage, pagination.pageSize)
        );
        setRules(response.data?.data?.rules || []);
        setTotalRules(response.data?.data?.totalCount || 0);
        const paginationCopy = {
          ...pagination,
          totalPages: Math.ceil(
            (response.data?.data?.totalCount || 1) / pagination.pageSize
          ),
        };
        setPagination(paginationCopy);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pagination.currentPage]);

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
    } catch (error) {
      console.error("Error updating rule status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (currentPage) => {
    const paginationCopy = { ...pagination, currentPage };
    setPagination(paginationCopy);
  }

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
          <Flex pb={4} justifyContent={"space-between"} alignItems="center">
            <Text>{`Showing ${rules?.length} out of ${totalRules} rule(s)`}</Text>
            <Button onClick={() => navigate("/rule-config")}>
              Create new rule
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
              {rules.map((rule, i) => {
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
                  <Tr key={i}>
                    <Td color="brand.text">
                      <Link to={`/rule-config/${ruleId}`} colorScheme="amber">
                        {name}
                      </Link>
                    </Td>
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
          <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange}/>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
