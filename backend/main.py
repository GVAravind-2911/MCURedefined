from flask import Flask, session, request, render_template, redirect, url_for, jsonify
from dmm import BlogPost, Timeline, Reviews
from datetime import datetime, date
from flask_cors import CORS
from flask_compress import Compress
from math import ceil
import requests
from dotenv import load_dotenv, find_dotenv
from os import environ as env
from userdbm import get_user_liked
import boto3
import base64
import io
import uuid

ENV_FIlE = find_dotenv()
if ENV_FIlE:
    load_dotenv(ENV_FIlE)

# Cloudflare R2 Configuration
R2_ACCOUNT_ID = env.get("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = env.get("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = env.get("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = env.get("R2_BUCKET_NAME", "mcuredefined")
R2_PUBLIC_URL = env.get("R2_PUBLIC_URL")  # e.g., https://your-bucket.r2.dev or custom domain

# Initialize R2 client
s3_client = boto3.client(
    's3',
    endpoint_url=f'https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com',
    aws_access_key_id=R2_ACCESS_KEY_ID,
    aws_secret_access_key=R2_SECRET_ACCESS_KEY,
    region_name='auto'
)

app = Flask("mcuredefined")
cors = CORS(app)
Compress(app)
app.secret_key = env.get("APP_SECRET_KEY")


def saveImage(imgstring):
    """Upload image to Cloudflare R2 and return the public URL"""
    if imgstring["link"].startswith("data:image"):
        # Extract the base64 data and mime type
        data_part = imgstring["link"]
        # Format: data:image/jpeg;base64,/9j/4AAQ...
        header, base64_data = data_part.split(",", 1)
        
        # Get mime type from header (e.g., "data:image/jpeg;base64" -> "image/jpeg")
        mime_type = header.split(":")[1].split(";")[0]
        
        # Get file extension from mime type
        ext_map = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/svg+xml': 'svg'
        }
        extension = ext_map.get(mime_type, 'jpg')
        
        # Decode base64 to binary
        image_binary = base64.b64decode(base64_data)
        
        # Create a file-like object
        image_file = io.BytesIO(image_binary)
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        filename = f"blog-images/{unique_id}.{extension}"
        
        try:
            # Upload to R2
            s3_client.upload_fileobj(
                image_file,
                R2_BUCKET_NAME,
                filename,
                ExtraArgs={
                    'ContentType': mime_type,
                }
            )
            
            # Construct the public URL
            public_url = f"{R2_PUBLIC_URL}/{filename}"
            
            return {"link": public_url, "key": filename}
        except Exception as e:
            print(f"R2 upload error: {str(e)}")
            raise Exception(f"Failed to upload image to R2: {str(e)}")
    else:
        return imgstring

@app.route('/blogs')
def sendBlogData():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    
    # Get total count and paginated blogs
    total = BlogPost.count()
    blogs = BlogPost.queryPaginated(page, limit)
    
    return jsonify({
        "blogs": blogs,
        "total": total
    })

@app.route('/blogs/<int:id>', methods = ['GET'])
def blog(id):   
    post = BlogPost.query(id)
    print(post)
    return jsonify(post)

@app.route('/blogs/<int:id>', methods=['DELETE'])
def deleteBlog(id):
    BlogPost.delete(id)
    return jsonify({"message": "Blog deleted successfully"}), 200

@app.route('/blogs/latest', methods=['GET'])
def latest():
    latest = BlogPost.queryLatest()
    return jsonify(latest)

@app.route('/blogs/recent', methods=['GET'])
def recent():
    recent = BlogPost.queryRecent()
    return jsonify(recent)


@app.route('/blogs/create', methods=['POST'])
def createBlogPost():
    try:
        data = request.get_json()
        
        if data['thumbnail_path']["link"].startswith("data:image"):
            imgUrl = saveImage(data['thumbnail_path'])
            data['thumbnail_path'] = imgUrl
        else:
            data['thumbnail_path'] = {"link": "https://i.imgur.com/JloNMTG.png", "deletehash": ""}

        for i in data["content"]:
            if i["type"] == "image":
                imgurl = saveImage(i["content"])
                i["content"] = imgurl

        BlogPost.createDatabase()
        BlogPost.insertBlogPost(data['title'], data['author'], data['description'], data['content'], data['tags'], data['thumbnail_path'])
        return jsonify({"message": "Blog created successfully"})
    except Exception as e:
        print(f"Error creating blog: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/blogs/update/<int:id>', methods=["PUT"])
def blogsSave(id):
    try:
        data = request.get_json()
        print(data)
        imgurl = saveImage(data['thumbnail_path'])
        data['thumbnail_path'] = imgurl
        for i in data["content"]:
            if i["type"] == "image":
                imgurl = saveImage(i["content"])
                i["content"] = imgurl
        BlogPost.createDatabase()
        BlogPost.update(id,data['title'], data['author'], data['description'], data['content'], data['tags'], data['thumbnail_path'])
        return jsonify({"message": "Blog updated successfully"})
    except Exception as e:
        print(f"Error updating blog: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Replace the problematic routes with these:
@app.route('/blogs/search', methods=['GET'])
def search_blogs():
    query = request.args.get('query', '').lower()
    tags_param = request.args.get('tags', '')
    tags = tags_param.split(',') if tags_param else []
    author = request.args.get('author', '')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    
    # Use the search method from the BlogPost class
    result = BlogPost.search(query=query, tags=tags, author=author, page=page, limit=limit)
    print(result)
    
    return jsonify(result)

@app.route('/blogs/tags', methods=['GET'])
def get_all_blog_tags():
    # Get all unique tags using the method from BlogPost class
    tags_list = BlogPost.get_all_tags()
    
    return jsonify({"tags": tags_list})

@app.route('/blogs/authors', methods=['GET'])
def get_all_blog_authors():
    # Get all unique authors using the method from BlogPost class
    authors_list = BlogPost.get_all_authors()
    
    return jsonify({"authors": authors_list})

@app.route('/reviews/create', methods=['POST'])
def createReview():
    try:
        data = request.get_json()

        if data['thumbnail_path']["link"].startswith("data:image"):
            imgUrl = saveImage(data['thumbnail_path'])
            data['thumbnail_path'] = imgUrl
        else:
            data['thumbnail_path'] = {"link": "https://i.imgur.com/JloNMTG.png", "deletehash": ""}

        for i in data["content"]:
            if i["type"] == "image":
                imgurl = saveImage(i["content"])
                i["content"] = imgurl

        Reviews.createDatabase()
        Reviews.insertReview(
            title=data['title'],
            author=data['author'],
            description=data['description'],
            content=data['content'],
            tags=data['tags'],
            thumbnail_path=data['thumbnail_path']
        )
        return jsonify({"message": "Review created successfully"})
    except Exception as e:
        print(f"Error creating review: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reviews/update/<int:id>', methods=["PUT"])
def updateReview(id):
    try:
        data = request.get_json()

        if data['thumbnail_path']["link"].startswith("data:image"):
            imgurl = saveImage(data['thumbnail_path'])
            data['thumbnail_path'] = imgurl

        for i in data["content"]:
            if i["type"] == "image":
                imgurl = saveImage(i["content"])
                i["content"] = imgurl

        Reviews.createDatabase()
        Reviews.updateReview(
            id=id,
            title=data['title'],
            author=data['author'],
            description=data['description'],
            content=data['content'],
            tags=data['tags'],
            thumbnail_path=data['thumbnail_path']
        )
        return jsonify({"message": "Review updated successfully"})
    except Exception as e:
        print(f"Error updating review: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/reviews/<int:id>', methods=["DELETE"])
def deleteReview(id):
    Reviews.deleteReview(id)
    return jsonify({"message": "Review deleted successfully"}), 200


@app.route('/reviews', methods=["GET"])
def reviews():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    
    # Get total count and paginated reviews
    total = Reviews.count()
    reviews_list = Reviews.queryPaginated(page, limit)
    
    return jsonify({
        "blogs": reviews_list,
        "total": total
    })

@app.route('/reviews/<int:id>', methods=['GET'])
def sendreview(id):
    review = Reviews.query(id)
    print(review)
    return jsonify(review)

@app.route("/reviews/latest")
def sendlatestreviews():
    latest = Reviews.queryLatest()
    return jsonify(latest)

# Similarly for reviews
@app.route('/reviews/search', methods=['GET'])
def search_reviews():
    query = request.args.get('query', '').lower()
    tags_param = request.args.get('tags', '')
    tags = tags_param.split(',') if tags_param else []
    author = request.args.get('author', '')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 5, type=int)
    
    # Use the search method from the Reviews class
    result = Reviews.search(query=query, tags=tags, author=author, page=page, limit=limit)
    return jsonify(result)

@app.route('/reviews/tags', methods=['GET'])
def get_all_review_tags():
    # Get all unique tags using the method from Reviews class
    tags_list = Reviews.get_all_tags()
    
    return jsonify({"tags": tags_list})

@app.route('/reviews/authors', methods=['GET'])
def get_all_review_authors():
    # Get all unique authors using the method from Reviews class
    authors_list = Reviews.get_all_authors()
    
    return jsonify({"authors": authors_list})

@app.route('/release-slate', methods=['POST', 'GET'])
def releaseSlate():
    if request.method == 'GET':
        projects = Timeline.queryAll()
        print(projects)
        return jsonify(projects)
    elif request.method == 'POST':
        # Return a valid response for POST (adjust as needed)
        return jsonify({"message": "POST method not implemented for this endpoint."}), 405
    # Ensure a response is always returned
    return jsonify({"error": "Method not allowed"}), 405
        

@app.route('/release-slate/<int:id>', methods=['GET', 'POST'])
def releaseProject(id):
    if request.method == 'GET':
        project = Timeline.queryId(id)
        print(project)
        return jsonify(project)
    else:
        # Return a valid response for POST (adjust as needed)
        return jsonify({"message": "POST method not implemented for this endpoint."}), 405

@app.route("/user/liked", methods=["POST"])
def liked():
    data = request.get_json()
    user_id = data.get('user_id')
    content_type = data.get('type', 'blogs')  # Default to blogs if no type specified
    page = data.get('page', 1)
    limit = data.get('limit', 5)
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    # Get all liked content IDs for the user
    user_liked = get_user_liked(user_id)
    
    # Return data based on requested content type
    if content_type == 'blogs':
        liked_blogs = BlogPost.query_by_ids(user_liked['blogs'], page, limit)
        print(liked_blogs)
        return jsonify(liked_blogs)
    elif content_type == 'reviews':
        liked_reviews = Reviews.query_by_ids(user_liked['reviews'], page, limit)
        print(liked_reviews)
        return jsonify(liked_reviews)
    elif content_type == 'projects':
        liked_projects = Timeline.query_by_ids(user_liked['projects'], page, limit)
        return jsonify(liked_projects)
    else:
        return jsonify({"error": f"Invalid content type: {content_type}"}), 400

@app.route('/user/liked/authors', methods=['POST'])
def likedAuthors():
    data = request.get_json()  # Fix: request.json() should be request.get_json()
    user_id = data.get('user_id')
    content_type = data.get('type', 'blogs')  # Default to blogs
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    user_liked = get_user_liked(user_id)
    
    if content_type == 'blogs':
        if user_liked['blogs']:
            liked_authors = BlogPost.query_authors_by_ids(user_liked['blogs'])
            return jsonify({"authors": liked_authors})
    elif content_type == 'reviews':
        if user_liked['reviews']:
            liked_authors = Reviews.query_authors_by_ids(user_liked['reviews'])
            return jsonify({"authors": liked_authors})
    
    # Return empty list if no liked content or invalid type
    return jsonify({"authors": []})

@app.route('/user/liked/tags', methods=['POST'])
def likedTags():
    data = request.get_json()
    user_id = data.get('user_id')
    content_type = data.get('type', 'blogs')  # Default to blogs
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    user_liked = get_user_liked(user_id)
    
    if content_type == 'blogs':
        if user_liked['blogs']:
            liked_tags = BlogPost.query_tags_by_ids(user_liked['blogs'])
            return jsonify({"tags": liked_tags})
    elif content_type == 'reviews':
        if user_liked['reviews']:
            liked_tags = Reviews.query_tags_by_ids(user_liked['reviews'])
            return jsonify({"tags": liked_tags})
    
    # Return empty list if no liked content or invalid type
    return jsonify({"tags": []})

@app.route('/user/liked/search', methods=['POST'])
def search_liked_content():
    data = request.get_json()
    user_id = data.get('user_id')
    content_type = data.get('type', 'blogs')
    query = data.get('query', '')
    tags_param = data.get('tags', '')
    tags = tags_param.split(',') if isinstance(tags_param, str) and tags_param else data.get('tags', [])
    author = data.get('author', '')
    page = data.get('page', 1)
    limit = data.get('limit', 5)
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    # Get all liked content IDs for the user
    user_liked = get_user_liked(user_id)
    
    # Filter based on content type
    if content_type == 'blogs':
        if not user_liked['blogs']:
            return jsonify({"blogs": [], "total": 0, "total_pages": 0, "page": page})
            
        # Get all liked blogs first
        all_liked_blogs = []
        for blog_id in user_liked['blogs']:
            blog = BlogPost.query(blog_id)
            if blog != 404:  # Check if blog exists
                all_liked_blogs.append(blog)
        
        # Filter locally based on search criteria
        filtered_blogs = []
        for blog in all_liked_blogs:
            # Check if blog matches query
            title_match = query.lower() in blog['title'].lower() if query else True
            desc_match = query.lower() in blog['description'].lower() if query and not title_match else False
            
            # Check if blog has all requested tags
            tag_match = all(tag in blog['tags'] for tag in tags) if tags else True
            
            # Check author
            author_match = author.lower() in blog['author'].lower() if author else True
            
            if (title_match or desc_match) and tag_match and author_match:
                filtered_blogs.append(blog)
        
        # Manual pagination
        total = len(filtered_blogs)
        total_pages = ceil(total / limit)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_blogs = filtered_blogs[start_idx:end_idx] if start_idx < total else []
        
        return jsonify({
            "blogs": paged_blogs,
            "total": total,
            "total_pages": total_pages,
            "page": page
        })
        
    elif content_type == 'reviews':
        # Same logic for reviews
        if not user_liked['reviews']:
            return jsonify({"blogs": [], "total": 0, "total_pages": 0, "page": page})
            
        all_liked_reviews = []
        for review_id in user_liked['reviews']:
            review = Reviews.query(review_id)
            if review != 404:
                all_liked_reviews.append(review)
        
        filtered_reviews = []
        for review in all_liked_reviews:
            title_match = query.lower() in review['title'].lower() if query else True
            desc_match = query.lower() in review['description'].lower() if query and not title_match else False
            tag_match = all(tag in review['tags'] for tag in tags) if tags else True
            author_match = author.lower() in review['author'].lower() if author else True
            
            if (title_match or desc_match) and tag_match and author_match:
                filtered_reviews.append(review)
        
        total = len(filtered_reviews)
        total_pages = ceil(total / limit)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paged_reviews = filtered_reviews[start_idx:end_idx] if start_idx < total else []
        
        return jsonify({
            "blogs": paged_reviews,
            "total": total,
            "total_pages": total_pages,
            "page": page
        })
        
    else:
        return jsonify({"error": f"Search not supported for content type: {content_type}"}), 400

@app.route('/collaborate',methods=['POST','GET'])
def collaborate():
    if request.method == 'GET':
        return render_template('collaboratePage.html')
    else:
        data = request.get_json()
        print(data)
        return data



if __name__ == '__main__':
    app.run(port=4000, debug=True, host='0.0.0.0')