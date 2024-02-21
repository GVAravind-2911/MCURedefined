from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample posts
posts = [
    "How to build a simple website using HTML and CSS?",
    "Introduction to machine learning algorithms",
    "Understanding neural networks and backpropagation",
    # Other posts in the forum
]

# User's interaction history or a post to compare against
user_post = ""

# Vectorize the posts
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(posts + [user_post])

# Calculate cosine similarity between user_post and other posts
cosine_similarities = cosine_similarity(tfidf_matrix[:-1], tfidf_matrix[-1])

# Get top similar posts
similar_posts_indices = cosine_similarities.argsort(axis=0)[:-5:-1]  # Top 5 similar posts
for idx in similar_posts_indices:
    print(posts[idx[0]])
