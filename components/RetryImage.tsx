"use client";

import Image, { ImageProps } from "next/image";
import { handleImageRetry } from "@/lib/imageRetry";

// Wrapper client-side pro next/image com retry automático em erro — existe
// só porque handlers de evento (onError) não podem ser passados direto para
// um Client Component (o <Image>) a partir de um Server Component como o
// GalleryPreview.
export default function RetryImage(props: ImageProps) {
  return <Image {...props} onError={handleImageRetry} />;
}
