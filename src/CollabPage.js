import React from "react";
import  ReactDOM  from "react-dom/client";
import axios from "axios";

function MainComponent(){
    const [showEmbedPopup, setShowEmbedPopup] = React.useState(false);
    const [showHyperlinkPopup, setShowHyperlinkPopup] = React.useState(false);

    function redFormat(){
        const textarea = document.getElementById('content');
        const startPos = textarea.selectionStart;
		const endPos = textarea.selectionEnd;
		const selectedText = textarea.value.substring(startPos, endPos);
        let replacement = `<font color="#EC1D24">${selectedText}</font>`;
        const beforeSelection = textarea.value.substring(0, startPos);
		const afterSelection = textarea.value.substring(endPos);
		textarea.value = `${beforeSelection}${replacement}${afterSelection}`;
		textarea.focus();
    }

    function italicBoldFormat(tag){
        const textarea = document.getElementById('content');
        const startPos = textarea.selectionStart;
		const endPos = textarea.selectionEnd;
		const selectedText = textarea.value.substring(startPos, endPos);
        let replacement = `<${tag}>${selectedText}</${tag}>`
        const beforeSelection = textarea.value.substring(0, startPos);
		const afterSelection = textarea.value.substring(endPos);
		textarea.value = `${beforeSelection}${replacement}${afterSelection}`;
		textarea.focus();
    }

    function imageUpload() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
      
        input.onchange = async function (e) {
          var file = e.target.files[0];
          var formData = new FormData();  // Corrected from 'new formData()'
          formData.append('image', file);
      
          try {
            const response = await axios.post('/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
      
            if (response.status === 200) {
              const data = response.data;  // Corrected from 'response.json()'
              console.log(data);
              var textarea = document.getElementById('content');
              var existingText = textarea.value;
              var imageTag = `<img src="../${data.path}" alt="Thumbnail" class="contentimages">`;
              textarea.value = existingText + '\n' + imageTag + '\n';
            } else {
              console.error('Error Uploading Image', response.statusText);
            }
          } catch (error) {
            console.error('Error Uploading Image', error);
          }
        };
      
        input.click();
    }

    function addEmbedLink(){
        var textarea = document.getElementById('content');
		var existingText = textarea.value;
		var embedLink = document.getElementById('popup-text').value;
		textarea.value = existingText + '\n<span class="video-container">' + embedLink+ '</span>\n';
        setShowEmbedPopup(false);
    }

    function addHyperLink(){
        const textarea = document.getElementById('content');
		const existingText = textarea.value;
		const hyperlinkUrl = document.getElementById('hyperlink-url').value;
		const hyperlinkText = document.getElementById('hyperlink-text').value;
		const hyperlinkTag = `<a href="${hyperlinkUrl}" target="_blank">${hyperlinkText}</a>`;
		textarea.value = existingText + ' ' + hyperlinkTag;
        setShowHyperlinkPopup(false);
    }

    function submitCollabBlog(){
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const description = document.getElementById('description').value;
        const content = document.getElementById('content').value;
        const tags = document.getElementById('tags').value;
        const image = document.getElementById('image').value;
        const data = {
            title: title,
            author: author,
            description: description,
            content: content,
            tags: tags,
            image: image
        };
        var empty = false;
        for (const [key, value] of Object.entries(data)) {
            if(value === '' && key!='image'){
                empty = true;
                break;
            }
            console.log(`${key}: ${value}`);
        }
        if(empty){
            alert('Please fill all the fields');
        }
        else{
            axios.post('/collaborate', data).then((res) => {
                console.log(res);
                alert('Blog Uploaded Successfully');
                window.location.href = '/collaborate';
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    return (
    <>
    	<h3 className="title-blog">Enter Title:</h3>
        <input type="text" id="title" name="title"></input>
        <h3 className="author-blog">Author</h3>
        <input type="text" id="author" name="author"></input>
        <h3 className="description-blog">Enter Description:</h3>
        <input type="text" id="description" name="description"></input>
        <h3 className="content-blog">Enter Content:</h3>
        <div className="contentformat">
            {/* <div className="toolbar">
            <button type="button" onClick={() => italicBoldFormat('b')} className="bold">B</button>
            <button type="button" onClick={() => italicBoldFormat('i')} className="italic">I</button>
			<button type="button" onClick= {redFormat} className="classyred">R</button>
			<button id="upload-button" formNoValidate="formnovalidate" onClick={imageUpload}>Upload Image</button>
			<button onClick={() => setShowEmbedPopup(true)} id="upload-link" formNoValidate="formnovalidate">Embed Link</button>
            {showEmbedPopup && (
                <div className="poper">
                <div className="popup_out">
                    <div className="popup">
                        <button className= "close" onClick={() => setShowEmbedPopup(false)}>X</button>
                        <div className='popup-textdiv'>
                            <textarea id="popup-text"></textarea>
                            <button id='embedlink-add' onClick={addEmbedLink}>Add Embed Link</button>
				        </div>
                    </div>
                </div>
                </div>
            )}
			<button type="button" className="hyperlink" onClick={()=>setShowHyperlinkPopup(true)}>Add Hyperlink</button>
            {showHyperlinkPopup && (
                <div className="popup_out">
                <div className="popup">
                    <div onClick={() => setShowHyperlinkPopup(false)} className="close">x</div>
                    <div className='popup-textdiv'>
                        <input type="text" id="hyperlink-url" placeholder="Enter URL"></input>
                        <input type="text" id="hyperlink-text" placeholder="Enter Display Text"></input>
                        <button id='hyperlink-add' onClick={addHyperLink}>Add Hyperlink</button>
                    </div>
                </div>
                </div>
            )}z
		</div> */}
		<div className="content1">
			<textarea id="content" name="content"></textarea>
		</div>
        </div>
        {/* <h3 className="tags-blog">Enter Tags:</h3>
        <input type="text" id="tags" name="tags"></input>
        <h3 className="image-blog">Upload Thumbnail:</h3>
	    <input type="file" id="image" name="thumbnail"></input> */}
        <div className="submit-blogdiv">
		<button name="button" value="UPLOAD BLOG" id="submit-blog" onClick={submitCollabBlog}>UPLOAD BLOG</button>
	    </div>
    </>
    );
}

const domContainer = document.querySelector('#maincontentdiv');
const root = ReactDOM.createRoot(domContainer);
root.render(<MainComponent/>)