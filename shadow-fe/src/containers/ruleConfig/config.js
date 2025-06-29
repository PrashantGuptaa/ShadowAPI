export const REQUEST_TYPE = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const PARTIAL_MATCH_VAL = "PARTIAL_MATCH";
export const EXACT_MATCH_VAL = "EXACT_MATCH";
export const EXACT_MATCH_LABEL = "Exact";
export const PARTIAL_MATCH_LABEL = "Partial";

export const MATCH_OPTIONS = [
  {
    label: PARTIAL_MATCH_LABEL,
    value: PARTIAL_MATCH_VAL,
  },
  {
    label: EXACT_MATCH_LABEL,
    value: EXACT_MATCH_VAL,
  },
];

export const EQUALS_PAYLOAD_MATCH = "Equals";
export const NOT_EQUALS_PAYLOAD_MATCH = "Not Equals";
export const CONTAINS_PAYLOAD_MATCH = "Contains";

export const PAYLOAD_CONFIG = [
  EQUALS_PAYLOAD_MATCH,
  NOT_EQUALS_PAYLOAD_MATCH,
  CONTAINS_PAYLOAD_MATCH,
].map((val) => ({
  label: val,
  value: val,
}));

export const RULE_PAYLOAD = {
  key: "",
  value: "",
  matcher: EQUALS_PAYLOAD_MATCH,
};
