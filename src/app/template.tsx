"use client";

import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  // L'effet de fondu a été retiré, la page se charge instantanément sous la transition
  return <>{children}</>;
}
