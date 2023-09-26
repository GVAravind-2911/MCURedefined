from flask import Flask, session, request, render_template, redirect, url_for
import json, dmm
from datetime import datetime
import webbrowser

app = Flask('mcuredefined')
app.secret_key = 'secretkey'


@app.route('/' , methods=['GET', 'POST'])
def home():
    global redirectsite
    if request.method == 'GET':
        return render_template('home.html')
    else:
        button_value = request.form.get('button')
        if button_value == 'home':
            # Handle the "Home" button action
            return redirect(url_for('home'))
        elif button_value == 'reviews':
            # Handle the "Instagram" button action
            return redirect(url_for('characterprofiles.html'))
        elif button_value == 'blog':
            return redirect(url_for('blogsfetch'))
        elif button_value == 'release_slate':
            # Handle the "Release Slate" button action
            return redirect(url_for('release_slate'))
        elif button_value == 'collaborate':
            # Handle the "Collaborate" button action
            return redirect(url_for('collaborate'))
        elif button_value == 'twitterbutton':
            redirectsite = 'twitter'
            return render_template('redirect.html')
        elif button_value == 'discordbutton':
            redirectsite = 'discord'
            return render_template('redirect.html')
        elif button_value == 'instagrambutton':
            redirectsite = 'insta'
            webbrowser.open_new_tab("https://www.instagram.com/mcu_redefined")
            return render_template('redirect.html')

@app.route('/redirect')
def redirect_external():
    if redirectsite == 'twitter':
        return redirect('https://twitter.com/Mcu_Redefined')
    elif redirectsite == 'discord':
        return redirect('https://discord.gg/KwG9WBup')
    elif redirectsite == 'insta':
        return redirect('https://www.instagram.com/mcu_redefined/')
        

@app.route('/home')
def return_home():
    return redirect(url_for('home'))

# Route to handle form submission and create a new blog post
@app.route('/create-blog', methods=['POST','GET'])
def create_blog_post():
    if request.method=='POST':
        title = request.form['title']
        author=request.form['author']
        description = request.form['description']
        content = request.form['content']
        tags = request.form['tags']
        if author=='':
            author="MCU Redefined"
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            if thumbnail.filename:
                thumbnaildata = thumbnail.read()
                thumbnail_format = thumbnail.filename.rsplit('.', 1)[1].lower()
                thumbnail_path = f'static/img/thumbnails/{title}.{thumbnail_format}'  # Adjust the path as needed
                with open(thumbnail_path, 'wb') as file:
                    file.write(thumbnaildata)
            else:
                thumbnail_path = 'static/img/BlogDefault.png'  # Default thumbnail path
        now = datetime.now()
        dt_string = now.strftime("%d %B %Y %H:%M:%S")
        update_time = ''
        print(dt_string)
        # print(title, description, content, tags, thumbnaildata)
        dmm.BlogPost.create_database()
        dmm.BlogPost.insert_blog_post(title, author, description, content, tags, thumbnail_path, dt_string, update_time)
        # Process the blog post data here (e.g., store in a database)

        return redirect(url_for('blogsfetch'))
    else:
        return render_template('createblog.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'image' not in request.files:
        return 'No image file found', 400
    
    file = request.files['image']
    if file.filename == '':
        return 'No image selected', 400
    
    path='static/img/blogimgs/' + file.filename
    file.save('static/img/blogimgs/' + file.filename)
    print('uploaded successfully')
    return json.dumps({'path': path})

@app.route('/blogs',methods=["POST","GET"])
def blogsfetch():
    dmm.BlogPost.create_database()
    blogs = dmm.BlogPost.query_all()
    return render_template('blogposts.html', blogs=blogs)

@app.route('/blogs/<int:id>')
def blog(id):
    post = dmm.BlogPost.query(id)
    if not post:
        return "404"  # or redirect to a custom error page
    else:
        post.tags=post.tags.split(' ')
        print(post.tags)
        return render_template('blog.html', content=post, tags=post.tags)
    
@app.route('/edit-blog',methods = ['POST','GET'])
def editblog():
    if request.method == 'GET':
        dmm.BlogPost.create_database()
        blogs = dmm.BlogPost.query_all()
        return render_template('blogedit.html',blogs = blogs)
    else:
        id = request.form['id']
        title = request.form['title']
        author = request.form['author']
        description = request.form['description']
        content = request.form['content']
        tags = request.form['tags']
        if author=='':
            author="MCU Redefined"
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            oldthumbnail = request.form['old_thumbnail']
            if thumbnail.filename:
                thumbnaildata = thumbnail.read()
                thumbnail_format = thumbnail.filename.rsplit('.', 1)[1].lower()
                thumbnail_path = f'static/img/thumbnails/{title}.{thumbnail_format}'  # Adjust the path as needed
                with open(thumbnail_path, 'wb') as file:
                    file.write(thumbnaildata)
            else:
                thumbnail_path = oldthumbnail
        now = datetime.now()
        dt_string = now.strftime("%d %B %Y %H:%M:%S")
        print(dt_string)
        dmm.BlogPost.update(id, title, author, description, content, tags, thumbnail_path, dt_string)
        # Redirect to the blog page
        return redirect(url_for('editblog'))   

@app.route('/edit-blog/<int:id>',methods=['GET','POST'])    
def editblogpage(id):
    if request.method=='GET':
        post = dmm.BlogPost.query(id)
        if post is None:
            return "404"
        else:
            return render_template('editblogpage.html',content = post)     
        
if __name__ == '__main__':
    app.run(port=5000, debug=True, host='0.0.0.0')
