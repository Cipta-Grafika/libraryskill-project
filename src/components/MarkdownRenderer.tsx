/* eslint-disable @next/next/no-img-element */
import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

// Function to convert CSS string to React style object
function parseStyle(styleString: string | undefined): React.CSSProperties {
  if (!styleString) return {};
  const style: React.CSSProperties = {};
  
  styleString.split(';').forEach(rule => {
    const [property, value] = rule.split(':');
    if (property && value) {
      // Convert property name from kebab-case to camelCase
      const camelProperty = property.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
      (style as Record<string, string>)[camelProperty] = value.trim();
    }
  });
  
  return style;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    img: ({ node, ...props }) => {
      // React Markdown passes raw attributes in node.properties if using rehype-raw
      const wrapperStyleStr = node?.properties?.wrapperstyle as string | undefined;
      const containerStyleStr = node?.properties?.containerstyle as string | undefined;
      const rawStyleStr = node?.properties?.style as string | undefined;

      const imgStyle = {
        ...parseStyle(rawStyleStr),
        ...parseStyle(containerStyleStr),
      };

      const imgProps = {
        ...props,
        style: imgStyle,
      };

      if (wrapperStyleStr) {
        return (
          <div style={parseStyle(wrapperStyleStr)}>
            <img alt={props.alt || ""} {...imgProps} />
          </div>
        );
      }

      return <img alt={props.alt || ""} {...imgProps} />;
    }
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
