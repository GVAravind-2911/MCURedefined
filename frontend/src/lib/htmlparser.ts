import React, { type JSX } from "react";

const parseHtmlToJsx = (html: string) => {
	// Convert inline styles into a JavaScript object
	const parseStyle = (styleString: string) => {
		return styleString
			.split(";")
			.filter(Boolean)
			.reduce(
				(acc, style) => {
					const [key, value] = style.split(":").map((s) => s.trim());
					if (key && value) {
						const jsKey = key.replace(/-([a-z])/g, (_, letter) =>
							letter.toUpperCase(),
						);
						acc[jsKey] = value;
					}
					return acc;
				},
				{} as Record<string, string>,
			);
	};

	// Handle text content with newlines
	const parseTextContent = (text: string, parentKey = "") => {
		return text.split("\n").map((line, index) => {
			const key = `${parentKey}-line-${index}`;
			return React.createElement(
				React.Fragment,
				{ key },
				[
					line,
					index < text.split("\n").length - 1 &&
						React.createElement("br", { key: `${key}-br` }),
				].filter(Boolean),
			);
		});
	};

	// Generate unique keys for elements
	let elementCounter = 0;
	const generateKey = (prefix: string) => `${prefix}-${++elementCounter}`;

	// Convert HTML to JSX elements
	const convertToJsx = (htmlString: string, parentKey = "") => {
		const regex = /<(\w+)([^>]*)>(.*?)<\/\1>|<(\w+)([^>]*)\/>/gs;
		const elements: (string | JSX.Element)[] = [];

		let lastIndex = 0;
		htmlString.replace(
			regex,
			(match, tag, attrs, content, selfClosingTag, selfClosingAttrs, index) => {
				// Add preceding text (if any)
				if (lastIndex < index) {
					const textContent = htmlString.slice(lastIndex, index);
					const textKey = generateKey(`${parentKey}-text`);
					elements.push(...parseTextContent(textContent, textKey));
				}

				const tagName = tag || selfClosingTag;
				const attributes = attrs || selfClosingAttrs || "";
				const elementKey = generateKey(`${parentKey}-${tagName}`);

				// Parse attributes
				const attrRegex = /(\w+)=["'](.*?)["']/g;
				const props: Record<
					string,
					string | number | boolean | React.CSSProperties
				> = { key: elementKey };

				attributes.replace(attrRegex, (_, key, value) => {
					if (key === "class") {
						props.className = value;
					} else if (key === "style") {
						props.style = parseStyle(value);
					} else {
						props[key] = value;
					}
					return "";
				});

				// Handle self-closing tags
				if (selfClosingTag) {
					elements.push(React.createElement(selfClosingTag, props));
				} else {
					const children = convertToJsx(content, elementKey);
					elements.push(
						React.createElement(
							tagName,
							props,
							Array.isArray(children) ? children : [children],
						),
					);
				}

				lastIndex = index + match.length;
				return "";
			},
		);

		// Add remaining text after last match
		if (lastIndex < htmlString.length) {
			const remainingText = htmlString.slice(lastIndex);
			const textKey = generateKey(`${parentKey}-remaining`);
			elements.push(...parseTextContent(remainingText, textKey));
		}

		return elements.length === 1 ? elements[0] : elements;
	};

	return convertToJsx(html, "root");
};

export default parseHtmlToJsx;
