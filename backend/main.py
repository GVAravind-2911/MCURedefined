from flask import Flask, session, request, render_template, redirect, url_for, jsonify
from auth_utils import admin_required
from dmm import BlogPost, Timeline, Reviews
from datetime import datetime, date
from flask_cors import CORS
from flask_compress import Compress
from math import ceil
import requests
from dotenv import load_dotenv, find_dotenv
from os import environ as env
from userdbm import is_admin

ENV_FIlE = find_dotenv()
if ENV_FIlE:
    load_dotenv(ENV_FIlE)

CLIENTID = "f7a420a28def437"

app = Flask("mcuredefined")
cors = CORS(app)
Compress(app)
app.secret_key = env.get("APP_SECRET_KEY")


def saveImage(imgstring):
    if imgstring["link"].startswith("data:image"):
        imgstring = imgstring["link"].split(",")[1]

        url = "https://api.imgur.com/3/upload"
        headers = {
            "Authorization": "Client-ID {}".format(CLIENTID)
        }
        payload = {
            "image": imgstring,
            "type": "base64"
        }

        response = requests.post(url, headers=headers, data=payload)
        if response.status_code == 200:
            data = response.json()
            deletehash = data['data']['deletehash']
            link = data['data']['link']
            return {"link": link, "deletehash": deletehash}
        else:
            raise Exception("Failed to upload image to Imgur")
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
@admin_required
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
@admin_required
def createBlogPost():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not is_admin(token):
        return jsonify({"error": "Unauthorized - Admin access required"}), 403

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


@app.route('/blogs/update/<int:id>', methods=["PUT"])
@admin_required
def blogsSave(id):
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
    return "Saved"

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
@admin_required
def createReview():
    if request.method == 'POST':
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

@app.route('/reviews/update/<int:id>', methods=["PUT"])
@admin_required
def updateReview(id):
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

@app.route('/reviews/<int:id>', methods=["DELETE"])
@admin_required
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
    print(result)
    
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
        

@app.route('/release-slate/<int:id>',methods = ['GET','POST'])
def releaseProject(id):
    if request.method == 'GET':
        project = Timeline.queryId(id)
        print(project)
        return jsonify(project)

@app.route('/send-individual-project-data/<int:id>')    
def sendIndividualProjectData(id):
    project = Timeline.queryId(id)
    if project==404:
        return 404
    else:
        project['posterpath'] = '/' + project['posterpath']
        return jsonify(project)

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