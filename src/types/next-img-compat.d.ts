declare namespace React {
  interface ImgHTMLAttributes<T> {
    /** Accept Next StaticImageData during Vite → Next migration */
    src?: string | import("next/image").StaticImageData | Blob | undefined;
  }
}
