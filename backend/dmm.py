from math import ceil
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
            thumbnail_path=thumbnail_path, 
            created_at=datetime.strftime(datetime.now(), DATETIMEFORMAT),
            updated_at='')
        session.add(post)
        session.commit()
        
        # Add tags separately using the new BlogTag class
        blog_id = post.id
        BlogTag.add_tags(blog_id, tags)
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
                .order_by(BlogPost.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )

            # Convert blog posts to JSON
            blog_posts_json = []
            for post in blog_posts:
                post_dict = post.to_dict()
                
                # Get tags from BlogTag
                post_dict['tags'] = BlogTag.get_tags(post.id)
                
                # Ensure JSON fields are properly parsed
                for field in ['content', 'thumbnail_path']:
                    if field in post_dict and isinstance(post_dict[field], str):
                        try:
                            post_dict[field] = json.loads(post_dict[field])
                        except json.JSONDecodeError:
                            pass

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
            post_dict = post.to_dict()
            # Get tags from BlogTag
            post_dict['tags'] = BlogTag.get_tags(post.id)
            return post_dict
        else:
            return 404
    
    @staticmethod
    def query_by_ids(ids, page=1, limit=5):
        """
        Fetches blog posts by their IDs with pagination
        
        Args:
            ids: List of blog post IDs
            page: Page number (starting from 1)
            limit: Number of items per page
            
        Returns:
            dict: Contains blogs data, total count, and pagination info
        """
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            # If no IDs, return empty result
            if not ids or len(ids) == 0:
                return {
                    "blogs": [],
                    "total": 0,
                    "total_pages": 0,
                    "page": page
                }
            
            total = len(ids)
            
            # Calculate pagination
            start_idx = (page - 1) * limit
            end_idx = min(start_idx + limit, total)
            
            # Get subset of IDs for this page
            page_ids = ids[start_idx:end_idx]
            
            # Fetch the actual blog posts
            blogs = []
            for blog_id in page_ids:
                blog = session.query(BlogPost).filter(BlogPost.id == blog_id).first()
                if blog:
                    blog_dict = blog.to_dict()
                    blog_dict['tags'] = BlogTag.get_tags(blog.id)
                    blogs.append(blog_dict)
            
            total_pages = ceil(total / limit)
            
            return {
                "blogs": blogs,
                "total": total,
                "total_pages": total_pages,
                "page": page
            }
        
        finally:
            session.close()
        
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
    
    def queryRecent():
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
        ).order_by(BlogPost.created_at.desc()).limit(1).first()
        
        session.close()
        
        # Return a single dictionary instead of a list
        if latest:
            return dict(
                id=latest.id, 
                title=latest.title, 
                author=latest.author, 
                created_at=latest.created_at, 
                thumbnail_path=latest.thumbnail_path
            )
        return None
    
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
        blog_post.thumbnail_path = thumbnail_path
        blog_post.updated_at = datetime.strftime(datetime.now(),DATETIMEFORMAT)

        # Commit the changes to the database
        session.commit()
        session.close()
        
        # Update tags separately
        BlogTag.add_tags(id, tags)

    # Add to BlogPost class in dmm.py
