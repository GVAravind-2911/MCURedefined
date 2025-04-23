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
engine = sqlalchemy.create_engine(f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}', connect_args={'check_same_thread': False}, echo=True)

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
        global engine
        Base.metadata.create_all(engine)

    @staticmethod
    def insertBlogPost(title, author, description, content, tags, thumbnail_path):
        global engine
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
    def count():
        global engine
        session = sessionmaker(bind=engine)()
        total = session.query(BlogPost).count()
        session.close()
        return total

    @staticmethod
    def queryPaginated(page, limit=3):
        global engine
        Session = sessionmaker(bind=engine)
        session = Session()
        
        try:
            # Get total count of records
            total_count = session.query(BlogPost).count()
            
            # Calculate offset
            offset = (page - 1) * limit

            # If offset is greater than available records, return empty list
            if offset >= total_count:
                return []

            # Fetch paginated results
            blog_posts = (
                session.query(BlogPost)
                .order_by(BlogPost.created_at.desc())  # Ensures consistent ordering
                .offset(offset)
                .limit(limit)
                .all()
            )

            # Convert blog posts to JSON
            blog_posts_json = []
            for post in blog_posts:
                post_dict = post.to_dict()
                
                # Ensure JSON fields are properly parsed
                for field in ['content', 'tags', 'thumbnail_path']:
                    if field in post_dict and isinstance(post_dict[field], str):
                        try:
                            post_dict[field] = json.loads(post_dict[field])
                        except json.JSONDecodeError:
                            pass  # Handle improperly formatted JSON

                blog_posts_json.append(post_dict)

            return blog_posts_json
            
        finally:
            session.close()


    @staticmethod
    def queryAll():
        global engine
        session = sessionmaker(bind=engine)()

        blog_posts = session.query(BlogPost).all()
        blog_posts_json = []
        for post in blog_posts:
            post_json = {
                'id': post.id,
                'title': post.title,
                'author': post.author,
                'description': post.description,
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
        global engine
        session = sessionmaker(bind=engine)()
        post = session.query(BlogPost).filter(BlogPost.id == id).first()

        session.close()

        if post:
            return post.to_dict()
        else:
            return 404
    
    def queryLatest():
        global engine
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Specify the columns you want to select
        latest = session.query(BlogPost).with_entities(
            BlogPost.id,
            BlogPost.title,
            BlogPost.author,
            BlogPost.created_at,
            BlogPost.thumbnail_path
        ).order_by(BlogPost.created_at.desc()).limit(3).all()
        
        session.close()
        
        # Convert the result to a list of dictionaries
        latest_dict = [dict(id=post.id, title=post.title, author=post.author, created_at=post.created_at, thumbnail_path=post.thumbnail_path) for post in latest]
        
        return latest_dict
    
    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path):
        global engine
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
        global engine
        Base.metadata.create_all(engine)

    @staticmethod
    def insert(phase, name, release_date, synopsis, img_path):
        global engine
        session = sessionmaker(bind=engine)()
        project = Timeline(phase=phase, name=name, release_date=release_date, synopsis=synopsis, posterpath=img_path)
        session.add(project)
        session.commit()
        session.close()

    @staticmethod
    def queryPhase(phaseno):
        global engine
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
        global engine
        session = sessionmaker(bind=engine)()
        project = session.query(Timeline).filter(Timeline.id == id).first()
        session.close()
        
        if project:
            return project.to_dict()
        else:
            return 404
        
    @staticmethod
    def queryAll():
        global engine
        session = sessionmaker(bind=engine)()
        
        projects = session.query(Timeline).all()
        projects_json = []
        
        for project in projects:
            projects_json.append(project.to_dict())
        
        session.close()
        return projects_json
    
    @staticmethod
    def populateNewDB(project):
        global engine
        session = sessionmaker(bind=engine)()
        newProject = Timeline(phase=project.phase, name=project.name, release_date=project.release_date, synopsis=project.synopsis, posterpath=project.posterpath, castinfo=project.castinfo, director=project.director, musicartist=project.musicartist, timelineid=project.timelineid)
        session.add(newProject)
        session.commit()
        session.close()
        
    @staticmethod
    def forPopulate():
        global engine
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
        global engine
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
        global engine
        session = sessionmaker(bind=engine)()
        timeline = session.query(Timeline.synopsis, Timeline.musicartist, Timeline.director, Timeline.castinfo).filter(Timeline.name == name).first()
        if timeline:
            return timeline
        session.close()

    @staticmethod
    def removeDuplicates():
        global engine
        session = sessionmaker(bind=engine)()
        duplicates = session.query(Timeline).filter(Timeline.id > 23).all()
        for i in duplicates:
            session.delete(i)
            session.commit()
            session.close()

