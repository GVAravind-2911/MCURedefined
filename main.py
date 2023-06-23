from flask import Flask, session, request, render_template, redirect, url_for
import json

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
            return 'Hello'
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
        description = request.form['description']
        content = request.form['content']
        tags = request.form['tags']
        if 'thumbnail' in request.files:
            thumbnail = request.files['thumbnail']
            thumbnaildata = thumbnail.read()
        print(title, description, content, tags, thumbnaildata)
        # Process the blog post data here (e.g., store in a database)

        return 'Blog post created successfully!'
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

if __name__ == '__main__':
    app.run(port=5000, debug=True, host='0.0.0.0')
