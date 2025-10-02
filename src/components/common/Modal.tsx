import React, { useEffect, useId } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

export default function Modal({ open, onClose, title, children, ariaLabel }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={!title ? ariaLabel : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "min(480px, 100%)",
          padding: 24,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#111827" }}>
            {title}
          </h2>
        )}
        <div style={{ overflow: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
