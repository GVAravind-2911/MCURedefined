import BlockWrapper from "@/components/BlockWrapper";
import EmbedBlock from "@/components/EmbedBlock";
import ImageBlock from "@/components/ImageBlock";
import Layout from "@/components/Layout";
import TextBlock from "@/components/TextBlock";
import ThumbnailBlock from "@/components/ThumbnailBlock";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page() {
    const router = useRouter();
    const { id } = router.query;
    const [contentBlocks, setContentBlocks] = useState([]);
    const [tags, setTags] = useState([]);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogData = async () => {
            if (!id) return;

            try {
                const storedBlog = localStorage.getItem(`blog-${id}`);
                if (storedBlog) {
                    const blogData = JSON.parse(storedBlog);
                    initializeBlogData(blogData);
                } else {
                    const response = await axios.get(`http://127.0.0.1:4000/blogs/${id}`);
                    initializeBlogData(response.data);
                }
            } catch (error) {
                console.error("Error fetching blog data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogData();
    }, [id]);

    const initializeBlogData = (blogData) => {
        setContentBlocks(normalizeContentBlocks(blogData.content));
        setTags(blogData.tags || []);
        setTitle(blogData.title || "");
        setAuthor(blogData.author || "");
        setDescription(blogData.description || "");
        setThumbnail(blogData.thumbnail_path?.link || "");
    };

    // Normalize content blocks to ensure consistent structure
    const normalizeContentBlocks = (blocks) => {
        return blocks.map(block => {
            if (block.type === "image" && typeof block.content === "object") {
                return {
                    ...block,
                    content: block.content.link
                };
            }
            return block;
        });
    };

    // Generate a unique ID for each block
    const generateBlockId = () => {
        return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

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

    const handleSubmit = async () => {
        if (!id) return;

        const filteredTags = [...new Set(tags.filter(tag => tag.trim() !== ""))];
        
        const processedBlocks = contentBlocks.map(block => ({
            ...block,
            content: block.type === "image" ? { link: block.content } : block.content
        }));

        const blogData = {
            title,
            author,
            description,
            content: processedBlocks,
            tags: filteredTags,
            thumbnail_path: { link: thumbnail }
        };

        try {
            localStorage.setItem(`blog-${id}`, JSON.stringify(blogData));
            console.log("Blog data saved successfully");
        } catch (error) {
            console.error("Error saving blog data:", error);
        }
    };

    const handlePreview = async () => {
        await handleSubmit();
        router.push(`${id}/preview`);
    };

    const handleDiscard = () => {
        if (!id) return;
        localStorage.removeItem(`blog-${id}`);
        router.push("/edit-blog");
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

    if (loading) {
        return (
            <Layout>
                <LoadingSpinner />
            </Layout>
        );
    }

    return (
        <Layout>
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
                <h3 className="content-blog">Enter Content:</h3>
                <div className="contentformat">
                    <div className="content">
                        {contentBlocks.map((block, index) => (
                            <BlockWrapper
                                key={block.id}
                                onAddBlock={(type) => addBlock(type, index)}
                            >
                                {block.type === "text" && (
                                    <TextBlock
                                        content={block.content}
                                        onChange={(content) => updateBlock(index, content)}
                                        onDelete={() => deleteBlock(index)}
                                    />
                                )}
                                {block.type === "image" && (
                                    <ImageBlock
                                        index={index}
                                        src={block.content}
                                        onDelete={() => deleteBlock(index)}
                                        onChange={(event) => handleImageUpload(index, event)}
                                    />
                                )}
                                {block.type === "embed" && (
                                    <EmbedBlock
                                        url={block.content}
                                        onChange={(content) => updateBlock(index, content)}
                                        onDelete={() => deleteBlock(index)}
                                    />
                                )}
                            </BlockWrapper>
                        ))}
                    </div>
                </div>
                <h3 className="tags-blog">Enter Tags:</h3>
                <div className="tags-container">
                    {tags.map((tag, index) => (
                        <div key={index} className="tag-item">
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
                <div className="thumbnail-upload">
                    <h3 className="thumbnail-blog">Upload Thumbnail:</h3>
                    <ThumbnailBlock
                        src={thumbnail}
                        onChange={handleThumbnailUpload}
                    />
                </div>
                <div className="submit-blogdiv">
                    <button 
                        type="button" 
                        id="submit-blog" 
                        onClick={handlePreview}
                    >
                        Preview
                    </button>
                    <button 
                        type="button" 
                        id="submit-blog" 
                        onClick={handleDiscard}
                    >
                        Discard Changes
                    </button>
                </div>
            </div>
        </Layout>
    );
}