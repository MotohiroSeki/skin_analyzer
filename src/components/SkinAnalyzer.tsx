import React, { useRef, useState, useCallback } from "react";
import cameraIcon from "../assets/pictures/photo_camera_front.svg";

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function SkinAnalyzer() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  }, []);

  const resetSelection = useCallback(() => {
    setSelection(null);
    setCroppedPreview(null);
    dragStartRef.current = null;
    setIsSelecting(false);
  }, []);

  const onChangeFile = useCallback(async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    setErr(null);
    setLoading(true);
    setPreview(null);
    resetSelection();

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const dataUrl = String(e.target?.result || "");
        if (!dataUrl) throw new Error("IMAGE_LOAD_FAILED");
        setPreview(dataUrl);
        resetSelection();
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
  }, [resetSelection]);

  const getRelativePosition = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const overlay = overlayRef.current;
      if (!overlay) return null;
      const rect = overlay.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const x = clamp(event.pageX - (rect.left + window.scrollX), 0, rect.width);
      const y = clamp(event.pageY - (rect.top + window.scrollY), 0, rect.height);
      return { x, y, rect };
    },
    [clamp]
  );

  const computeSelection = useCallback((start: { x: number; y: number }, current: { x: number; y: number }) => {
    const x = Math.min(start.x, current.x);
    const y = Math.min(start.y, current.y);
    const width = Math.abs(current.x - start.x);
    const height = Math.abs(current.y - start.y);
    return { x, y, width, height };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!preview) return;
      const pos = getRelativePosition(event);
      if (!pos) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStartRef.current = { x: pos.x, y: pos.y };
      setIsSelecting(true);
      setCroppedPreview(null);
      setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 });
    },
    [getRelativePosition, preview]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSelecting) return;
      const start = dragStartRef.current;
      if (!start) return;
      const pos = getRelativePosition(event);
      if (!pos) return;
      event.preventDefault();
      setSelection(computeSelection(start, { x: pos.x, y: pos.y }));
    },
    [computeSelection, getRelativePosition, isSelecting]
  );

  const createCroppedPreview = useCallback(
    (finalRect: SelectionRect, bounds: { width: number; height: number }) => {
      const img = imageRef.current;
      if (!img) return;
      if (!finalRect.width || !finalRect.height) {
        setCroppedPreview(null);
        return;
      }
      const scaleX = img.naturalWidth / bounds.width;
      const scaleY = img.naturalHeight / bounds.height;
      const sourceX = Math.round(finalRect.x * scaleX);
      const sourceY = Math.round(finalRect.y * scaleY);
      const sourceWidth = Math.round(finalRect.width * scaleX);
      const sourceHeight = Math.round(finalRect.height * scaleY);
      if (!sourceWidth || !sourceHeight) {
        setCroppedPreview(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      const dataUrl = canvas.toDataURL("image/png");
      setCroppedPreview(dataUrl);
    },
    []
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isSelecting) return;
      const start = dragStartRef.current;
      const overlay = overlayRef.current;
      if (!start || !overlay) {
        setIsSelecting(false);
        dragStartRef.current = null;
        return;
      }
      const pos = getRelativePosition(event);
      const rect = overlay.getBoundingClientRect();
      const currentPoint = pos ? { x: pos.x, y: pos.y } : { x: start.x, y: start.y };
      const finalRect = computeSelection(start, currentPoint);
      setSelection(finalRect);
      setIsSelecting(false);
      dragStartRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      if (finalRect.width < 2 || finalRect.height < 2) {
        setCroppedPreview(null);
        return;
      }
      createCroppedPreview(finalRect, { width: rect.width, height: rect.height });
    },
    [computeSelection, createCroppedPreview, getRelativePosition, isSelecting]
  );

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <button
        onClick={() => inputRef.current?.click()}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          cursor: "pointer",
        }}
        aria-label="カメラ / 画像を選択"
      >
        <img src={cameraIcon} alt="カメラアイコン" style={{ width: 32, height: 32 }} />
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
      {preview && (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 512 }}>
            <img
              ref={imageRef}
              src={preview}
              alt="face"
              style={{ width: "100%", borderRadius: 12, display: "block" }}
            />
            <div
              ref={overlayRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
              style={{
                position: "absolute",
                inset: 0,
                cursor: "crosshair",
                borderRadius: 12,
                touchAction: "none",
                userSelect: "none",
              }}
            >
              {selection && (
                <div
                  style={{
                    position: "absolute",
                    left: selection.x,
                    top: selection.y,
                    width: selection.width,
                    height: selection.height,
                    border: "2px solid #2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.2)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#4b5563" }}>ドラッグして切り出す範囲を選択してください。</div>
          {croppedPreview && (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>切り出し結果</div>
              <img
                src={croppedPreview}
                alt="cropped"
                style={{
                  width: "100%",
                  maxWidth: 256,
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                }}
              />
            </div>
          )}
        </div>
      )}
      {err && <div style={{ color: "#c33" }}>{err}</div>}
    </div>
  );
}
