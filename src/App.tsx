import { useEffect } from "react";
import SkinAnalyzer from "./components/SkinAnalyzer.tsx";
import headTemplate from "../index.html?raw";

const parser = new DOMParser();

function useHeadTags(html: string) {
  useEffect(() => {
    const documentFragment = parser.parseFromString(html, "text/html");
    const appendedElements: Element[] = [];

    documentFragment.head
      .querySelectorAll("meta, link, title")
      .forEach((node) => {
        const clonedNode = node.cloneNode(true) as Element;
        const hasSameNode = Array.from(document.head.children).some(
          (headChild) => headChild.outerHTML === clonedNode.outerHTML,
        );

        if (!hasSameNode) {
          document.head.appendChild(clonedNode);
          appendedElements.push(clonedNode);
        }
      });

    return () => {
      appendedElements.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
    };
  }, [html]);
}

export default function App() {
  useHeadTags(headTemplate);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 16px",
      }}
    >
      <h1 style={{ margin: 0, marginBottom: 60, textAlign: "center" }}>Skin Analyzer</h1>
      <SkinAnalyzer />
    </main>
  );
}