# Update your search endpoint in the BlogPost class in dmm.py

    @staticmethod
    def search(query="", tags=None, author="", page=1, limit=5):
        global engine
        blogs = []
        total = 0
        total_pages = 0
        
        # Convert single tag to list if needed
        if isinstance(tags, str):
            tags = [tags]
        
        if tags and len(tags) > 0:
            # Get blog IDs that have ALL the selected tags
            blog_ids = None
            session = sessionmaker(bind=engine)()
            
            for tag in tags:
                tag_blogs = set([row[0] for row in session.query(BlogTag.blog_id).filter(BlogTag.tag == tag).all()])
                if blog_ids is None:
                    blog_ids = tag_blogs
                else:
                    blog_ids = blog_ids.intersection(tag_blogs)
            
            if blog_ids:
                blog_ids = list(blog_ids)
                total = len(blog_ids)
                
                # Apply pagination
                start_idx = (page - 1) * limit
                end_idx = start_idx + limit
                page_ids = blog_ids[start_idx:end_idx] if start_idx < total else []
                
                # Get blog details
                for blog_id in page_ids:
                    blog = session.query(BlogPost).filter(BlogPost.id == blog_id).first()
                    if blog:
                        blog_dict = blog.to_dict()
                        blog_dict['tags'] = BlogTag.get_tags(blog.id)
                        blogs.append(blog_dict)
            session.close()
        
        elif author:
            # Search by author
            session = sessionmaker(bind=engine)()
            total_query = session.query(BlogPost).filter(BlogPost.author.ilike(f'%{author}%'))
            total = total_query.count()
            
            blogs_query = total_query.order_by(BlogPost.created_at.desc()).offset((page-1)*limit).limit(limit)
            
            for blog in blogs_query:
                blog_dict = blog.to_dict()
                blog_dict['tags'] = BlogTag.get_tags(blog.id)
                blogs.append(blog_dict)
            session.close()
            
        elif query:
            # Search by title or description
            session = sessionmaker(bind=engine)()
            total_query = session.query(BlogPost).filter(
                sqlalchemy.or_(
                    BlogPost.title.ilike(f'%{query}%'),
                    BlogPost.description.ilike(f'%{query}%')
                )
            )
            total = total_query.count()
            
            blogs_query = total_query.order_by(BlogPost.created_at.desc()).offset((page-1)*limit).limit(limit)
            
            for blog in blogs_query:
                blog_dict = blog.to_dict()
                blog_dict['tags'] = BlogTag.get_tags(blog.id)
                blogs.append(blog_dict)
            session.close()
        
        # Calculate total pages
        total_pages = ceil(total / limit) if total > 0 else 0
        
        return {
            "blogs": blogs,
            "total": total,
            "total_pages": total_pages,
            "page": page
        }
    
    @staticmethod
    def get_all_tags():
        global engine
        session = sessionmaker(bind=engine)()
        tags = session.query(BlogTag.tag).distinct().all()
        tags_list = [tag[0] for tag in tags]
        session.close()
        
        return tags_list

    @staticmethod
    def get_all_authors():
        global engine
        session = sessionmaker(bind=engine)()
        authors = session.query(BlogPost.author).distinct().all()
        authors_list = [author[0] for author in authors]
        session.close()
        
        return authors_list
    
    @staticmethod
    def query_authors_by_ids(ids):
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            if not ids:
                return []
                
            # Get unique authors from the specified blog IDs
            authors_query = session.query(BlogPost.author).filter(
                BlogPost.id.in_(ids)
            ).distinct()
            
            authors = [author[0] for author in authors_query.all() if author[0]]
            return sorted(authors)
        finally:
            session.close()

    @staticmethod
    def query_tags_by_ids(ids):
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            if not ids:
                return []
                
            # Get all tags for the specified blog IDs
            tags = []
            for blog_id in ids:
                blog_tags = BlogTag.get_tags(blog_id)
                tags.extend(blog_tags)
                
            # Remove duplicates and sort
            return sorted(list(set(tags)))
        finally:
            session.close()


    @staticmethod
    def delete(id):
        global engine
        session = sessionmaker(bind=engine)()
        blog_post = session.query(BlogPost).filter_by(id=id).first()
        
        if blog_post:
            session.delete(blog_post)
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
    def query_by_ids(ids, page=1, limit=5):
        """
        Fetches projects by their IDs with pagination
        
        Args:
            ids: List of project IDs
            page: Page number (starting from 1)
            limit: Number of items per page
            
        Returns:
            dict: Contains projects data, total count, and pagination info
        """
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            # If no IDs, return empty result
            if not ids or len(ids) == 0:
                return {
                    "projects": [],
                    "total": 0,
                    "total_pages": 0,
                    "page": page
                }
            
            total = len(ids)
            
            # Calculate pagination
            start_idx = (page - 1) * limit
            end_idx = min(start_idx + limit, total)
            
            # Get subset of IDs for this page
            page_ids = ids[start_idx:end_idx]
            
            # Fetch the actual projects
            projects = []
            for project_id in page_ids:
                project = session.query(Timeline).filter(Timeline.id == project_id).first()
                if project:
                    projects.append(project.to_dict())
            
            total_pages = ceil(total / limit)
            
            return {
                "projects": projects,
                "total": total,
                "total_pages": total_pages,
                "page": page
            }
        
        finally:
            session.close()
    
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


