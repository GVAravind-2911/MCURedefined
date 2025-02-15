'use client'

import { useEffect, useState } from "react"
import Image from "next/image"
import parse from "@/lib/htmlparser"

interface TextContentProps {
    content: string;
}

interface ImageContentProps {
    src: { link: string };
}

interface EmbedContentProps {
    url: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content }) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="textcontent"> 
            {parse(content)}
        </div>
    )
}

export const ImageContent: React.FC<ImageContentProps> = ({ src }) => (
    <Image 
        src={src.link} 
        alt="blog-image" 
        className="contentimages" 
        width={100} 
        height={100}
    />
)

export const EmbedContent: React.FC<EmbedContentProps> = ({ url }) => {
    if (url.includes("www.youtube.com")) {
        const videoId = url.split('v=')[1]
        return (
            <div className="youtube-preview">
                <iframe 
                    title="youtube-video"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allowFullScreen
                    className="video"
                />
            </div>
        )
    }
    return <div className="embed-preview">{url}</div>
}