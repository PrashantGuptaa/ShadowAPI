// Pagination.jsx
import { Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
      console.log("F-1", currentPage, totalPages)
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <HStack spacing={2} justify="center" mt={4}>
      <IconButton
        icon={<ChevronLeftIcon />}
        aria-label="Previous Page"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        size="sm"
      />
      {getPageNumbers().map((page, idx) =>
        page === "..." ? (
          <Text key={idx} px={2}>
            ...
          </Text>
        ) : (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "solid" : "outline"}
            colorScheme="brand"
            onClick={() => onPageChange(page)}
          >
            <Text color="brand.text">{page}</Text>
          </Button>
        )
      )}
      <IconButton
        icon={<ChevronRightIcon />}
        aria-label="Next Page"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        size="sm"
      />
    </HStack>
  );
};

export default Pagination;
