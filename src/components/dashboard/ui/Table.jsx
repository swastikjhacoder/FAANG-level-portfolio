"use client";

import clsx from "clsx";

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={clsx(
          "w-full text-sm border border-gray-700 rounded-lg overflow-hidden table-fixed",
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="bg-gray-800 text-gray-300">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody className="bg-gray-900">{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={clsx(
        "border-t border-gray-700 hover:bg-gray-800 transition",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return <td className={clsx("p-3 border-gray-700", className)}>{children}</td>;
}

export function TableHeaderCell({ children, className = "" }) {
  return (
    <th
      className={clsx("p-3 text-left font-medium border-gray-700", className)}
    >
      {children}
    </th>
  );
}

export function TableEmpty({ colSpan = 1, text = "No data found" }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center p-6 text-gray-400">
        {text}
      </td>
    </tr>
  );
}
