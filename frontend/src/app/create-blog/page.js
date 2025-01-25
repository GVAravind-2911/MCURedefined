'use client'

import BlockWrapper from "@/components/BlockWrapper";
import EmbedBlock from "@/components/EmbedBlock";
import ImageBlock from "@/components/ImageBlock";
import TextBlock from "@/components/TextBlock";
import ThumbnailBlock from "@/components/ThumbnailBlock";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import "@/styles/editblogpage.css";

const useInitialState = () => {
    const defaultState = {
        contentBlocks: [],
        title: "",
        author: "",
        description: "",
        thumbnail: "",
        tags: []
    };
    
    return defaultState;
};


export default function CreateBlogPage() {
    const router = useRouter();
    const initialState = useInitialState();
    
    const [contentBlocks, setContentBlocks] = useState(initialState.contentBlocks);
    const [tags, setTags] = useState(initialState.tags);
    const [title, setTitle] = useState(initialState.title);
    const [author, setAuthor] = useState(initialState.author);
    const [description, setDescription] = useState(initialState.description);
    const [thumbnail, setThumbnail] = useState(initialState.thumbnail);

    useEffect(() => {
        const draft = localStorage.getItem('create-blog-draft');
        if (draft) {
            const storedData = JSON.parse(draft);
            setTitle(storedData?.title || "");
            setAuthor(storedData?.author || "");
            setDescription(storedData?.description || "");
            setThumbnail(storedData?.thumbnail_path?.link || "");
            setTags(storedData?.tags || []);
            
            // Transform content blocks properly
            const transformedContent = storedData.content.map(block => ({
                id: block.id || generateBlockId(),
                type: block.type,
                content: block.type === "image" && block.content?.link 
                    ? block.content.link 
                    : block.content || ""
            }));
            
            setContentBlocks(transformedContent.length > 0 
                ? transformedContent 
                : initialState.contentBlocks
            );
        }
    }, []);


    const generateBlockId = () => `block-${Math.random().toString(36).substring(2)}`;

    const addBlock = (type, index) => {
        const newBlock = {
            id: generateBlockId(),
            type,
            content: ""
        };

        setContentBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            newBlocks.splice(index + 1, 0, newBlock);
            return newBlocks;
        });
    };

    const updateBlock = (index, content) => {
        setContentBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            newBlocks[index] = {
                ...newBlocks[index],
                content
            };
            return newBlocks;
        });
    };

    const deleteBlock = (index) => {
        setContentBlocks(prevBlocks => 
            prevBlocks.filter((_, i) => i !== index)
        );
    };

    const handleImageUpload = async (index, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const dataUrl = await readFileAsDataURL(file);
            setContentBlocks(prevBlocks => {
                const newBlocks = [...prevBlocks];
                newBlocks[index] = {
                    id: newBlocks[index].id,
                    type: "image",
                    content: dataUrl
                };
                return newBlocks;
            });
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    const handleThumbnailUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const dataUrl = await readFileAsDataURL(file);
            setThumbnail(dataUrl);
        } catch (error) {
            console.error("Error uploading thumbnail:", error);
        }
    };

    const handlePreview = () => {
        const blogData = {
            title,
            author,
            description,
            content: contentBlocks.map(block => (block.type === "image" ? 
                { ...block, content: { link: block.content } } 
                : block)),
            tags: tags.filter(tag => tag.trim() !== ""),
            thumbnail_path: { link: thumbnail },
            created_at: new Date().toISOString()
        };

        localStorage.setItem('create-blog-draft', JSON.stringify(blogData));
        router.push('/create-blog/preview');
    };

    const handleSaveDraft = () => {
        const blogData = {
            title,
            author,
            description,
            content: contentBlocks.map(block => (block.type === "image" ? 
                { ...block, content: { link: block.content } } 
                : block)),
            tags: tags.filter(tag => tag.trim() !== ""),
            thumbnail_path: { link: thumbnail },
            created_at: new Date().toISOString()
        };
    
        localStorage.setItem('create-blog-draft', JSON.stringify(blogData));
        alert('Draft saved successfully!');
    };

    const addTag = () => {
        setTags(prevTags => [...prevTags, ""]);
    };

    const updateTag = (index, value) => {
        setTags(prevTags => {
            const newTags = [...prevTags];
            newTags[index] = value;
            return newTags;
        });
    };

    const removeTag = (index) => {
        setTags(prevTags => prevTags.filter((_, i) => i !== index));
    };

    return (
        <div className="create-blog">
            <h3 className="title-blog">Enter Title:</h3>
            <input 
                type="text" 
                id="title" 
                name="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
            />
            
            <h3 className="author-blog">Author</h3>
            <input
                type="text"
                id="author"
                name="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
            />

            <h3 className="description-blog">Enter Description:</h3>
            <input
                type="text"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <h3 className="thumbnail-blog">Upload Thumbnail:</h3>
            <ThumbnailBlock
                src={thumbnail}
                onChange={handleThumbnailUpload}
            />

<h3 className="content-blog">Enter Content:</h3>
<div className="contentformat">
    <div className="content">
        {contentBlocks.length === 0 ? (
            <div className="empty-content">
                <div className="add-block-buttons">
                    <button type="button" onClick={() => addBlock('text', -1)}>
                        Add Text
                    </button>
                    <button type="button" onClick={() => addBlock('image', -1)}>
                        Add Image
                    </button>
                    <button type="button" onClick={() => addBlock('embed', -1)}>
                        Add Embed
                    </button>
                </div>
            </div>
        ) : (
            contentBlocks.map((block, index) => (
                <BlockWrapper
                    key={`wrapper-${block.id}`}
                    onAddBlock={(type) => addBlock(type, index)}
                >
                            {block.type === "text" && (
                                <TextBlock
                                    key={`text-${block.id}`}
                                    content={block.content}
                                    onChange={(content) => updateBlock(index, content)}
                                    onDelete={() => deleteBlock(index)}
                                />
                            )}
                            {block.type === "image" && (
                                <ImageBlock
                                    key={`image-${block.id}`}
                                    index={index}
                                    src={block.content}
                                    onDelete={() => deleteBlock(index)}
                                    onChange={(event) => handleImageUpload(index, event)}
                                />
                            )}
                            {block.type === "embed" && (
                                <EmbedBlock
                                    key={`embed-${block.id}`}
                                    url={block.content}
                                    onChange={(content) => updateBlock(index, content)}
                                    onDelete={() => deleteBlock(index)}
                                />
                            )}
                        </BlockWrapper>
                    )))}
                </div>
            </div>

            <h3 className="tags-blog">Enter Tags:</h3>
            <div className="tags-container">
                {tags.map((tag, index) => (
                    <div key={'tag'} className="tag-item">
                        <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value)}
                            className="tag-input"
                        />
                        <button 
                            type="button"
                            onClick={() => removeTag(index)}
                            className="remove-tag-button"
                        >
                            x
                        </button>
                    </div>
                ))}
                <button 
                    type="button"
                    onClick={addTag}
                    className="add-tag-button"
                >
                    +
                </button>
            </div>

            <div className="submit-blogdiv">
                <button 
                    type="button"
                    onClick={handlePreview}
                    id="submit-blog"
                >
                    Preview
                </button>
                <button 
                    type="button"
                    onClick={handleSaveDraft}
                    id="submit-blog"
                >
                    Save Draft
                </button>
            </div>
        </div>
    );
}
