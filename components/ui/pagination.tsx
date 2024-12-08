// /components/ui/pagination.tsx

"use client";

import React from "react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Generate an array of page numbers
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  // Define a range to display page numbers (e.g., show 5 pages around the current page)
  const getPageRange = () => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    if (currentPage - delta > 2) {
      range.unshift(-1); // -1 represents ellipsis (...)
    }
    if (currentPage + delta < totalPages - 1) {
      range.push(-1); // -1 represents ellipsis (...)
    }
    return range;
  };

  const pageRange = getPageRange();

  return (
    <div className="flex items-center space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      {/* First Page */}
      <Button
        variant={currentPage === 1 ? "default" : "outline"}
        onClick={() => onPageChange(1)}
      >
        1
      </Button>

      {/* Ellipsis if needed */}
      {pageRange[0] === -1 && (
        <span className="px-2">...</span>
      )}

      {/* Middle Pages */}
      {pageRange.map((page, index) =>
        page === -1 ? (
          <span key={index} className="px-2">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      {/* Last Page */}
      {totalPages > 1 && (
        <Button
          variant={currentPage === totalPages ? "default" : "outline"}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      )}

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
