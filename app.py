import requests
from flask import Flask, render_template, make_response
import instaloader

app = Flask('mcuredefined')

@app.route('/')
def home():
    # Fetch the Instagram post URLs as before
    loader = instaloader.Instaloader()

    # Load the Instagram profile of the account you want to fetch posts from
    profile = instaloader.Profile.from_username(loader.context, 'mcu_redefined')

    # Fetch all the posts from the profile
    posts = profile.get_posts()

    # Prepare a list to store the post URLs
    post_urls = []

    # Iterate over the posts and extract their URLs
    for post in posts:
        post_urls.append(post.url)


    # Prepare a list to store the proxied image URLs
    proxied_urls = []

    # Iterate over the post URLs and proxy the image requests
    for post_url in post_urls:
        # Make a request to the Instagram post URL and retrieve the image content
        response = requests.get(post_url)
        if response.status_code == 200:
            # Create a response with the image content
            image_response = make_response(response.content)
            image_response.headers.set('Content-Type', 'image/jpeg')

            # Add the proxied image URL to the list
            proxied_urls.append(image_response)

    return render_template('instagram.html', proxied_urls=proxied_urls)

if __name__ == '__main__':
    app.run(port=7000, debug=True)
