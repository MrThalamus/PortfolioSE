"use client";

import dynamic from "next/dynamic";

export const Background3D = dynamic(
  () => import("./Background3DScene").then((m) => m.Background3DScene),
  { ssr: false },
);
