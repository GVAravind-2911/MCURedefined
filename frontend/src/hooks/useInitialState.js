'use client'

import { useState, useEffect } from 'react';

const useInitialState = () => {
    const defaultState = {
        contentBlocks: [{ id: 'initial-block', type: 'text', content: '' }],
        title: "",
        author: "",
        description: "",
        thumbnail: "",
        tags: []
    };

    const [state, setState] = useState(defaultState);

    useEffect(() => {
        // Ensure this code runs only on the client side
        if (typeof window !== 'undefined') {
            const draft = localStorage.getItem('create-blog-draft');
            if (draft) {
                const storedData = JSON.parse(draft);
                setState({
                    contentBlocks: storedData?.content?.map(block => ({
                        ...block,
                        content: block.type === "image" && block.content?.link
                            ? block.content.link
                            : block.content
                    })) || defaultState.contentBlocks,
                    title: storedData?.title || defaultState.title,
                    author: storedData?.author || defaultState.author,
                    description: storedData?.description || defaultState.description,
                    thumbnail: storedData?.thumbnail_path?.link || defaultState.thumbnail,
                    tags: storedData?.tags || defaultState.tags
                });
            }
        }
    }, []);

    return state;
};

export default useInitialState;