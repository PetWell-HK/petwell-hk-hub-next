import { jsonLdScript } from "@/lib/seo";

type JsonLdProps = {
  id?: string;
  data: object | object[];
};

/** Server-safe JSON-LD injector for App Router pages. */
export default function JsonLd({ id = "seo-structured-data", data }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }}
    />
  );
}
