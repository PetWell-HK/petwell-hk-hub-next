import type { StaticImageData } from "next/image";

declare module "*.png" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.jpg" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.jpeg" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.webp" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.gif" {
  const src: string | StaticImageData;
  export default src;
}
declare module "*.svg" {
  const src: string | StaticImageData;
  export default src;
}

declare namespace React {
  interface ImgHTMLAttributes<T> {
    /** Accept Next StaticImageData during Vite → Next migration */
    src?: string | StaticImageData | Blob | undefined;
  }
}
