"use client";

import React from "react";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-1 duration-200 w-full h-full">
      {children}
    </div>
  );
}
