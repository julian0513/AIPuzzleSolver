// components/Board.jsx
import React, { memo } from "react";

const Tile = memo(function Tile({ val, img, row, col, onClick, index }) {
  const isBlank = val === 0;
  return (
    <div
      role="gridcell"
      aria-rowindex={row + 1}
      aria-colindex={col + 1}
      aria-label={isBlank ? "Blank" : `Tile ${val}`}
      className={`relative rounded-[12px] overflow-hidden grid place-items-center transition
        ${
          isBlank
            ? "bg-gray-100 shadow-even" // subtle pop-out, no dashed border
            : "bg-gray-200 hover:-translate-y-0.5 hover:scale-[1.02] shadow-even cursor-pointer"
        }`}
      onClick={isBlank ? undefined : onClick}
      data-value={val}
      data-index={index}
    >
      {!isBlank &&
        (img ? (
          <img
            alt={`Tile ${val}`}
            src={img}
            className="w-full h-full object-cover block"
            draggable={false}
          />
        ) : (
          <span className="text-2xl font-semibold text-black/80 select-none">{val}</span>
        ))}
    </div>
  );
});

export default function Board({ board, tileImages = [], onTileClick }) {
  return (
    <div
      role="grid"
      aria-label="Puzzle board"
      aria-rowcount={3}
      aria-colcount={3}
      className="board-hover grid grid-cols-3 gap-2 w-full aspect-square bg-black/20 p-2 rounded-grid shadow-soft outline outline-0 outline-white/5"
    >
      {board.map((val, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const img = val !== 0 ? tileImages[val] : null;
        return (
          <Tile
            key={i}
            index={i}
            val={val}
            img={img}
            row={row}
            col={col}
            onClick={() => onTileClick?.(i, val)}
          />
        );
      })}
    </div>
  );
}
