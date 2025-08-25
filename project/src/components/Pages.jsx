import React from 'react'

const Pages = ({ currentPage, totalPages, onPageChange }) => {
  // Generate an array of page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pages flex gap-2 justify-center mt-6 mt-10">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded bg-gray-200 opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
        Prev
        </button>
        {pageNumbers.map((number) => (
        <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded cursor-pointer opacity-80 ${
            currentPage === number ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
        >
            {number}
        </button>
        ))}
        <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded bg-gray-200 opacity-80 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
        Next
        </button>
    </div>
  );
};

export default Pages