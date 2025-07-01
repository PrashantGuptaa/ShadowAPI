// src/theme.js
import { extendTheme } from "@chakra-ui/react";

export const charcoalGoldenTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "#121212", // Charcoal Gray
        color: "#F5F5F5", // Light Text
      },
      html: {
        bg: "#121212", // Ensure html is also dark
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
      danger: "#FF6B6B",
      // heading: "#FFC857", // Headings
    },
    amber: {
      500: "#FFC857", // for use as colorScheme="amber"
      600: "#e6b53c",
    },
    steel: {
      500: "#4A5568", // steel gray
      600: "#2D3748", // darker on hover
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
    Alert: {
      baseStyle: {
        container: {
          borderRadius: "md",
          fontSize: "sm",
        },
      },
      variants: {
        subtle: (props) => {
          const colorMap = {
            info: {
              bg: "#1F1F1F",
              color: "#FFC857", // Golden amber text
            },
            success: {
              bg: "#1F1F1F",
              color: "#8AE99A", // Soft green
            },
            warning: {
              bg: "#2C2C2C",
              color: "#FFD369", // Light amber
            },
            error: {
              bg: "#2C2C2C",
              color: "#FF6B6B", // Coral red
            },
          };
          const colors = colorMap[props.status] || colorMap.info;

          return {
            container: {
              bg: colors.bg,
              color: colors.color,
            },
          };
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      defaultProps: {
        colorScheme: "amber",
      },
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme}.500`,
          color: props.colorScheme === "steel" ? "#FFFFFF" : "#121212",
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
        outline: (props) => ({
          borderColor: `${props.colorScheme}.500`,
          color: `${props.colorScheme}.500`,
          _hover: {
            bg: `${props.colorScheme}.100`,
          },
        }),
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
