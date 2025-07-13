import {
  Box,
  Flex,
  Text,
  Stack,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Switch,
  Link,
  Textarea,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CircularProgress,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { cloneDeep } from "lodash";
import SelectWithLabel from "../../components/SelectWithLabel";
import InputWithLabel from "./../../components/InputWithLabel/inputWithLabel";
import {
  REQUEST_TYPE,
  MATCH_OPTIONS,
  EXACT_MATCH_VAL,
  RULE_PAYLOAD,
} from "./config";
import { useState, useRef, useEffect } from "react";
import RulePayload from "../../components/RulePayload";
import apiRequestUtils from "../../utils/apiRequestUtils";
import {
  FETCH_RULE_DETAILS_BY_ID_ENDPOINT,
  SAVE_RULE_ENDPOINT,
  UPDATE_RULE_BY_ID_ENPOINT,
} from "../../utils/apiEndpoints";
import { useParams } from "react-router";

const initialRuleState = {
  method: "GET",
  url: "",
  match: EXACT_MATCH_VAL,
  hasPayload: false,
  name: "",
  description: "",
};

const RuleConfig = () => {
  const [rule, setRule] = useState(initialRuleState);
  const [rulePayload, setRulePayload] = useState([]);
  const [mockResponse, setMockResponse] = useState("");
  const [errors, setErrors] = useState({});
  const [alertData, setAlertData] = useState({});
  const [loading, setLoading] = useState(false);
  const counterRef = useRef(1);

  const params = useParams();
  const ruleId = params?.ruleId || "";

  useEffect(() => {
    if (ruleId) {
      fetchRuleDetails();
    }
  }, [ruleId]);

  const fetchRuleDetails = async () => {
    if (!ruleId) return;
    try {
      setLoading(true);
      const resp = await apiRequestUtils.get(
        FETCH_RULE_DETAILS_BY_ID_ENDPOINT(ruleId)
      );
      updateState(resp?.data?.data || {});
    } catch (error) {
      setAlertData({
        status: "error",
        title: "Error loading rule",
        description:
          error?.response?.data?.message || "Could not load rule details",
        flexDirection: "row",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setRule((prevRule) => ({
      ...prevRule,
      [key]: value,
    }));
  };

  const handleAdd = () => {
    if (rulePayload.length >= 3) return;
    setRulePayload((prevPayload) => [
      ...prevPayload,
      { ...RULE_PAYLOAD, id: counterRef.current++ },
    ]);
  };

  const handleRemove = (id) => {
    setRulePayload((prevPayload) =>
      prevPayload.filter((data) => data.id !== id)
    );
  };

  const handlePayloadUpdate = (id, key, value) => {
    setRulePayload((prevPayload) =>
      prevPayload.map((payload) =>
        payload.id === id ? { ...payload, [key]: value } : payload
      )
    );
  };

  const handleMockResponse = (e) => {
    const res = e.target?.value;
    setMockResponse(res);

    try {
      if (res) JSON.parse(res);
      setErrors((prev) => ({ ...prev, response: "" }));
    } catch (e) {
      setErrors((prev) => ({ ...prev, response: "Invalid JSON" }));
    }
  };

  const updateState = (resp = {}) => {
    const {
      method = "GET",
      url = "",
      payload = [],
      name = "",
      description = "",
      match = EXACT_MATCH_VAL,
      response = null,
    } = resp;

    setRule({
      name,
      description,
      method,
      url,
      match,
      hasPayload: payload?.length > 0,
    });

    setMockResponse(response || "");
    setRulePayload(payload.length ? payload : []);
  };

  const resetForm = () => {
    setRule(initialRuleState);
    setRulePayload([]);
    setMockResponse("");
    setErrors({});
  };

  const createRule = async (ruleData) => {
    try {
      setLoading(true);
      await apiRequestUtils.post(SAVE_RULE_ENDPOINT, ruleData);
      resetForm();
      setAlertData({
        status: "success",
        title: "Rule has been created.",
        description: "Please enable it from dashboard",
        flexDirection: "row",
      });
    } catch (error) {
      console.error("Error while saving rule data:", error);
      setAlertData({
        status: "error",
        title: error?.response?.data?.message || "Error while saving rule",
        description: error?.response?.data?.error || "",
        flexDirection: "row",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (ruleData) => {
    try {
      setLoading(true);
      const resp = await apiRequestUtils.put(
        UPDATE_RULE_BY_ID_ENPOINT(ruleId),
        ruleData
      );
      updateState(resp?.data?.data || {});
      setAlertData({
        status: "success",
        title: "Rule has been updated.",
        description: "Please enable it from dashboard",
        flexDirection: "row",
      });
    } catch (error) {
      console.error("Error while updating", error);
      setAlertData({
        status: "error",
        title: error?.response?.data?.message || "Error while updating rule",
        description: error?.response?.data?.error || "",
        flexDirection: "row",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateRule = () => {
    const newErrors = {};

    // Validate response
    if (!mockResponse) {
      newErrors.response = "Response is required";
    } else {
      try {
        JSON.parse(mockResponse);
      } catch (e) {
        newErrors.response = "Invalid JSON format";
      }
    }

    // Validate URL, name, description
    if (!rule.url) newErrors.url = "URL is required";
    if (!rule.name) newErrors.name = "Name is required";
    if (!rule.description) newErrors.description = "Description is required";

    // Validate payload if applicable
    if (rule.hasPayload) {
      const isValidPayload = rulePayload.every(
        (payload) => payload.key && payload.value
      );
      if (!isValidPayload) {
        newErrors.payload = "All payload matchers must have key and value";
      }
    }

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => !!error);

    if (hasErrors) {
      setAlertData({
        status: "error",
        title: "Please fix the errors before submitting",
        description: (
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {Object.entries(newErrors).map(([key, value]) => {
              if (value) {
                return <li key={key}>{value}</li>;
              }
              return null;
            })}
          </ul>
        ),
        flexDirection: "column",
      });
    }

    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateRule()) {
      return;
    }

    const ruleData = {
      ...rule,
      payload: rule.hasPayload ? rulePayload : [],
      response: mockResponse,
    };

    if (ruleId) {
      updateRule(ruleData);
    } else {
      createRule(ruleData);
    }
  };

  const { url, match, method, name, description, hasPayload } = rule;

  return (
    <Flex alignItems="center" flexDirection="column">
      {loading ? (
        <Flex
          justifyContent="center"
          flexDirection="column"
          alignItems="center"
        >
          <CircularProgress
            isIndeterminate
            size="60px"
            thickness="4px"
            color="brand.primary"
          />
        </Flex>
      ) : (
        <>
          {alertData?.title && (
            <Alert
              status={alertData.status}
              flexDirection={alertData.flexDirection || "row"}
              alignItems="start"
              justifyContent="start"
              mb={4}
            >
              {alertData.flexDirection === "row" && <AlertIcon />}
              <AlertTitle>{alertData?.title}</AlertTitle>
              <AlertDescription>
                {alertData?.description || ""}
              </AlertDescription>
            </Alert>
          )}
          <Box bg="brand.primary" px={6} py={4} width="50%">
            <Text fontWeight="bold" fontSize="xl" color="#121212">
              {ruleId ? "Update Rule" : "+ Create New Rule"}
            </Text>
            <Text color="brand.surface">
              Configure your API mocking rule with the details below
            </Text>
          </Box>
          <Box bg="brand.surface" p={5} borderRadius={5} width="50%" mb={4}>
            <InputWithLabel
              label="Name"
              value={name}
              onChange={(e) => handleChange("name", e?.target?.value)}
              placeholder="Enter Rule name"
              isRequired
              isInvalid={errors.name}
              error={errors.name || "This is required"}
            />
            <InputWithLabel
              label="Description"
              value={description}
              onChange={(e) => handleChange("description", e?.target?.value)}
              placeholder="Enter Rule Description"
              isRequired
              isInvalid={errors.description}
              error={errors.description || "This is required"}
            />
          </Box>
          <Box
            bg="brand.surface"
            px={5}
            py={4}
            borderRadius={5}
            width="50%"
            mb={4}
          >
            <Stack spacing={4}>
              <RadioGroup
                onChange={(val) => handleChange("method", val)}
                value={method}
              >
                <Flex gap={5} flexWrap="wrap">
                  {REQUEST_TYPE.map((requestName) => (
                    <Flex gap={2} key={requestName}>
                      <Radio colorScheme="amber" value={requestName}>
                        {requestName}
                      </Radio>
                    </Flex>
                  ))}
                </Flex>
              </RadioGroup>
              <Flex gap={5}>
                <InputWithLabel
                  label="Url"
                  value={url}
                  onChange={(e) => handleChange("url", e?.target?.value)}
                  placeholder="Enter URL"
                  isRequired
                  isInvalid={errors.url}
                  error={errors.url || "This is required"}
                />
                <SelectWithLabel
                  label="Match"
                  name="match"
                  options={MATCH_OPTIONS}
                  value={match}
                  onChange={(e) => handleChange("match", e?.target?.value)}
                />
              </Flex>
              <FormControl display="flex" alignItems="center" mb={2}>
                <FormLabel htmlFor="payload-toggle" mb="0">
                  Match on Payload?
                </FormLabel>
                <Switch
                  id="payload-toggle"
                  isChecked={hasPayload}
                  onChange={(e) => handleChange("hasPayload", e.target.checked)}
                  colorScheme="amber"
                />
              </FormControl>
              {hasPayload && (
                <Box>
                  {rulePayload.map((payload) => (
                    <RulePayload
                      payload={payload}
                      key={payload.id}
                      handleRemove={handleRemove}
                      handlePayloadUpdate={handlePayloadUpdate}
                      id={payload.id}
                    />
                  ))}

                  <Link
                    mt={3}
                    onClick={handleAdd}
                    color={rulePayload.length >= 3 ? "gray.500" : "yellow.400"}
                    pointerEvents={rulePayload.length >= 3 ? "none" : "auto"}
                    fontWeight="medium"
                    display="inline-block"
                  >
                    <Flex>
                      <AddIcon mt={1.5} mr={1} boxSize={3} />
                      <Text>Add Matcher</Text>
                    </Flex>
                  </Link>
                  {rulePayload.length >= 3 && (
                    <Text color="yellow.400" mt={2}>
                      You can add up to 3 matchers only.
                    </Text>
                  )}
                  {errors.payload && (
                    <Text color="red.500" mt={2}>
                      {errors.payload}
                    </Text>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          <Box bg="brand.surface" p={5} borderRadius={5} width="50%" mb={4}>
            <Text mb={2}>Response</Text>
            <Textarea
              value={mockResponse}
              onChange={handleMockResponse}
              placeholder="Enter mock response"
              rows={8}
              isInvalid={!!errors.response}
            />
            {errors.response && (
              <Text color="red.500" mt={2}>
                {errors.response}
              </Text>
            )}
          </Box>
          <Box bg="brand.surface" width="50%" p={5} mt={2}>
            <Flex justifyContent="flex-end" gap={3}>
              <Button colorScheme="steel" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} colorScheme="amber">
                {ruleId ? "Update" : "Create"}
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Flex>
  );
};

export default RuleConfig;
