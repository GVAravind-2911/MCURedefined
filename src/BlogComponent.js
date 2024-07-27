import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import LoadingOverlay from './LoadingOverlay';

function BlogsComponent() { 
    const [blogs, setBlogs] = useState([]);
    const [isLoading,setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        axios.get('/send-blogs') // Fetch blog data from your Flask backend
            .then(response => {setBlogs(response.data);
            console.log(response.data);
            setIsLoading(false);})
            .catch(error => console.error(error));
    }, []);

    return (
        <>
        {isLoading && 
            <LoadingOverlay />
        }
        {!isLoading &&
        <div className="blogs fade-in">
            {blogs.map(blog => (
                <a href={`/blogs/${blog.id}`} key={blog.id} className="cardblog">
                    <div className="image-container">
                        <img src={blog.thumbnail_path} alt="Thumbnail" className="thumbnailset" />
                    </div>
                    <div className="cardcontent">
                        <h1 className="titleblog">{blog.title}</h1>
                        <h4 className="authorblog">By: {blog.author}</h4>
                        <h4 className="dateblog">{blog.created_at}</h4>
                        <h3 className="descblog">{blog.description}</h3>
                    </div>
                </a>
            ))}
        </div>
        }
        </>
    );
}

const domContainer = document.querySelector('#blogs');
const root = ReactDOM.createRoot(domContainer);
root.render(<BlogsComponent />);