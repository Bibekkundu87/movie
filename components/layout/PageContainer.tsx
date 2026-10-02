import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "min-h-screen bg-[#101014] text-white selection:bg-[#EF3B4F] selection:text-white pb-20",
        fullWidth ? "w-full" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </main>
  );
}
