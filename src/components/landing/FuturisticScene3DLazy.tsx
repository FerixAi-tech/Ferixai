"use client";

import dynamic from "next/dynamic";

const FuturisticScene3DLazy = dynamic(
  () => import("@/components/landing/FuturisticScene3D"),
  { ssr: false, loading: () => null },
);

export default FuturisticScene3DLazy;
