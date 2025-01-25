from flask import Flask, session, request, render_template, redirect, url_for, jsonify
import json
from dmm import BlogPost, Timeline
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


@app.route('/create-blog', methods=['POST'])
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

@app.route('/send-blogs')
def sendBlogData():
    BlogPost.createDatabase()
    blogs = BlogPost.queryAll()
    return jsonify(blogs)

@app.route('/blog-save/<int:id>', methods=["POST"])
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

@app.route('/blogs/<int:id>')
def blog(id):
    post = BlogPost.query(id)
    print(post)
    return jsonify(post)

@app.route('/release-slate', methods=['POST', 'GET'])
def releaseSlate():
    if request.method == 'GET':
        if not session.get('orderID'):
            session['orderID'] = 1
        print(session['orderID'],'Method')
        return render_template('timeline.html')

@app.route('/send-data/')    
def sendData():
        Timeline.createDatabase()
        phase1Data = (Timeline.queryPhase(1))
        phase2Data = (Timeline.queryPhase(2))
        phase3Data = (Timeline.queryPhase(3))
        return jsonify(phase1Data,phase2Data,phase3Data,{"sortID":session['orderID']})

@app.route('/receive-data',methods = ['POST'])
def receiveData():
    data = request.get_json()
    session['orderID'] = data['sortID']
    return jsonify(session['orderID'])

@app.route('/release-slate/<int:id>',methods = ['GET','POST'])
def releaseProject(id):
    if request.method == 'GET':
            return render_template('projectinfo.html')

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