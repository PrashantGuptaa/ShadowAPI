// Pagination.jsx
import { Button, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useMemo } from "react";
import PropTypes from "prop-types";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = useMemo(() => {
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
  }, [currentPage, totalPages]);

  return (
    <HStack spacing={2} justify="center" mt={4} aria-label="Pagination">
      <IconButton
        icon={<ChevronLeftIcon />}
        aria-label="Previous Page"
        onClick={() => {
          if (currentPage > 1) onPageChange(currentPage - 1);
        }}
        isDisabled={currentPage === 1}
        size="sm"
      />
      {pageNumbers.map((page, idx) =>
        page === "..." ? (
          <Text key={`ellipsis-${idx}`} px={2}>
            ...
          </Text>
        ) : (
          <Button
            key={`page-${page}`}
            size="sm"
            variant={page === currentPage ? "solid" : "outline"}
            colorScheme="brand"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            <Text color="brand.text">{page}</Text>
          </Button>
        )
      )}
      <IconButton
        icon={<ChevronRightIcon />}
        aria-label="Next Page"
        onClick={() => {
          if (currentPage < totalPages) onPageChange(currentPage + 1);
        }}
        isDisabled={currentPage === totalPages}
        size="sm"
      />
    </HStack>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
