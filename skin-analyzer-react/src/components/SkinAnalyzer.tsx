import React, { useRef, useState, useCallback } from "react";

export default function SkinAnalyzer() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onChangeFile = useCallback(async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    setErr(null);
    setLoading(true);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const dataUrl = String(e.target?.result || "");
        if (!dataUrl) throw new Error("IMAGE_LOAD_FAILED");
        setPreview(dataUrl);
      } catch (error) {
        console.warn("Image preview failed:", error);
        const message = error instanceof Error ? error.message : String(error);
        setErr(message);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.warn("Image preview failed:", error);
      setErr("画像の読み込みに失敗しました");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <button onClick={() => inputRef.current?.click()} style={{ padding: "12px 16px", borderRadius: 12 }}>
        カメラ / 画像を選択
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        onChange={onChangeFile}
        style={{ display: "none" }}
      />
      {loading && <div>解析中…</div>}
      {preview && <img src={preview} alt="face" style={{ width: "100%", maxWidth: 512, borderRadius: 12 }} />}
      {err && <div style={{ color: "#c33" }}>{err}</div>}
    </div>
  );
}
