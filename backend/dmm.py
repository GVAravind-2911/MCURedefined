import sqlalchemy
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import CheckConstraint
from datetime import datetime
import json
import os
from dotenv import load_dotenv

load_dotenv()

DATETIMEFORMAT = "%Y/%m/%d %H:%M:%S"
DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
AUTHTOKEN = os.getenv("TURSO_AUTHTOKEN")
DBURL = f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}&secure=true'

Base = declarative_base()

class BlogPost(Base):
    __tablename__ = 'blog_posts'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(255))
    author = sqlalchemy.Column(sqlalchemy.String(30))
    description = sqlalchemy.Column(sqlalchemy.Text)
    content = sqlalchemy.Column(sqlalchemy.JSON)  # JSON array for content
    tags = sqlalchemy.Column(sqlalchemy.JSON)  # JSON array for tags
    thumbnail_path = sqlalchemy.Column(sqlalchemy.JSON)
    created_at = sqlalchemy.Column(sqlalchemy.String(75))
    updated_at = sqlalchemy.Column(sqlalchemy.String(75))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def createDatabase():
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        Base.metadata.create_all(engine)

    @staticmethod
    def insertBlogPost(title, author, description, content, tags, thumbnail_path):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        post = BlogPost(
            title=title,
            author=author,
            description=description,
            content=content, 
            tags=tags, 
            thumbnail_path=thumbnail_path, 
            created_at= datetime.strftime(datetime.now(), DATETIMEFORMAT),
            updated_at='')
        session.add(post)
        session.commit()
        session.close()

    @staticmethod
    def queryAll():
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()

        blog_posts = session.query(BlogPost).all()
        blog_posts_json = []
        for post in blog_posts:
            post_json = {
                'id': post.id,
                'title': post.title,
                'author': post.author,
                'description': post.description,
                'content': post.content,
                'tags': post.tags,
                'thumbnail_path': post.thumbnail_path,
                'created_at': post.created_at,
                'updated_at': post.updated_at
            }
            blog_posts_json.append(post_json)

        session.close()

        return blog_posts_json
    
    @staticmethod
    def query(id):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        post = session.query(BlogPost).filter(BlogPost.id == id).first()

        session.close()

        if post:
            return post.to_dict()
        else:
            return 404
    
    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
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
        blog_post.updated_at = datetime.strftime(datetime.now(),DATETIMEFORMAT)

        # Commit the changes to the database
        session.commit()
        session.close()

class Timeline(Base):
    __tablename__ = 'timeline'
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    phase = sqlalchemy.Column(sqlalchemy.Integer)
    name = sqlalchemy.Column(sqlalchemy.String(50))
    release_date = sqlalchemy.Column(sqlalchemy.Date)
    synopsis = sqlalchemy.Column(sqlalchemy.Text)
    posterpath = sqlalchemy.Column(sqlalchemy.String(50))
    castinfo = sqlalchemy.Column(sqlalchemy.Text)
    director = sqlalchemy.Column(sqlalchemy.String(50))
    musicartist = sqlalchemy.Column(sqlalchemy.String(30))
    timelineid = sqlalchemy.Column(sqlalchemy.Integer)
    __table_args__ = (
        CheckConstraint('phase IN (1, 2, 3, 4, 5, 6, 7, 8, 9)', name='phase_check'),)
    
    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    @staticmethod
    def createDatabase():
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        Base.metadata.create_all(engine)

    @staticmethod
    def insert(phase, name, release_date, synopsis, img_path):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        project = Timeline(phase=phase, name=name, release_date=release_date, synopsis=synopsis, posterpath=img_path)
        session.add(project)
        session.commit()
        session.close()

    @staticmethod
    def queryPhase(phaseno):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        posts = session.query(Timeline).filter(Timeline.phase == phaseno).all()
        session.close()

        if posts:
            jsonoutput = []
            for i in posts:
                jsondict = {'id': i.id, 'phase': i.phase, 'name': i.name, 'release_date': i.release_date, 'synopsis': i.synopsis, 'posterpath': i.posterpath,
                            'castinfo': i.castinfo, 'director': i.director, 'musicartist': i.musicartist, 'timelineid': i.timelineid}
                jsonoutput.append(jsondict)
            return jsonoutput
        else:
            return 404

    @staticmethod    
    def queryId(id):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        project = session.query(Timeline).filter(Timeline.id == id).first()
        session.close()
        
        if project:
            return project.to_dict()
        else:
            return 404
        
    @staticmethod
    def queryAll():
        engine = sqlalchemy.create_engine(f'sqlite:///blog.db')
        session = sessionmaker(bind=engine)()
        oldposts = session.query(Timeline)
        return oldposts
    
    @staticmethod
    def populateNewDB(project):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        newProject = Timeline(phase=project.phase, name=project.name, release_date=project.release_date, synopsis=project.synopsis, posterpath=project.posterpath, castinfo=project.castinfo, director=project.director, musicartist=project.musicartist, timelineid=project.timelineid)
        session.add(newProject)
        session.commit()
        session.close()
        
    @staticmethod
    def forPopulate():
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        result = session.query(Timeline.name).all()
        resl = []
        for i in result:
            for j in i:
                resl.append(j)
        session.close()
        return resl
    
    @staticmethod
    def updateViaTkinter(name, syn, cast, direc, musicd, timelinepos):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        timeline = session.query(Timeline).filter(Timeline.name == name).first()
        if timeline:
            timeline.synopsis = syn
            timeline.castinfo = cast
            timeline.director = direc
            timeline.musicartist = musicd
            timeline.timelineid = timelinepos
            session.commit()
        session.close()
    
    @staticmethod
    def getTkinterContent(name):
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        timeline = session.query(Timeline.synopsis, Timeline.musicartist, Timeline.director, Timeline.castinfo).filter(Timeline.name == name).first()
        if timeline:
            return timeline
        session.close()

    @staticmethod
    def removeDuplicates():
        engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}')
        session = sessionmaker(bind=engine)()
        duplicates = session.query(Timeline).filter(Timeline.id > 23).all()
        for i in duplicates:
            session.delete(i)
            session.commit()
            session.close()

class Users(Base):
    __tablename__ = 'userdetails'
    uniqueid = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    username = sqlalchemy.Column(sqlalchemy.VARCHAR(10), unique=True)
    password = sqlalchemy.Column(sqlalchemy.String)
    likedPosts = sqlalchemy.Column(sqlalchemy.String)

if __name__ == '__main__':
    BlogPost.createDatabase()
    # BlogPost.insertBlogPost('MCURedefined', 'Aravind', 'Trying', 'Trying to use Turso', '#try', '', '', '')
    # Timeline.insert(3, 'Spider-Man Far From Home', datetime(2019, 7, 2), 'Mysterio and Edith', r'static/img/Posters/Phase3/Spiderman2.jpg')
    # Timeline.forPopulate()
    # print(Timeline.queryAll())
    # for i in Timeline.queryAll():
    #     Timeline.populateNewDB(i)
    # Timeline.removeDuplicates()