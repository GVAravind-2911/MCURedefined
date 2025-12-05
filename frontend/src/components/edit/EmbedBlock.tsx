"use client";

import { useEffect } from "react";
import type { EmbedBlockProps } from "@/types/BlockTypes";
import parse from "html-react-parser";

const EmbedBlock: React.FC<EmbedBlockProps> = ({ url, onChange, onDelete }) => {
	useEffect(() => {
		if (url) {
			if (url.includes("script async")) {
				const script = document.createElement("script");
				const regex1 = /<script async.*?src="(https:\/\/.*?)"/;
				const match1 = url.match(regex1);
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
				if (match) {
					const embedUrl = `<iframe src="${match[1]}" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-lg"></iframe>`;
					onChange(embedUrl);
				}
			}
		}
	}, [url, onChange]);

	return (
		<div className="relative bg-[rgba(40,40,40,0.4)] border border-white/10 rounded-xl overflow-visible transition-all duration-300 animate-[fadeInBlock_0.3s_ease-out] hover:border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col pt-10 px-4 md:px-6 pb-4 md:pb-6">
			<div className="absolute top-0 left-0 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] py-1.5 px-4 rounded-tl-xl rounded-br-lg text-xs text-white/70 uppercase tracking-wider border-b border-r border-white/10 z-5">Embed</div>
			<div className="absolute top-0 right-0 flex gap-1 p-1.5 bg-linear-to-br from-[rgba(60,60,60,0.95)] to-[rgba(40,40,40,0.95)] rounded-tr-xl rounded-bl-lg border-b border-l border-white/10 z-5 opacity-70 transition-all duration-300 hover:opacity-100">
				<button 
					type="button" 
					onClick={onDelete} 
					className="py-1 px-2 border border-[rgba(220,53,69,0.3)] rounded bg-[rgba(220,53,69,0.2)] text-[#ff6b6b] text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(220,53,69,0.4)] hover:border-[#dc3545]"
					title="Delete block"
				>
					🗑️
				</button>
			</div>
			<div className="flex flex-col gap-4">
				{url.includes("www.youtube.com") && (
					<div className="w-full max-w-[700px] aspect-video mx-auto relative rounded-lg overflow-hidden">{parse(url)}</div>
				)}
				{url.includes("www.instagram.com") && (
					<div className="max-w-[500px] mx-auto">{parse(url)}</div>
				)}
				{url &&
					!url.includes("www.youtube.com") &&
					!url.includes("www.instagram.com") && (
						<div className="flex justify-center items-center overflow-hidden rounded-lg">{parse(url)}</div>
					)}
				{!url && (
					<div className="text-center border-2 border-dashed border-white/20 rounded-lg p-8 md:p-12">
						<div className="text-4xl mb-3">🔗</div>
						<p className="text-white/70 mb-2">Paste an embed code below</p>
						<p className="text-white/50 text-sm">Supports YouTube, Instagram, and other embed codes</p>
					</div>
				)}
				<input
					type="text"
					value={url}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Paste embed code or iframe URL here..."
					className="w-full p-3 md:p-4 bg-[rgba(30,30,30,0.8)] border border-white/10 rounded-lg text-white/90 text-sm md:text-[0.95rem] outline-none transition-all duration-300 placeholder:text-white/50 focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)]"
				/>
			</div>
		</div>
	);
};

export default EmbedBlock;
