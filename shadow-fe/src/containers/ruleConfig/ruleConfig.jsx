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
import { useState } from "react";
import RulePayload from "../../components/RulePayload";
import { useRef } from "react";
import apiRequestUtils from "../../utils/apiRequestUtils";
import {
  FETCH_RULE_DETAILS_BY_ID_ENDPOINT,
  SAVE_RULE_ENDPOINT,
  UPDATE_RULE_BY_ID_ENPOINT,
} from "../../utils/apiEndpoints";
import { useParams } from "react-router";
import { useEffect } from "react";

const RuleConfig = () => {
  const [rule, setRule] = useState({
    method: "GET",
    url: "",
    match: EXACT_MATCH_VAL,
    hasPayload: false,
  });
  const [rulePayload, setRulePayload] = useState([]);
  const [mockResponse, setMockResponse] = useState("");
  const [errors, setErrors] = useState({});
  const [alertData, setAlertData] = useState({});
  const [loading, setLoading] = useState(false);
  const counterRef = useRef(1);

  const params = useParams();
  const ruleId = params?.ruleId || "";

  useEffect(() => {
    fetchRuleDetails();
  }, []);

  const fetchRuleDetails = async () => {
    if (!ruleId) return;
    try {
      setLoading(true);
      const resp = await apiRequestUtils.get(
        FETCH_RULE_DETAILS_BY_ID_ENDPOINT(ruleId)
      );
      updateState(resp?.data?.data || {});
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    const ruleCopy = { ...rule };
    ruleCopy[key] = value;
    setRule(ruleCopy);
  };

  const handleAdd = () => {
    if (rulePayload.length >= 3) return;
    const rulePayloadCopy = cloneDeep(rulePayload);
    rulePayloadCopy.push({ ...RULE_PAYLOAD, id: counterRef.current++ });
    setRulePayload(rulePayloadCopy);
  };

  const handleRemove = (id) => {
    const filteredPayload = rulePayload.filter((data) => data.id !== id);
    setRulePayload(filteredPayload);
  };

  const handlePayloadUpdate = (id, key, value) => {
    const updatesRulesPayload = rulePayload.map((payload) => {
      if (payload.id === id) {
        return {
          ...payload,
          [key]: value,
        };
      }
      return payload;
    });
    setRulePayload(updatesRulesPayload);
  };

  const handleMockResponse = (e) => {
    const res = e.target?.value;
    const errCopy = { ...errors };
    errCopy.response = "Invalid JSON";
    try {
      setMockResponse(res);
      JSON.parse(res);
      errCopy.response = "";
    } catch (e) {
      console.error(e);
    } finally {
      setErrors(errCopy);
    }
  };

  const updateState = (resp = {}) => {
    const {
      method = "",
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
    setMockResponse(response);
    setRulePayload(payload);
  };

  const createRule = async (ruleData) => {
    try {
      setLoading(true);
      const result = await apiRequestUtils.post(SAVE_RULE_ENDPOINT, ruleData);
      // clear form
      updateRule({});
      // update alert for success
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

      // update alert for success
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
    const errCopy = { ...errors };
    errCopy.response = "";
    if (!mockResponse) {
      errCopy.response = "Response is required";
    } else {
      try {
        JSON.parse(mockResponse);
      } catch (e) {
        errCopy.response = "Invalid JSON format";
      }
    }
    if (!rule.url) {
      errCopy.url = "URL is required";
    } else {
      errCopy.url = "";
    }
    if (!rule.name) {
      errCopy.name = "Name is required";
    } else {
      errCopy.name = "";
    }
    if (!rule.description) {
      errCopy.description = "Description is required";
    } else {
      errCopy.description = "";
    }
    if (rule.hasPayload) {
      const isValidPayload = rulePayload.every((payload) => {
        return payload.key && payload.value;
      });
      if (!isValidPayload) {
        errCopy.payload = "All payload matchers must have key and value";
      } else {
        errCopy.payload = "";
      }
    } else {
      errCopy.payload = "";
    }
    setErrors(errCopy);
    const hasErrors = Object.values(errCopy).every((error) => !error);
    console.log("F-1 errors", hasErrors, errCopy);
    if (!hasErrors) {
      setAlertData({
        status: "error",
        title: "Please fix the errors before submitting",
        description: (
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {Object.entries(errCopy).map(([key, value]) => {
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
    return hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateRule()) {
      return;
    }
    const ruleData = {
      ...rule,
      payload: rulePayload,
      response: mockResponse,
    };
    if (ruleId) {
      updateRule(ruleData);
    } else {
      createRule(ruleData);
    }
  };

  const { url, match, method, name, description } = rule;
  console.log("F-2 errors", errors);
  return (
    <Flex alignItems="center" flexDirection="column">
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
        <>
          {alertData?.title && (
            <Alert
              status={alertData.status}
              flexDirection={alertData.flexDirection || "row"}
              alignItems="start"
              justifyContent="start"
            >
              {alertData.flexDirection === "row" && <AlertIcon />}
              <AlertTitle>{alertData?.title}</AlertTitle>
              <AlertDescription>
                {alertData?.description || ""}
              </AlertDescription>
            </Alert>
          )}
          <Box bg="brand.surface" p={5} borderRadius={5} width={"50%"} m={2}>
            <InputWithLabel
              label="Name"
              value={name}
              onChange={(e) => handleChange("name", e?.target?.value)}
              placeholder="Enter Rule name"
              isRequired
              isInvalid={!name}
              error="This is required"
            />
            <InputWithLabel
              label="Description"
              value={description}
              onChange={(e) => handleChange("description", e?.target?.value)}
              placeholder="Enter Rule Description"
              isRequired
              isInvalid={!description}
              error="This is required"
            />
          </Box>
          <Box bg="brand.surface" p={5} borderRadius={5} width={"50%"}>
            <Stack>
              <RadioGroup
                onChange={(val) => handleChange("method", val)}
                value={method}
              >
                <Flex gap={5} justifyContent="center" flexWrap="wrap">
                  {REQUEST_TYPE.map((requestName) => (
                    <Flex gap={2} key={requestName}>
                      <Radio value={requestName}>{requestName}</Radio>
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
                  isInvalid={!url}
                  error="This is required"
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
                  isChecked={rule.hasPayload}
                  onChange={(e) => handleChange("hasPayload", e.target.checked)}
                  colorScheme="amber"
                />
              </FormControl>
              {rule.hasPayload && (
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
                  >
                    <Flex>
                      <AddIcon mt={1.5} mr={1} boxSize={3} />
                      <Text>Add Matcher</Text>
                    </Flex>
                  </Link>
                  {rulePayload.length >= 3 && (
                    <Text color={"yellow.400"}>
                      You can add up to 3 matchers only.
                    </Text>
                  )}
                </Box>
              )}
            </Stack>
          </Box>

          <Box bg="brand.surface" p={5} borderRadius={5} width={"50%"}>
            <Text mb="8px">Response </Text>
            <Textarea
              label="Response"
              value={mockResponse}
              onChange={handleMockResponse}
            />
            <Text mb="8px" color={"brand.danger"} size="lg" rows={8}>
              {errors.response}
            </Text>
          </Box>
          <Box bg="brand.surface" width={"50%"} p="5" m="2">
            <Flex justifyContent={"space-between"}>
              <Button colorScheme="steel">Cancel</Button>
              <Button ml={3} onClick={handleSubmit}>
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
