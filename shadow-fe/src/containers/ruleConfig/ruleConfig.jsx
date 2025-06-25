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
  Text,
  Input,
  Stack,
  Radio,
  RadioGroup,
  Select,
  FormControl,
  FormLabel,
  Switch,
  Link,
  Textarea,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";
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

const RuleConfig = () => {
  const [rule, setRule] = useState({
    requestType: "GET",
    url: "",
    match: EXACT_MATCH_VAL,
    hasPayload: true,
  });
  const [rulePayload, setRulePayload] = useState([]);
  const [mockResponse, setMockResponse] = useState("");
  const [errors, setErrors] = useState({});
  const counterRef = useRef(1);

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

  return (
    <Flex alignItems="center" flexDirection="column">
      <Box bg="brand.surface" p={5} borderRadius={5} width={"50%"}>
        <Stack>
          <RadioGroup
            onChange={(val) => handleChange("requestType", val)}
            value={rule.requestType}
          >
            <Flex gap={5} justifyContent="center">
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
              placeholder="Enter url"
              value={rule.url}
              onChange={(e) => handleChange("url", e?.target?.value)}
            />
            <SelectWithLabel
              label="Match"
              name="match"
              options={MATCH_OPTIONS}
              value={rule.match}
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
              colorScheme="yellow"
            />
          </FormControl>
          {rule.hasPayload && (
            <Box>
              {rulePayload.map((payload, i) => (
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
        <Text mb="8px" color={"brand.danger"} size='lg' rows={8}>
          {errors.response}
        </Text>
      </Box>
    </Flex>
  );
};

export default RuleConfig;
