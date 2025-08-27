import React, { useRef, useState, useCallback, useMemo } from "react";
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import failedImg from "../assets/pictures/failed_face_detection.png";

const MP_BASE = "/mediapipe/"; // public配下は / にマウントされる
const MODEL   = `${MP_BASE}face_detection_short_range.task`; // full_range に差し替え可
const DETECT_MAX_SIDE = 640;
const OUTPUT_SIZE     = 512;
const PADDING_SCALE   = 1.4;

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}
function loadImageFromDataURL(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export default function SkinAnalyzer() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const initDetector = useMemo(() => {
    let detectorPromise: Promise<FaceDetector> | null = null;
    return () => {
      if (detectorPromise) return detectorPromise;
      detectorPromise = (async () => {
        const fileset = await FilesetResolver.forVisionTasks(MP_BASE);
        return await FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.5,
        });
      })();
      return detectorPromise;
    };
  }, []);

  const onChangeFile = useCallback(async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;

    setErr(null);
    setLoading(true);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataUrl = String(e.target?.result || "");
        const img = await loadImageFromDataURL(dataUrl);

        // 縮小キャンバス（検出用）
        const scale = Math.min(DETECT_MAX_SIDE / img.width, DETECT_MAX_SIDE / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const detectCanvas = makeCanvas(w, h);
        detectCanvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

        // 顔検出
        const detector = await initDetector();
        const result = await detector.detect(detectCanvas);
        const detections = result?.detections ?? [];
        if (!detections.length) throw new Error("NO_FACE_DETECTED");

        let best = detections[0]!;
        if (!best.boundingBox) throw new Error("NO_BOUNDING_BOX");

        let bestA = best.boundingBox.width * best.boundingBox.height;
        for (let i = 1; i < detections.length; i++) {
        const d = detections[i]!;
        if (!d.boundingBox) continue; // ない場合はスキップ
        const a = d.boundingBox.width * d.boundingBox.height;
        if (a > bestA) { best = d; bestA = a; }
        }

        // ここで non-null 断定できる
        const bb = best.boundingBox!;


        // 元画像座標にスケール & 正方形で余白つきクロップ
        const scaleX = img.width / w, scaleY = img.height / h;
        const cx = (bb.originX + bb.width / 2) * scaleX;
        const cy = (bb.originY + bb.height / 2) * scaleY;
        const base = Math.max(bb.width * scaleX, bb.height * scaleY);
        let size = base * PADDING_SCALE;

        let sx = Math.round(cx - size / 2);
        let sy = Math.round(cy - size / 2);
        let sw = Math.round(size);
        let sh = Math.round(size);

        if (sx < 0) sx = 0;
        if (sy < 0) sy = 0;
        if (sx + sw > img.width)  sw = img.width  - sx;
        if (sy + sh > img.height) sh = img.height - sy;

        const out = makeCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
        out.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        setPreview(out.toDataURL("image/png", 0.95));
      } catch (e: any) {
        console.warn("Face crop failed:", e);
        setPreview(failedImg);
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }, [initDetector]);

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
