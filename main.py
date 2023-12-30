from flask import Flask, session, request, render_template, redirect, url_for, jsonify
import json
from dmm import BlogPost, Timeline
from datetime import datetime, date
import webbrowser

app = Flask("mcuredefined")
app.secret_key = "secretkey"
orderID = 1
# Use Global for ID release_slate

@app.route("/", methods=['GET', 'POST'])
def homePage():
    global redirectSite, orderID
    if request.method == 'GET':
        return render_template('home.html')
    else:
        buttonValue = request.form.get('button')
        if buttonValue == 'home':
            # Handle the "Home" button action
            return redirect(url_for('homePage'))
        elif buttonValue == 'reviews':
            return redirect(url_for('editBlog'))
        elif buttonValue == 'blog':
            return redirect(url_for('blogsFetch'))
        elif buttonValue == 'release_slate':
            orderID = 1
            return redirect(url_for('releaseSlate'))
        elif buttonValue == 'collaborate':
            # Handle the "Collaborate" button action
            # return redirect(url_for('collaborate'))
            return "Coming Soon"
        elif buttonValue == 'cardblogredir':
            return redirect(url_for('blogsFetch'))
        elif buttonValue == 'cardtimelineredir':
            orderID = 0
            return redirect(url_for('releaseSlate'))
        elif buttonValue == 'cardcollabredir':
            return "Collaboration Opening Soon"


@app.route('/redirect')
def redirectExternal():
    if redirectSite == 'twitter':
        return redirect('https://twitter.com/Mcu_Redefined')
    elif redirectSite == 'discord':
        return redirect('https://discord.gg/KwG9WBup')
    elif redirectSite == 'insta':
        return redirect('https://www.instagram.com/mcu_redefined/')


@app.route('/home')
def returnHome():
    return redirect(url_for('homePage'))


# Route to handle form submission and create a new blog post
@app.route('/create-blog', methods=['POST', 'GET'])
def createBlogPost():
    if request.method == 'POST':
        title = request.form['title']
        author = request.form['author']
        description = request.form['description']
        content = request.form['content']
        tags = request.form['tags']
        if author == '':
            author = "MCU Redefined"
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            if thumbnail.filename:
                thumbnaildata = thumbnail.read()
                thumbnail_format = thumbnail.filename.rsplit('.', 1)[1].lower()
                thumbnail_path = f'static/img/thumbnails/{title}.{thumbnail_format}'
                with open(thumbnail_path, 'wb') as file:
                    file.write(thumbnaildata)
            else:
                thumbnail_path = 'static/img/BlogDefault.png'  # Default thumbnail path
        now = datetime.now()
        dtString = now.strftime("%d %B %Y %H:%M:%S")
        updateTime = ''
        print(dtString)
        # print(title, description, content, tags, thumbnaildata)
        BlogPost.createDatabase()
        BlogPost.insertBlogPost(title, author, description, content, tags, thumbnail_path, dtString, updateTime)
        # Process the blog post data here (e.g., store in a database)
        return redirect(url_for('blogsFetch'))
    else:
        return render_template('createblog.html')


@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return 'No image file found', 400

    file = request.files['image']
    if file.filename == '':
        return 'No image selected', 400

    path = 'static/img/blogimgs/' + file.filename
    file.save('static/img/blogimgs/' + file.filename)
    print('uploaded successfully')
    return json.dumps({'path': path})


@app.route('/blogs', methods=["POST", "GET"])
def blogsFetch():
    BlogPost.createDatabase()
    blogs = BlogPost.queryAll()
    print(blogs)
    return render_template('blogposts.html', blogs=blogs)


@app.route('/blogs/<int:id>')
def blog(id):
    post = BlogPost.query(id)
    if not post:
        return "404"  # or redirect to a custom error page
    else:
        post.tags = post.tags.split(' ')
        print(post.tags)
        return render_template('blog.html', content=post, tags=post.tags)


@app.route('/edit-blog', methods=['POST', 'GET'])
def editBlog():
    if request.method == 'GET':
        BlogPost.createDatabase()
        blogs = BlogPost.queryAll()
        return render_template('blogedit.html', blogs=blogs)
    else:
        id = request.form['id']
        title = request.form['title']
        author = request.form['author']
        description = request.form['description']
        content = request.form['content']
        tags = request.form['tags']
        if author == '':
            author = "MCU Redefined"
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            oldThumbnail = request.form['old_thumbnail']
            if thumbnail.filename:
                thumbnaildata = thumbnail.read()
                thumbnail_format = thumbnail.filename.rsplit('.', 1)[1].lower()
                thumbnail_path = f'static/img/thumbnails/{title}.{thumbnail_format}'
                with open(thumbnail_path, 'wb') as file:
                    file.write(thumbnaildata)
            else:
                thumbnail_path = oldThumbnail
        now = datetime.now()
        dtString = now.strftime("%d %B %Y %H:%M:%S")
        print(dtString)
        BlogPost.update(id, title, author, description, content, tags, thumbnail_path, dtString)
        # Redirect to the blog page
        return redirect(url_for('editBlog'))


@app.route('/edit-blog/<int:id>', methods=['GET', 'POST'])
def editBlogPage(id):
    if request.method == 'GET':
        post = BlogPost.query(id)
        if post is None:
            return "404"
        else:
            return render_template('editblogpage.html', content=post)


@app.route('/release-slate', methods=['POST', 'GET'])
def releaseSlate():
    if request.method == 'GET':
        print(orderID,'Method')
        return render_template('timeline.html')

@app.route('/send-data/')    
def sendData():
        Timeline.createDatabase()
        phase1Data = (Timeline.queryPhase(1))
        phase2Data = (Timeline.queryPhase(2))
        phase3Data = (Timeline.queryPhase(3))
        return jsonify(phase1Data,phase2Data,phase3Data,{"sortID":orderID})

@app.route('/receive-data',methods = ['POST'])
def receiveData():
    data = request.get_json()
    global orderID
    orderID = data['sortID']
    return jsonify(orderID)

@app.route('/release-slate/<int:id>',methods = ['GET','POST'])
def releaseProject(id):
    if request.method == 'GET':
        project = Timeline.queryId(id)
        if project==404:
            return 404
        else:
            project.posterpath = '/' + project.posterpath
            return render_template('projectinfo.html',project = project)



if __name__ == '__main__':
    app.run(port=5000, debug=True, host='0.0.0.0')
