export type MosaicWidth = "sm" | "md" | "lg";

export type MosaicColumn =
  | {
      layout: "single";
      width: MosaicWidth;
      image: { src: string; index: number };
    }
  | {
      layout: "stack";
      width: MosaicWidth;
      top: { src: string; index: number };
      bottom: { src: string; index: number };
    };

/** Build 2-row mosaic columns: alternating tall singles and stacked pairs. */
export function buildMosaicColumns(images: readonly string[]): MosaicColumn[] {
  const columns: MosaicColumn[] = [];
  let i = 0;
  let col = 0;

  while (i < images.length) {
    const mode = col % 3;

    if (mode === 0) {
      columns.push({
        layout: "single",
        width: col % 6 === 0 ? "lg" : "md",
        image: { src: images[i], index: i },
      });
      i += 1;
    } else if (i + 1 < images.length) {
      columns.push({
        layout: "stack",
        width: mode === 1 ? "md" : "sm",
        top: { src: images[i], index: i },
        bottom: { src: images[i + 1], index: i + 1 },
      });
      i += 2;
    } else {
      columns.push({
        layout: "single",
        width: "sm",
        image: { src: images[i], index: i },
      });
      i += 1;
    }

    col += 1;
  }

  return columns;
}
