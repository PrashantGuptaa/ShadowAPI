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
import { SAVE_RULE_ENDPOINT } from "../../utils/apiEndpoints";

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

  const handleSubmit = async () => {
    // if (!rule.url || !mockResponse || errors.length) {
    //   return;
    // }
    // // validate payload
    // const isValidPayload = rulePayload.every((payload) => {
    //   return payload.key && payload.value;
    // });
    // if (!isValidPayload) {
    //   return;
    // }
    const ruleData = {
      ...rule,
      payload: rulePayload,
      response: mockResponse,
    };

    // save
    const result = await apiRequestUtils.post(SAVE_RULE_ENDPOINT, ruleData);
    console.log("REsult", result)
  };

  const { url, match, method, name, description } = rule;
  console.log("F-1", rule);

  return (
    <Flex alignItems="center" flexDirection="column">
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
        <Text mb="8px" color={"brand.danger"} size="lg" rows={8}>
          {errors.response}
        </Text>
      </Box>
      <Box bg="brand.surface" width={"50%"} p="5" m="2">
        <Flex justifyContent={"space-between"}>
          <Button colorScheme="steel">Cancel</Button>
          <Button ml={3} onClick={handleSubmit}>
            Submit
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default RuleConfig;
