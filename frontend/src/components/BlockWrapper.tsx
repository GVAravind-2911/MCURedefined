'use client'

import type React from "react";
import { useState } from "react";

interface BlockWrapperProps {
  children: React.ReactNode;
  onAddBlock: (type: "text" | "image" | "embed") => void;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({ children, onAddBlock }) => {
  const [showAddBlock, setShowAddBlock] = useState<boolean>(false);

  return (
    <div className="block-wrapper">
      {children}
      <div
        className="add-block-hover"
        onMouseEnter={() => setShowAddBlock(true)}
        onMouseLeave={() => setShowAddBlock(false)}
      >
        {showAddBlock && (
          <div className="add-block-menu">
            <button type="button" onClick={() => onAddBlock("text")}>
              Add Text
            </button>
            <button type="button" onClick={() => onAddBlock("image")}>
              Add Image
            </button>
            <button type="button" onClick={() => onAddBlock("embed")}>
              Embed Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockWrapper;