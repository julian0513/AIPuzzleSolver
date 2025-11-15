import { useRef } from "react";
import { GOAL } from "../utils/constants.jsx";

export default function ImageUpload({ setTileImages, setBoard, resetTimer, onShuffle }) {
  const fileRef = useRef(null);
  const choose = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        sliceToNine(img);
      } finally {
        URL.revokeObjectURL(url);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (fileRef.current) fileRef.current.value = "";
    };
    img.src = url;
  };

  const sliceToNine = (img) => {
    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;

    const tile = 320;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = tile;
    canvas.height = tile;
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    const arr = Array(9).fill(null);
    let id = 1;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 2 && c === 2) { arr[0] = null; continue; }
        ctx.clearRect(0, 0, tile, tile);
        ctx.drawImage(
          img,
          sx + c * (size / 3),
          sy + r * (size / 3),
          size / 3,
          size / 3,
          0, 0, tile, tile
        );
        arr[id] = canvas.toDataURL("image/jpeg", 0.9);
        id++;
      }
    }

    setTileImages(arr);
    setBoard([...GOAL]);
    resetTimer();
  };

  return (
    <div className="upload-relocate absolute upload-offset flex flex-col items-end gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onFile}
      />

      {/* Upload */}
      <button
        type="button"
        className="px-4 h-[clamp(38px,6vmin,54px)] rounded-btn bg-white text-text shadow-top-right
                   hover:-translate-y-0.5 hover:scale-[1.02] transition font-sans font-medium tracking-tight border-0"
        onClick={choose}
        aria-label="Upload image"
      >
        Upload Image
      </button>

      {/* Shuffle directly under Upload */}
      <button
        type="button"
        className="px-5 h-[clamp(36px,5.5vmin,48px)] rounded-btn bg-white text-text shadow-top-right
                   hover:-translate-y-0.5 hover:scale-[1.02] transition font-sans font-medium tracking-tight border-0"
        onClick={onShuffle}
        aria-label="Shuffle puzzle"
      >
        Shuffle
      </button>
    </div>
  );
}
