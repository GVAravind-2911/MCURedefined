from flask import Flask, session, request, render_template, redirect, url_for, jsonify
import json
from dmm import BlogPost, Timeline, Reviews
from datetime import datetime, date
from flask_cors import CORS
from flask_compress import Compress
import base64
import requests

CLIENTID = "f7a420a28def437"

app = Flask("mcuredefined")
cors = CORS(app)
Compress(app)
app.secret_key = "secretkey"

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
    blogs = BlogPost.queryAll()
    print(blogs)
    return jsonify(blogs)

@app.route('/blogs/<int:id>')
def blog(id):
    post = BlogPost.query(id)
    print(post)
    return jsonify(post)

@app.route('/blogs/latest', methods=['GET'])
def latest():
    latest = BlogPost.queryLatest()
    return jsonify(latest)


@app.route('/blog/create', methods=['POST'])
def createBlogPost():
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

        BlogPost.createDatabase()
        BlogPost.insertBlogPost(data['title'], data['author'], data['description'], data['content'], data['tags'], data['thumbnail_path'])
        return "Saved"

@app.route('/blog/update/<int:id>', methods=["PUT"])
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

@app.route('/reviews', methods=["GET"])
def reviews():
    reviews = Reviews.queryAll()
    print(reviews)
    return jsonify(reviews)

@app.route('/reviews/<int:id>')
def sendreview(id):
    review = Reviews.query(id)
    print(review)
    return jsonify(review)

@app.route("/reviews/latest")
def sendlatestreviews():
    latest = Reviews.queryLatest()
    return jsonify(latest)

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