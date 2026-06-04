import type { PropsWithChildren, ReactNode } from "react";

export const TableHeader = ({ children }: PropsWithChildren) => (
  <thead className="text-xs text-[#475569] uppercase tracking-wide bg-[#F8FAFC] border-b border-[#E5E7EB]">
    {children}
  </thead>
);

export const TableHeaderCell = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <th
    scope="col"
    className={`px-6 py-3 font-semibold whitespace-nowrap text-left text-[#475569] ${className}`}
  >
    {children}
  </th>
);

export const TableBody = ({ children }: PropsWithChildren) => (
  <tbody className="whitespace-nowrap text-[#001F54]">{children}</tbody>
);

export const TableRow = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <tr
    className={`border-b border-[#F3F4F6] last:border-none font-medium hover:bg-[#F8FAFC] transition-colors ${className}`}
  >
    {children}
  </tr>
);

export const TableCell = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => (
  <td className={`px-6 py-4 ${className}`}>{children}</td>
);

export const EmptyValue = ({ children = "—" }: { children?: ReactNode }) => (
  <span className="text-[#94A3B8] text-xs">{children}</span>
);
