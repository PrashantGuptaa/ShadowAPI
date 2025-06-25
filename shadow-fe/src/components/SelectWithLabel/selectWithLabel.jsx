import React from "react";
import {
  FormControl,
  FormLabel,
  Select,
  FormErrorMessage,
} from "@chakra-ui/react";

const SelectWithLabel = ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  error,
  touched,
  name,
  isRequired = false,
}) => {
  return (
    <FormControl isInvalid={touched && error} isRequired={isRequired}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Select
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#1F1F1F", color: "#F5F5F5" }}>
            {opt.label}
          </option>
        ))}
      </Select>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default SelectWithLabel;
