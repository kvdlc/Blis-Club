"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, Move } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  imageUrl: string;
  circleSize?: number;
  mode?: "circle" | "square";
  cornerRadius?: number;
}

export function ImageEditor({ open, onClose, onSave, imageUrl, circleSize = 200, mode = "circle", cornerRadius = 24 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Reset transforms
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
      // Auto-fit: calculate initial zoom so image covers the canvas
      const canvasSize = (circleSize || 200) * 2;
      const scaleX = canvasSize / img.width;
      const scaleY = canvasSize / img.height;
      const initialZoom = Math.max(scaleX, scaleY);
      setZoom(initialZoom);
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgRef.current) return;
    renderPreview();
  }, [rotation, zoom, offsetX, offsetY, imgLoaded]);

  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const size = circleSize * 2; // High res
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);

    ctx.save();

    if (mode === "square") {
      // Rounded rectangle clip
      const r = cornerRadius * 2; // scale for high-res canvas
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.clip();
    } else {
      // Circle clip (default)
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Calculate image dimensions
    const imgW = img.width * zoom;
    const imgH = img.height * zoom;
    const cx = size / 2 + offsetX * 2;
    const cy = size / 2 + offsetY * 2;

    // Apply rotation
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    ctx.drawImage(img, cx - imgW / 2, cy - imgH / 2, imgW, imgH);
    ctx.restore();

    // Border
    if (mode === "square") {
      const r = cornerRadius * 2;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [rotation, zoom, offsetX, offsetY, circleSize, mode, cornerRadius]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onSave(dataUrl);
    onClose();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !e.touches[0]) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 rounded-[2rem] p-6 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Editar Foto</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center">
          <div className="relative" style={{ width: circleSize, height: circleSize }}>
            <canvas
              ref={canvasRef}
              style={{ width: circleSize, height: circleSize }}
              className={mode === "square" ? "rounded-2xl" : "rounded-full"}
            />
            {/* Drag overlay */}
            <div
              className={`absolute inset-0 cursor-grab active:cursor-grabbing ${mode === "square" ? "rounded-2xl" : "rounded-full"}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={(e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.02 : 0.02;
                setZoom((z) => Math.max(0.3, Math.min(3, z + delta)));
              }}
              onTouchStart={(e) => {
                if (e.touches[0]) {
                  setDragging(true);
                  setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
                }
              }}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setDragging(false)}
            >
              <div className={`absolute top-2 right-2 bg-white/20 backdrop-blur-sm p-1.5 ${mode === "square" ? "rounded-lg" : "rounded-full"}`}>
                <Move className="w-4 h-4 text-white/70" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400">
          Arrastra para posicionar · Gira y haz zoom
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-white" />
          </button>

          {/* Zoom out */}
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.05))}
            className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>

          {/* Zoom indicator */}
          <span className="text-sm font-bold text-white min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom in */}
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.05))}
            className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>

          {/* Rotate right */}
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors active:scale-95"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          Guardar Foto
        </button>
      </div>
    </div>
  );
}
