// src/theme.js
import { extendTheme } from "@chakra-ui/react";

export const charcoalGoldenTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#121212", // Charcoal Gray
        color: "#F5F5F5", // Light Text
      },
    },
  },
  colors: {
    brand: {
      bg: "#121212", // Background
      surface: "#1F1F1F", // Box backgrounds
      primary: "#FFC857", // Golden Amber
      hover: "#2C2C2C", // Hover states
      text: "#F5F5F5", // Text
      // heading: "#FFC857", // Headings
    },
  },

  components: {
    Heading: {
      baseStyle: {
        color: "#FFC857", // or use "brand.text" if you define it in semantic tokens
        fontWeight: "semibold",
      },
      sizes: {
        xl: {
          fontSize: "4xl",
        },
        lg: {
          fontSize: "3xl",
        },
        md: {
          fontSize: "2xl",
        },
        sm: {
          fontSize: "xl",
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: {
          bg: "#FFC857",
          color: "#121212",
          _hover: {
            bg: "#e6b53c",
          },
        },
        outline: {
          borderColor: "#FFC857",
          color: "#FFC857",
          _hover: {
            bg: "#2C2C2C",
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: "#FFC857",
        _hover: {
          color: "#e6b53c",
          textDecoration: "underline",
        },
      },
    },
  },
});

