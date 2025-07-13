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
  Link as ChakraLink,
  Badge,
  Input,
  Icon,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FiSearch, FiUser, FiCalendar } from "react-icons/fi";
import {
  FETCH_RULES_ENDPOINT,
  UPDATE_RULE_STATUS_ENDPOINT,
} from "../../utils/apiEndpoints";
import ApiRequestUtils from "../../utils/apiRequestUtils";
import { RULE_DASHBOARD_COLUMNS } from "./dashboard.config";
import { useNavigate, Link } from "react-router";
import Pagination from "../../components/Pagination";
import { AddIcon } from "@chakra-ui/icons";

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
    setPagination({ ...pagination, currentPage });
  };

  const getMethodBadgeVariant = (method) => {
    switch (method) {
      case "POST":
        return "yellow";
      case "GET":
        return "blue";
      case "PUT":
        return "purple";
      case "DELETE":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box p={6}>
      {loading ? (
        <Flex justifyContent="center" alignItems="center">
          <CircularProgress
            isIndeterminate
            size="60px"
            thickness="4px"
            color="brand.primary"
          />
        </Flex>
      ) : (
        <Box bg="brand.surface" p={6} borderRadius="lg" boxShadow="xl">
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Flex flexDirection="column" gap={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                API Rules Management
              </Text>
              <Text fontSize="sm" color="brand.mutedText">
                {`Showing ${rules.length || 0}/${totalRules} rule(s)`}
              </Text>
            </Flex>
            <Button
              colorScheme="amber"
              onClick={() => navigate("/rule-config")}
            >
              <Flex alignItems="center" gap={2}>
                <AddIcon boxSize={3} /> Create new rule
              </Flex>
            </Button>
          </Flex>

          <Flex mb={4} gap={3} alignItems="center">
            <Box flex={1}>
              <Input
                placeholder="Search rules by name or description..."
                bg="brand.topSurface"
                color="white"
              />
            </Box>
            <Button variant="outlined">All</Button>
            <Button colorScheme="amber">Active</Button>
            <Button variant="outlined" colorScheme="topSurface">
              Inactive
            </Button>
          </Flex>

          <Box borderRadius="md" overflowX="auto">
            <Table variant="simple">
              <Thead bg="brand.primary">
                <Tr>
                  {RULE_DASHBOARD_COLUMNS.map((column) => (
                    <Th key={column} color="gray.900" fontWeight="bold">
                      {column}
                    </Th>
                  ))}
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody bg="brand.surface" color="white">
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
                    <Tr key={ruleId} _hover={{ bg: "brand.hover" }}>
                      <Td>
                        <ChakraLink
                          as={Link}
                          to={`/rule-config/${ruleId}`}
                          colorScheme="amber"
                        >
                          <Text fontWeight="medium">{name}</Text>
                        </ChakraLink>
                      </Td>
                      <Td>{description?.slice(0, 40)}</Td>
                      <Td>
                        <Badge
                          variant="subtle"
                          colorScheme={getMethodBadgeVariant(method)}
                        >
                          {method}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          textTransform="none"
                          variant="subtle"
                          colorScheme="white"
                        >
                          {url}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={3}>
                          <Switch
                            isChecked={isActive}
                            onChange={(e) =>
                              handleActiveToggle(ruleId, e.target.checked)
                            }
                            colorScheme="amber"
                          />
                          <Text fontSize="sm">
                            {isActive ? "Active" : "Inactive"}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FiCalendar} />
                          <Text fontSize="sm">
                            {new Date(updatedAt).toLocaleDateString()}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Icon as={FiUser} />
                          <Text fontSize="sm">{updatedBy}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <IconButton
                          variant="ghost"
                          icon={<Text>...</Text>}
                          aria-label="More actions"
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
