import SkinAnalyzer from "./components/SkinAnalyzer.tsx";

export default function App() {
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
