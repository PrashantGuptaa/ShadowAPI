// src/theme.js
import { extendTheme } from "@chakra-ui/react";

export const charcoalGoldenTheme = extendTheme({
  styles: {
    global: {
      body: {
        minHeight: "100vh",
        bg: "#121212", // Charcoal Gray
        color: "#F5F5F5", // Light Text
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "block",
      },
      html: {
        height: "100%",
        bg: "#121212", // Ensure html is also dark
        color: "#F5F5F5", // Light Text
      },
      "#root": {
        bg: "#121212", // Charcoal Gray
        color: "#F5F5F5", // Light Text
        height: "100%",
      },
    },
  },
  colors: {
    brand: {
      bg: "#121212", // Background
      surface: "#1F1F1F", // Box backgrounds
      topSurface: "#2C2C2C", // Top surface for headers, footers
      primary: "#FFC857", // Golden Amber
      accent: "#FFC857", // Accent color (same as primary)
      hover: "#2C2C2C", // Hover states
      text: "#F5F5F5", // Text
      textSecondary: "#B0B0B0", // Secondary/muted text
      mutedText: "#B0B0B0", // Muted text
      inputBg: "#2C2C2C", // Input background
      inputFocus: "#1F1F1F", // Input focus background
      border: "#444444", // Border color
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
          color: props.color
            ? props.color
            : props.colorScheme === "steel"
            ? "#FFFFFF"
            : "#121212",
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
    Menu: {
      baseStyle: {
        list: {
          bg: "brand.surface",
          color: "brand.text",
          border: "none",
        },
        item: {
          bg: "brand.surface",
          color: "brand.text",
          _hover: {
            bg: "brand.hover",
          },
          _focus: {
            bg: "brand.hover",
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: "md",
        fontWeight: "bold",
      },
      variants: {
        // follow amber color scheme is colorScheme="amber"
        subtle: (props) => {
          const colorMap = {
            amber: {
              bg: "#826b39bf", // light golder background
              color: "#FFC857", // Golden amber text
            },
            blue: {
              bg: "#2C2C2C", // Darker background
              color: "#63B3ED", // Light blue text
            },
            green: {
              bg: "#2C2C2C", // Darker background
              color: "#68D391", // Light green text
            },
            red: {
              bg: "#2C2C2C", // Darker background
              color: "#FC8181", // Light red text
            },
            white: {
              bg: "#2C2C2C", // Darker background
              color: "#F5F5F5", // Light text
            },
          };
          const colors = colorMap[props.colorScheme] || colorMap.amber;
          return {
            bg: colors.bg,
            color: colors.color,
            _hover: {
              bg: "#2C2C2C", // Darker on hover
              color: colors.color,
            },
          };
        },
        secondary: {
          bg: "#4A5568", // Steel gray
          color: "#F5F5F5", // Light text
        },
      },
    },
    Table: {
      variants: {
        simple: {
          tbody: {
            tr: {
              borderBottom: "1px solid",
              borderColor: "gray.700",
            },
          },
        },
      },
    },
  },
});
