import {
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import  { useState } from "react";
const InputWithLabel = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  helperText,
  error,
  isInvalid,
  isRequired = false,
  onBlur,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const showError = touched && isInvalid;

  return (
    <FormControl isInvalid={showError} isRequired={isRequired} mb={4}>
      {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e); // call external onBlur if passed
        }}
        {...props}
      />
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
      {showError && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputWithLabel;
