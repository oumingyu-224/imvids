/**
 * JSON-LD 结构化数据注入：直接输出 script 标签，
 * 数据必须在服务端生成，保证爬虫可见
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
