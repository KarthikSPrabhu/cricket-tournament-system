import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({ 
  columns, 
  data, 
  emptyMessage = "No data found",
  onSort,
  sortBy,
  sortOrder,
  loading = false
}) => {
  const handleSort = (column) => {
    if (onSort && column.sortable !== false) {
      onSort(column.accessor);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable !== false && (
                    <span className="ml-2">
                      {sortBy === column.accessor ? (
                        sortOrder === 'asc' ? (
                          <FaSortUp className="text-gray-400" />
                        ) : (
                          <FaSortDown className="text-gray-400" />
                        )
                      ) : (
                        <FaSort className="text-gray-300" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {typeof column.cell === 'function' 
                    ? column.cell(row) 
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;