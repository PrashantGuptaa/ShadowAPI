import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { PAYLOAD_CONFIG } from "../../containers/ruleConfig/config";
import InputWithLabel from "../InputWithLabel/inputWithLabel";
import SelectWithLabel from "../SelectWithLabel";
// import { PAYLOAD_CONFIG } from "./config";

const RulePayload = ({
  handlePayloadUpdate,
  handleRemove,
  id,
  payload,
}) => {
  const { key = "", value = "", matcher } = payload || {};
  return (
    <Box>
      <Flex gap="5" justifyContent={"center"}>
        <InputWithLabel
          label="Key"
          placeholder="Enter payload key"
          value={key}
          onChange={(e) => handlePayloadUpdate(id, "key", e?.target?.value)}
          isRequired
          isInvalid={!key}
          error="This is required"
        />
        <SelectWithLabel
          label="Match"
          options={PAYLOAD_CONFIG}
          value={matcher}
          onChange={(e) => handlePayloadUpdate(id, "matcher", e?.target?.value)}
        />
        <InputWithLabel
          label="Value"
          placeholder="Enter Value"
          onChange={(e) => handlePayloadUpdate(id, "value", e?.target?.value)}
          value={value}
          isRequired
          isInvalid={!value}
          error="This is required"
        />
        <Link
          mt={10}
          onClick={() => handleRemove(id)}
          color="brand.danger"
          // pointerEvents={rule.payload.length >= 3 ? "none" : "auto"}
          fontWeight="medium"
        >
          Remove
        </Link>
      </Flex>
    </Box>
  );
};

export default RulePayload;
