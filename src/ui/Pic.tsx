import Image from "next/image";
import type { ImageProps } from "next/image";
import type { CSSProperties } from "react";

type Props = {
  src: ImageProps["src"];
  alt: string;
  objectFit?: CSSProperties["objectFit"];
  quality?: number;
  className?: string;
  noTransition?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function Pic({
  src,
  alt,
  objectFit = "contain",
  quality,
  className = "",
  noTransition = false,
  priority = false,
  sizes,
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      placeholder="blur"
      blurDataURL="/global/placeholder.png"
      fill
      priority={priority}
      {...(quality ? { quality } : {})}
      {...(sizes ? { sizes } : {})}
      style={{ objectFit }}
      className={`${
        noTransition ? "" : "transition duration-500 ease-in-out "
      } ${className}`}
    />
  );
}
