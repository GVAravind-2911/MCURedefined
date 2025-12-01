"use client";

import { memo } from "react";
import type React from "react";
import "@/styles/LoadingSpinner.css";

const LoadingSpinner: React.FC = () => {
	return (
		<div className="loading-overlay">
			<div className="marvel-spinner">
				{/* Perfect Captain America Shield */}
				<div className="cap-shield">
					<div className="shield-ring outer-ring" />
					<div className="shield-ring middle-ring" />
					<div className="shield-ring inner-ring" />
					<div className="shield-center">
						<div className="star" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default memo(LoadingSpinner);