class Users(Base):
    __tablename__ = 'users'
    id = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    username = sqlalchemy.Column(sqlalchemy.String, unique=True)
    email = sqlalchemy.Column(sqlalchemy.String, unique=True)
    password = sqlalchemy.Column(sqlalchemy.String)
    created_at = sqlalchemy.Column(sqlalchemy.String)
    likedList = sqlalchemy.Column(sqlalchemy.JSON, default=[])
    watchedList = sqlalchemy.Column(sqlalchemy.JSON, default = [])
    watchList = sqlalchemy.Column(sqlalchemy.JSON, default = [])

    @staticmethod
    def createDatabase():
        global engine
        Base.metadata.create_all(engine)

class Reviews(Base):
    __tablename__ = 'reviews'

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
        global engine
        Base.metadata.create_all(engine)

    @staticmethod
    def insertReview(title, author, description, content, tags, thumbnail_path):
        global engine
        session = sessionmaker(bind=engine)()
        review = Reviews(
            title=title,
            author=author,
            description=description,
            content=content, 
            tags=tags, 
            thumbnail_path=thumbnail_path, 
            created_at=datetime.strftime(datetime.now(), DATETIMEFORMAT),
            updated_at='')
        session.add(review)
        session.commit()
        session.close()

    @staticmethod
    def count():
        global engine
        session = sessionmaker(bind=engine)()
        total = session.query(Reviews).count()
        session.close()
        return total

    @staticmethod
    def queryPaginated(page, limit=3):
        global engine
        Session = sessionmaker(bind=engine)
        session = Session()
        
        try:
            # Get total count of records
            total_count = session.query(Reviews).count()
            
            # Calculate offset
            offset = (page - 1) * limit

            # If offset is greater than available records, return empty list
            if offset >= total_count:
                return []

            # Fetch paginated results
            reviews = (
                session.query(Reviews)
                .order_by(Reviews.created_at.desc())  # Ensures consistent ordering
                .offset(offset)
                .limit(limit)
                .all()
            )

            # Convert reviews to JSON
            reviews_json = []
            for review in reviews:
                review_dict = review.to_dict()
                
                # Ensure JSON fields are properly parsed
                for field in ['content', 'tags', 'thumbnail_path']:
                    if field in review_dict and isinstance(review_dict[field], str):
                        try:
                            review_dict[field] = json.loads(review_dict[field])
                        except json.JSONDecodeError:
                            pass  # Handle improperly formatted JSON

                reviews_json.append(review_dict)

            return reviews_json
            
        finally:
            session.close()
    
    @staticmethod
    def query(id):
        global engine
        session = sessionmaker(bind=engine)()
        review = session.query(Reviews).filter(Reviews.id == id).first()

        session.close()

        if review:
            return review.to_dict()
        else:
            return 404
    
    def queryLatest():
        global engine
        Session = sessionmaker(bind=engine)
        session = Session()
        
        latest = session.query(Reviews).with_entities(
            Reviews.id,
            Reviews.title,
            Reviews.author,
            Reviews.created_at,
            Reviews.thumbnail_path
        ).order_by(Reviews.created_at.desc()).limit(3).all()
        
        session.close()
        
        latest_dict = [dict(id=review.id, title=review.title, author=review.author, created_at=review.created_at, thumbnail_path=review.thumbnail_path) for review in latest]
        
        return latest_dict
    
    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path):
        global engine
        session = sessionmaker(bind=engine)()

        review = session.query(Reviews).filter_by(id=id).first()

        review.title = title
        review.author = author
        review.description = description
        review.content = content
        review.tags = tags
        review.thumbnail_path = thumbnail_path
        review.updated_at = datetime.strftime(datetime.now(),DATETIMEFORMAT)

        session.commit()
        session.close()


if __name__ == '__main__':
    # Reviews.createDatabase()
    Users.createDatabase()
    print('created')
    # BlogPost.insertBlogPost('MCURedefined', 'Aravind', 'Trying', 'Trying to use Turso', '#try', '', '', '')
    # Timeline.insert(3, 'Spider-Man Far From Home', datetime(2019, 7, 2), 'Mysterio and Edith', r'static/img/Posters/Phase3/Spiderman2.jpg')
    # Timeline.forPopulate()
    # print(Timeline.queryAll())
    # for i in Timeline.queryAll():
    #     Timeline.populateNewDB(i)
    # Timeline.removeDuplicates()