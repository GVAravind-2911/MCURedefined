'use client'

import type { JSX } from 'react';
import { useEffect, useRef } from 'react';
import parse from '@/lib/htmlparser';
import type { Element } from 'html-react-parser';

interface ScriptEmbedProps {
  content: string;
}

const ScriptEmbed = ({ content }: ScriptEmbedProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*>/;
    const match = content.match(scriptRegex);
    
    if (match?.[1]) {
      const script = document.createElement('script');
      script.src = match[1];
      script.async = true;
      document.body.appendChild(script);

      // Handle iframe resize messages
      const handleMessage = (event: MessageEvent) => {
        if (containerRef.current) {
          const iframes = containerRef.current.getElementsByTagName('iframe');
          for (const iframe of Array.from(iframes)) {
            if (event.source === iframe.contentWindow) {
              const height = event.data.height || event.data.preferredHeight;
              if (height) {
                iframe.style.height = `${height}px`;
              }
            }
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        document.body.removeChild(script);
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [content]);

  const options = {
    replace: (domNode: Element) => {
      if (domNode.name === 'iframe') {
        return {
          ...domNode,
          attribs: {
            ...domNode.attribs,
            style: 'width: 100%; height: 100%; border: none;' // Ensure iframe takes full width and height
          }
        };
      }
    }
  };

  
  return (
    <div ref={containerRef} className="embed-preview" style={{ width: '50%', height: '100%' }}>
      {parse(content)}
    </div>
  );
};

export default ScriptEmbed;