class Reviews(Base):
    __tablename__ = 'reviews'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(255))
    author = sqlalchemy.Column(sqlalchemy.String(30))
    description = sqlalchemy.Column(sqlalchemy.Text)
    content = sqlalchemy.Column(sqlalchemy.JSON)  # JSON array for content
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
            thumbnail_path=thumbnail_path, 
            created_at=datetime.strftime(datetime.now(), DATETIMEFORMAT),
            updated_at=""
        )
        session.add(review)
        session.commit()

        # Add tags after creating review
        ReviewTag.add_tags(review.id, tags)
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
                .order_by(Reviews.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )

            # Convert reviews to JSON
            reviews_json = []
            for review in reviews:
                review_dict = review.to_dict()
                
                # Get tags from ReviewTag
                review_dict['tags'] = ReviewTag.get_tags(review.id)
                
                # Ensure JSON fields are properly parsed
                for field in ['content', 'thumbnail_path']:
                    if field in review_dict and isinstance(review_dict[field], str):
                        try:
                            review_dict[field] = json.loads(review_dict[field])
                        except json.JSONDecodeError:
                            pass

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
            review_dict = review.to_dict()
            # Get tags from ReviewTag
            review_dict['tags'] = ReviewTag.get_tags(review.id)
            return review_dict
        else:
            return 404
    
    @staticmethod
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
    def query_by_ids(ids, page=1, limit=5):
        """
        Fetches reviews by their IDs with pagination
        
        Args:
            ids: List of review IDs
            page: Page number (starting from 1)
            limit: Number of items per page
            
        Returns:
            dict: Contains reviews data, total count, and pagination info
        """
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            # If no IDs, return empty result
            if not ids or len(ids) == 0:
                return {
                    "blogs": [],  # Using "blogs" key for consistency with API
                    "total": 0,
                    "total_pages": 0,
                    "page": page
                }
            
            total = len(ids)
            
            # Calculate pagination
            start_idx = (page - 1) * limit
            end_idx = min(start_idx + limit, total)
            
            # Get subset of IDs for this page
            page_ids = ids[start_idx:end_idx]
            
            # Fetch the actual reviews
            reviews = []
            for review_id in page_ids:
                review = session.query(Reviews).filter(Reviews.id == review_id).first()
                if review:
                    review_dict = review.to_dict()
                    review_dict['tags'] = ReviewTag.get_tags(review.id)
                    reviews.append(review_dict)
            
            total_pages = ceil(total / limit)
            
            return {
                "blogs": reviews,  # Using "blogs" key for consistency with API
                "total": total,
                "total_pages": total_pages,
                "page": page
            }
        
        finally:
            session.close()

    @staticmethod
    def query_authors_by_ids(ids):
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            if not ids:
                return []
                
            # Get unique authors from the specified review IDs
            authors_query = session.query(Reviews.author).filter(
                Reviews.id.in_(ids)
            ).distinct()
            
            authors = [author[0] for author in authors_query.all() if author[0]]
            return sorted(authors)
        finally:
            session.close()

    @staticmethod
    def query_tags_by_ids(ids):
        global engine
        session = sessionmaker(bind=engine)()
        
        try:
            if not ids:
                return []
                
            # Get all tags for the specified review IDs
            tags = []
            for review_id in ids:
                review_tags = ReviewTag.get_tags(review_id)
                tags.extend(review_tags)
                
            # Remove duplicates and sort
            return sorted(list(set(tags)))
        finally:
            session.close()

    
    @staticmethod
    def updateReview(id, title, author, description, content, tags, thumbnail_path):
        global engine
        session = sessionmaker(bind=engine)()
        review = session.query(Reviews).filter_by(id=id).first()

        if not review:
            session.close()
            return 404

        review.title = title
        review.author = author
        review.description = description
        review.content = content
        review.thumbnail_path = thumbnail_path
        review.updated_at = datetime.strftime(datetime.now(), DATETIMEFORMAT)

        session.commit()
        session.close()

        # Update tags
        ReviewTag.add_tags(id, tags)

    @staticmethod
    def deleteReview(id):
        global engine
        session = sessionmaker(bind=engine)()
        review = session.query(Reviews).filter_by(id=id).first()

        if review:
            session.delete(review)
            session.commit()

        session.close()

    
    # Add to BlogPost class in dmm.py
    @staticmethod
    def search(query="", tags=None, author="", page=1, limit=5):
        global engine
        reviews = []
        total = 0
        total_pages = 0

        # Normalize tags
        if isinstance(tags, str):
            tags = [tags]

        session = sessionmaker(bind=engine)()

        try:
            # Search by tags (intersection logic like BlogPost)
            if tags and len(tags) > 0:
                review_ids = None
                for tag in tags:
                    tag_reviews = set([row[0] for row in session.query(ReviewTag.review_id).filter(ReviewTag.tag == tag).all()])
                    if review_ids is None:
                        review_ids = tag_reviews
                    else:
                        review_ids = review_ids.intersection(tag_reviews)

                if review_ids:
                    review_ids = list(review_ids)
                    total = len(review_ids)

                    start_idx = (page - 1) * limit
                    end_idx = start_idx + limit
                    page_ids = review_ids[start_idx:end_idx] if start_idx < total else []

                    for review_id in page_ids:
                        review = session.query(Reviews).filter(Reviews.id == review_id).first()
                        if review:
                            review_dict = review.to_dict()
                            review_dict['tags'] = ReviewTag.get_tags(review.id)
                            reviews.append(review_dict)

            elif author:
                total_query = session.query(Reviews).filter(Reviews.author.ilike(f'%{author}%'))
                total = total_query.count()
                results = total_query.order_by(Reviews.created_at.desc()).offset((page - 1) * limit).limit(limit)
                for review in results:
                    review_dict = review.to_dict()
                    review_dict['tags'] = ReviewTag.get_tags(review.id)
                    reviews.append(review_dict)

            elif query:
                total_query = session.query(Reviews).filter(
                    sqlalchemy.or_(
                        Reviews.title.ilike(f'%{query}%'),
                        Reviews.description.ilike(f'%{query}%')
                    )
                )
                total = total_query.count()
                results = total_query.order_by(Reviews.created_at.desc()).offset((page - 1) * limit).limit(limit)
                for review in results:
                    review_dict = review.to_dict()
                    review_dict['tags'] = ReviewTag.get_tags(review.id)
                    reviews.append(review_dict)

            # Pagination
            total_pages = ceil(total / limit) if total > 0 else 0

            return {
                "blogs": reviews,  # ✅ Return under 'blogs' to match blog API
                "total": total,
                "total_pages": total_pages,
                "page": page
            }

        finally:
            session.close()

    @staticmethod
    def get_all_tags():
        global engine
        session = sessionmaker(bind=engine)()
        tags = session.query(ReviewTag.tag).distinct().all()
        tags_list = [tag[0] for tag in tags]
        session.close()
        
        return tags_list

    @staticmethod
    def get_all_authors():
        global engine
        session = sessionmaker(bind=engine)()
        authors = session.query(Reviews.author).distinct().all()
        authors_list = [author[0] for author in authors]
        session.close()
        
        return authors_list


