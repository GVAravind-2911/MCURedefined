'use client'

import { useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { EmbedBlockProps } from "@/types/BlockTypes";


const EmbedBlock: React.FC<EmbedBlockProps> = ({ url, onChange, onDelete }) => {
	useEffect(() => {
		if (url) {
			if (url.includes("script async")) {
				const script = document.createElement("script");
				const regex1 = /<script async.*?src="(https:\/\/.*?)"/;
				const match1 = url.match(regex1);
				console.log(match1);
				if (match1) {
					script.src = match1[1];
					script.async = true;
					document.body.appendChild(script);
					return () => {
						document.body.removeChild(script);
					};
				}
			}
			if (url.includes("www.youtube.com")) {
				const regex = /^.*src="(https:\/\/www.youtube.com.+?)"/;
				const match = url.match(regex);
				console.log(match);
				if (match) {
					const embedUrl = `<iframe src="${match[1]}" frameborder="0" allowfullscreen class="video"></iframe>`;
					onChange(embedUrl);
				}
			}
		}
	}, [url]);

	return (
		<div className="content-block embed-block">
			<div className="embed-type block-type">Embed</div>
			<div className="embed-actions block-actions">
				<button type="button" onClick={onDelete} className="delete-button">
					🗑️
				</button>
			</div>
			<div className="embed-area">
				{url.includes("www.youtube.com") && (
					<div
						className="youtube-preview"
						dangerouslySetInnerHTML={{ __html: url }}
					/>
				)}
				{url.includes("www.instagram.com") && (
					<div
						className="instagram-preview"
						dangerouslySetInnerHTML={{ __html: url }}
					/>
				)}
				{url && !url.includes("www.youtube.com") && !url.includes("www.instagram.com") && (
					<div
						className="embed-preview"
						dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(url) }}
					/>
				)}
				{!url && <p className="no-embed">Embed a URL to Preview</p>}
				<input
					type="text"
					value={url}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Embed URL"
					className="embed-input"
				/>
			</div>
		</div>
	);
};

export default EmbedBlock;
