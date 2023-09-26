import sqlalchemy
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()

class BlogPost(Base):
    __tablename__ = 'blog_posts'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(255))
    author = sqlalchemy.Column(sqlalchemy.String(30))
    description = sqlalchemy.Column(sqlalchemy.Text)
    content = sqlalchemy.Column(sqlalchemy.Text)
    tags = sqlalchemy.Column(sqlalchemy.String(255))
    thumbnail_path = sqlalchemy.Column(sqlalchemy.String(500))
    created_at = sqlalchemy.Column(sqlalchemy.String(75))
    updated_at = sqlalchemy.Column(sqlalchemy.String(75))

    @staticmethod
    def create_database():
        engine = sqlalchemy.create_engine('sqlite:///blog.db')
        Base.metadata.create_all(engine)

    @staticmethod
    def insert_blog_post(title, author, description, content, tags, thumbnail_path, time, update_time):
        engine = sqlalchemy.create_engine('sqlite:///blog.db')
        session = sessionmaker(bind=engine)()
        post = BlogPost(title=title, author=author, description=description, content=content, tags=tags, thumbnail_path=thumbnail_path, created_at=time, updated_at = update_time)
        session.add(post)
        session.commit()
        session.close()

    @staticmethod
    def query_all():
        engine = sqlalchemy.create_engine('sqlite:///blog.db')
        session = sessionmaker(bind=engine)()

        blog_posts = session.query(BlogPost).all()
        session.close()

        return blog_posts
    
    def query(id):
        engine = sqlalchemy.create_engine("sqlite:///blog.db")
        session = sessionmaker(bind=engine)()
        post = session.query(BlogPost).filter(BlogPost.id == id).first()
        session.close()

        if post:
            return post
        else:
            return 404
    
    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path, time):
        engine = sqlalchemy.create_engine("sqlite:///blog.db")
        session = sessionmaker(bind=engine)()

        # Retrieve the blog post with the given id
        blog_post = session.query(BlogPost).filter_by(id=id).first()

        # Update the blog post with the new values
        blog_post.title = title
        blog_post.author = author
        blog_post.description = description
        blog_post.content = content
        blog_post.tags = tags
        blog_post.thumbnail_path = thumbnail_path
        blog_post.updated_at = time

        # Commit the changes to the database
        session.commit()
        session.close()


if __name__ == '__main__':
    BlogPost.create_database()
    BlogPost.insert_blog_post('My First Blog Post','Aravind', 'This is my first blog post.', 'This is the content of my first blog post.', 'tag1, tag2, tag3', 'thumbnaildata','12202004','')

# import sqlite3
# mydb = sqlite3.connect('blog.db')
# mycon = sqlite3.Cursor()
# mycon.execute("CREATE TABLE blogposts IF NOT EXISTS (id integer PRIMARY KEY AUTOINCREMENT, title varchar(255) author varchar(30) description TEXT, content TEXT, tags VARCHAR(255),);")