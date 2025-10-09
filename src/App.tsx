import { useEffect } from "react";
import SkinAnalyzer from "./components/SkinAnalyzer.tsx";
import headTemplate from "../index.html?raw";

export default function App() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(
      headTemplate,
      "text/html",
    );
    const fragmentHead = documentFragment.head;

    if (!fragmentHead) {
      return undefined;
    }
    const appendedElements: Element[] = [];

    fragmentHead
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
  }, [headTemplate]);

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
