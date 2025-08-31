import React from "react";

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="@container/main flex-1 space-y-6 py-4 px-4 lg:px-6 md:py-6">
      {children}
    </div>
  );
}
