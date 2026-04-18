"use client";

import clsx from "clsx";

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={clsx(
          "w-full text-sm rounded-lg overflow-hidden table-fixed",
          "bg-(--glass-bg) border border-(--glass-border) shadow-(--glass-shadow)",
          "text-(--text-color)",
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-white/5 text-(--text-muted)">{children}</thead>
  );
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={clsx(
        "border-t border-(--glass-border) transition",
        "hover:bg-white/5",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td className={clsx("p-3 border-(--glass-border)", className)}>
      {children}
    </td>
  );
}

export function TableHeaderCell({ children, className = "" }) {
  return (
    <th
      className={clsx(
        "p-3 text-left font-medium border-(--glass-border)",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableEmpty({ colSpan = 1, text = "No data found" }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="text-center p-6 text-(--text-muted)"
      >
        {text}
      </td>
    </tr>
  );
}