class BlogTag(Base):
    __tablename__ = 'blog_tags'
    
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    blog_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('blog_posts.id', ondelete='CASCADE'))
    tag = sqlalchemy.Column(sqlalchemy.String(50))
    
    @staticmethod
    def createDatabase():
        global engine
        Base.metadata.create_all(engine)
    
    @staticmethod
    def add_tags(blog_id, tags):
        global engine
        session = sessionmaker(bind=engine)()
        
        # First remove any existing tags for this blog
        session.query(BlogTag).filter(BlogTag.blog_id == blog_id).delete()
        
        # Add new tags
        for tag in tags:
            blog_tag = BlogTag(blog_id=blog_id, tag=tag)
            session.add(blog_tag)
            
        session.commit()
        session.close()
    
    @staticmethod
    def get_tags(blog_id):
        global engine
        session = sessionmaker(bind=engine)()
        
        tags = session.query(BlogTag.tag).filter(BlogTag.blog_id == blog_id).all()
        tags_list = [tag[0] for tag in tags]
        
        session.close()
        return tags_list
    
    @staticmethod
    def find_blogs_by_tag(tag):
        global engine
        session = sessionmaker(bind=engine)()
        
        blog_ids = session.query(BlogTag.blog_id).filter(BlogTag.tag == tag).all()
        blog_ids_list = [blog_id[0] for blog_id in blog_ids]
        
        session.close()
        return blog_ids_list


