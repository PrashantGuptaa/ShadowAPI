import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { PAYLOAD_CONFIG } from "../../containers/ruleConfig/config";
import InputWithLabel from "../InputWithLabel/inputWithLabel";
import SelectWithLabel from "../SelectWithLabel";
// import { PAYLOAD_CONFIG } from "./config";

const RulePayload = ({ handlePayload, handleRemove, id }) => {
  return (
    <Box>
      <Flex gap="5" justifyContent={"center"}>
        <InputWithLabel label="Key" placeholder="Enter payload key" />
        <SelectWithLabel label="Type" options={PAYLOAD_CONFIG} />
        <InputWithLabel label="Value" placeholder="Enter Value" />
        <Link
          mt={10}
          onClick={() => handleRemove(id)}
          color="brand.danger"
          // pointerEvents={rule.payload.length >= 3 ? "none" : "auto"}
          fontWeight="medium"
        >
          Remove
          {/* <Flex>
                  <Text>Remove</Text>
                </Flex> */}
        </Link>
      </Flex>
    </Box>
  );
};

export default RulePayload;
