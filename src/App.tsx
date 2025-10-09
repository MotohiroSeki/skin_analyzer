import { createElement, useMemo } from "react";
import { createPortal } from "react-dom";
import SkinAnalyzer from "./components/SkinAnalyzer.tsx";
import headTemplate from "../index.html?raw";

export default function App() {
  return (
    <>
      <HeadTags />
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 16px",
        }}
      >
        <h1 style={{ margin: 0, marginBottom: 60, textAlign: "center" }}>
          Skin Analyzer
        </h1>
        <SkinAnalyzer />
      </main>
    </>
  );
}

type HeadTagDefinition = {
  tagName: string;
  attributes: Array<readonly [string, string]>;
  textContent: string;
};

const SUPPORTED_HEAD_TAGS = new Set(["meta", "link", "title"]);

function useHeadTagDefinitions(): HeadTagDefinition[] {
  return useMemo(() => {
    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
      return [];
    }

    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(headTemplate, "text/html");
    const head = parsedDocument.head;

    if (!head) {
      return [];
    }

    return Array.from(head.children).reduce<HeadTagDefinition[]>(
      (definitions, node) => {
        const tagName = node.tagName.toLowerCase();

        if (!SUPPORTED_HEAD_TAGS.has(tagName)) {
          return definitions;
        }

        const attributes = Array.from(node.attributes).map((attribute) =>
          [attribute.name, attribute.value] as const,
        );

        definitions.push({
          tagName,
          attributes,
          textContent: node.textContent ?? "",
        });

        return definitions;
      },
      [],
    );
  }, []);
}

function HeadTags() {
  const headTagDefinitions = useHeadTagDefinitions();

  if (typeof document === "undefined" || headTagDefinitions.length === 0) {
    return null;
  }

  return createPortal(
    headTagDefinitions.map(({ tagName, attributes, textContent }, index) => {
      const props = attributes.reduce<Record<string, string>>(
        (accumulator, [name, value]) => {
          accumulator[name] = value;
          return accumulator;
        },
        {},
      );

      return createElement(
        tagName,
        {
          ...props,
          key: `${tagName}-${index}`,
        },
        textContent.trim().length > 0 ? textContent : undefined,
      );
    }),
    document.head,
  );
}