class ReviewTag(Base):
    __tablename__ = 'review_tags'
    
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    review_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('reviews.id', ondelete='CASCADE'))
    tag = sqlalchemy.Column(sqlalchemy.String(50))
    
    @staticmethod
    def createDatabase():
        global engine
        Base.metadata.create_all(engine)
    
    @staticmethod
    def add_tags(review_id, tags):
        global engine
        session = sessionmaker(bind=engine)()
        
        # First remove any existing tags for this review
        session.query(ReviewTag).filter(ReviewTag.review_id == review_id).delete()
        
        # Add new tags
        for tag in tags:
            review_tag = ReviewTag(review_id=review_id, tag=tag)
            session.add(review_tag)
            
        session.commit()
        session.close()
    
    @staticmethod
    def get_tags(review_id):
        global engine
        session = sessionmaker(bind=engine)()
        
        tags = session.query(ReviewTag.tag).filter(ReviewTag.review_id == review_id).all()
        tags_list = [tag[0] for tag in tags]
        
        session.close()
        return tags_list
    
    @staticmethod
    def find_reviews_by_tag(tag):
        global engine
        session = sessionmaker(bind=engine)()
        
        review_ids = session.query(ReviewTag.review_id).filter(ReviewTag.tag == tag).all()
        review_ids_list = [review_id[0] for review_id in review_ids]
        
        session.close()
        return review_ids_list


if __name__ == '__main__':
    # Create new tables for tags
    BlogTag.createDatabase()
    ReviewTag.createDatabase()
    
    # Add migration code to move existing tags to new tables
    session = sessionmaker(bind=engine)()
    
    # Migrate blog tags
    blogs = session.query(BlogPost).all()
    for blog in blogs:
        if blog.tags:
            tags = blog.tags
            if isinstance(tags, str):
                try:
                    tags = json.loads(tags)
                except json.JSONDecodeError:
                    tags = []
            BlogTag.add_tags(blog.id, tags)
    
    # Migrate review tags
    reviews = session.query(Reviews).all()
    for review in reviews:
        if review.tags:
            tags = review.tags
            if isinstance(tags, str):
                try:
                    tags = json.loads(tags)
                except json.JSONDecodeError:
                    tags = []
            ReviewTag.add_tags(review.id, tags)
    
    # Optionally, you could remove the tags column from the original tables
    # after migration if you no longer need it
    # This would require altering the table schema
    
    session.close()
    print('Tag migration complete')