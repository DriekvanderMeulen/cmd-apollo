import Image, { type ImageProps } from "next/image";

import { env } from "@/env";

function R2Image(props: ImageProps) {
  const src = (process.env.NEXT_PUBLIC_CDN_URL as string) + props.src;

  return <Image {...props} src={src} />;
}

export default R2Image;
