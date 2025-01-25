'use client'

import {useState} from "react";

const BlockWrapper = ({ children, onAddBlock }) => {
	const [showAddBlock, setShowAddBlock] = useState(false);

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
