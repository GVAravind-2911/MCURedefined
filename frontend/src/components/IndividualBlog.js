import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import DOMPurify from 'dompurify';
import LoadingOverlay from '../../../temp/templates/LoadingOverlay';

function IndividualBlog(){

    const [blog, setBlog] = useState([]);
    const location = window.location.href;
    const [isLoading,setIsLoading] = useState(true);

    useEffect(() => {
        if(location.includes('blogs')){
            var blogId = location.split('/').pop();
        }
        axios.get('/send-individual-blog-data/'+blogId)
            .then(response => {setBlog(response.data);
            console.log(response.data);
            setIsLoading(false);})
            .catch(error => console.error(error));
    }
    , []);

    return (
        <>
        {isLoading && (
            // <LoadingOverlay />
            <div>Loading</div>
      )}
        {!isLoading && <div className='contents fade-in'>
            <div className="contentsinfo">
                <h1 className="title">{blog.title}</h1>
                <h3 className="byline"><span className='colorforby'>By: </span>{blog.author}</h3>
                <h3 className="datecreation"><span className='colorforby'>Posted: </span>{blog.created_at}</h3>
                {blog.updated_at && <h3 className="dateupdate"><span className='colorforby'>Updated: </span>{blog.updated_at}</h3>}
                <span className="tagsspan">
                    {blog.tags.map(tag => (
                        <button className="tags">{tag}</button>
                    ))}
                </span>
            </div>
        <div className="contentsmain">
            <p className="maincontent" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}></p>
        </div>
        </div>}
        </>
    )
}

const domContainer = document.querySelector('#maindiv');
const root = ReactDOM.createRoot(domContainer);
root.render(<IndividualBlog />);