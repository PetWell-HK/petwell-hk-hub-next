import "react";
import type { StaticImageData } from "next/image";

declare module "react" {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_IMG_SRC_TYPES {
    /** Next.js static image imports during Vite → Next migration */
    staticImageData: StaticImageData;
  }
}
