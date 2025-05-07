import sqlalchemy
from sqlalchemy.orm import sessionmaker, declarative_base, scoped_session
from sqlalchemy.pool import QueuePool
from sqlalchemy import CheckConstraint, Index
from datetime import datetime, date
import json
import os
from math import ceil
from contextlib import contextmanager
from functools import wraps
from dotenv import load_dotenv
from typing import List, Dict, Any, Union, Optional, Set, TypeVar, Generic, Type

# Load environment variables
load_dotenv()

# Constants
DATETIMEFORMAT = "%Y/%m/%d %H:%M:%S"
DATABASE_URL = os.getenv("TURSO_DATABASE_URL")
AUTHTOKEN = os.getenv("TURSO_AUTHTOKEN")

# Create engine with connection pooling
engine = sqlalchemy.create_engine(
    f'sqlite+{DATABASE_URL}/?authToken={AUTHTOKEN}', 
    connect_args={'check_same_thread': False}, 
    echo=False,  # Set to False in production for better performance
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_pre_ping=True  # Check connection validity before using
)

# Create thread-local session factory
SessionFactory = scoped_session(sessionmaker(bind=engine))
Base = declarative_base()

# Simple in-memory cache
class Cache:
    def __init__(self, ttl=300):  # Default TTL: 5 minutes
        self._cache = {}
        self._ttl = ttl
    
    def get(self, key):
        if key in self._cache:
            value, expiry = self._cache[key]
            if datetime.now().timestamp() < expiry:
                return value
            # Expired, remove from cache
            self.delete(key)
        return None
    
    def set(self, key, value, ttl=None):
        ttl = ttl or self._ttl
        self._cache[key] = (value, datetime.now().timestamp() + ttl)
    
    def delete(self, key):
        if key in self._cache:
            del self._cache[key]
    
    def clear(self):
        self._cache.clear()

# Create a global cache instance
cache = Cache()

# Cache decorator
def cached(ttl=None, key_prefix=None):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            key_parts = [key_prefix or func.__name__]
            for arg in args:
                # Handle special cases like lists that aren't hashable
                if isinstance(arg, (list, tuple, set)):
                    key_parts.extend([str(a) for a in sorted(arg)])
                else:
                    key_parts.append(str(arg))
            
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (list, tuple, set)):
                    key_parts.append(f"{k}={','.join(str(a) for a in sorted(v))}")
                else:
                    key_parts.append(f"{k}={v}")
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Call original function and cache result
            result = func(*args, **kwargs)
            
            # Ensure SQLAlchemy objects are converted to dictionaries
            if hasattr(result, 'to_dict'):  # Single SQLAlchemy object
                result = result.to_dict()
            elif isinstance(result, list):  # List of SQLAlchemy objects
                for i, item in enumerate(result):
                    if hasattr(item, 'to_dict'):
                        result[i] = item.to_dict()
            elif isinstance(result, dict):  # Dict containing SQLAlchemy objects
                for k, v in result.items():
                    if hasattr(v, 'to_dict'):
                        result[k] = v.to_dict()
                    elif isinstance(v, list):
                        for i, item in enumerate(v):
                            if hasattr(item, 'to_dict'):
                                v[i] = item.to_dict()
            
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator

#Session Manager
@contextmanager
def db_session(expire_on_commit=True):
    """Context manager for database sessions.
    
    Args:
        expire_on_commit: Whether to expire objects on commit (default: True)
    """
    session = SessionFactory()
    session.expire_on_commit = expire_on_commit
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Base repository for common operations
class BaseRepository:
    @staticmethod
    def query_by_ids(model, ids, page=1, limit=5, include_tags=False, tag_getter=None):
        """Generic method to query items by IDs with pagination."""
        if not ids or len(ids) == 0:
            return {
                "items": [],
                "total": 0,
                "total_pages": 0,
                "page": page
            }
        
        total = len(ids)
        start_idx = (page - 1) * limit
        end_idx = min(start_idx + limit, total)
        page_ids = ids[start_idx:end_idx]
        
        with db_session() as session:
            items = []
            for item_id in page_ids:
                item = session.query(model).filter(model.id == item_id).first()
                if item:
                    item_dict = item.to_dict()
                    if include_tags and tag_getter:
                        item_dict['tags'] = tag_getter(item.id)
                    items.append(item_dict)
            
            total_pages = ceil(total / limit)
            
            return {
                "items": items,
                "total": total,
                "total_pages": total_pages,
                "page": page
            }
    
    @staticmethod
    def query_authors_by_ids(model, ids):
        """Generic method to query unique authors for given IDs."""
        if not ids:
            return []
            
        with db_session() as session:
            authors_query = session.query(model.author).filter(
                model.id.in_(ids)
            ).distinct()
            
            authors = [author[0] for author in authors_query.all() if author[0]]
            return sorted(authors)
    
    @staticmethod
    def search(model, query="", tags=None, author="", page=1, limit=5, 
               tag_model=None, item_id_field=None, tag_getter=None):
        """Generic search method with filtering by tags, author, or keywords."""
        items = []
        total = 0
        total_pages = 0
        
        # Normalize tags input
        if isinstance(tags, str):
            tags = [tags]
        
        with db_session() as session:
            # Search by tags
            if tags and len(tags) > 0:
                item_ids = None
                for tag in tags:
                    tag_items = set([
                        row[0] for row in session.query(getattr(tag_model, item_id_field))
                        .filter(tag_model.tag == tag).all()
                    ])
                    if item_ids is None:
                        item_ids = tag_items
                    else:
                        item_ids = item_ids.intersection(tag_items)
                
                if item_ids:
                    total = len(item_ids)
                    # Apply pagination
                    start_idx = (page - 1) * limit
                    end_idx = min(start_idx + limit, len(item_ids))
                    page_ids = list(item_ids)[start_idx:end_idx] if start_idx < total else []
                    
                    for item_id in page_ids:
                        item = session.query(model).filter(model.id == item_id).first()
                        if item:
                            item_dict = item.to_dict()
                            if tag_getter:
                                item_dict['tags'] = tag_getter(item.id)
                            items.append(item_dict)
            
            # Search by author
            elif author:
                total_query = session.query(model).filter(model.author.ilike(f'%{author}%'))
                total = total_query.count()
                
                results = total_query.order_by(model.created_at.desc()).offset((page-1)*limit).limit(limit)
                for item in results:
                    item_dict = item.to_dict()
                    if tag_getter:
                        item_dict['tags'] = tag_getter(item.id)
                    items.append(item_dict)
                    
            # Search by title or description
            elif query:
                total_query = session.query(model).filter(
                    sqlalchemy.or_(
                        model.title.ilike(f'%{query}%'),
                        model.description.ilike(f'%{query}%')
                    )
                )
                total = total_query.count()
                
                results = total_query.order_by(model.created_at.desc()).offset((page-1)*limit).limit(limit)
                for item in results:
                    item_dict = item.to_dict()
                    if tag_getter:
                        item_dict['tags'] = tag_getter(item.id)
                    items.append(item_dict)
            
            # Calculate total pages
            total_pages = ceil(total / limit) if total > 0 else 0
            
            return {
                "items": items,
                "total": total,
                "total_pages": total_pages,
                "page": page
            }

class BaseModel:
    def to_dict(self):
        """Convert model to dictionary, safely handling detachment."""
        result = {}
        for c in self.__table__.columns:
            try:
                value = getattr(self, c.name)
                # Convert date/datetime objects to strings
                if isinstance(value, (date, datetime)):
                    value = value.isoformat()
                result[c.name] = value
            except (sqlalchemy.orm.exc.DetachedInstanceError, 
                   sqlalchemy.exc.InvalidRequestError):
                # If we can't access the attribute due to detachment,
                # skip it rather than crashing
                pass
        return result

# Blog Posts
class BlogPost(Base, BaseModel):
    __tablename__ = 'blog_posts'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(255))
    author = sqlalchemy.Column(sqlalchemy.String(30))
    description = sqlalchemy.Column(sqlalchemy.Text)
    content = sqlalchemy.Column(sqlalchemy.JSON)
    thumbnail_path = sqlalchemy.Column(sqlalchemy.JSON)
    created_at = sqlalchemy.Column(sqlalchemy.String(75))
    updated_at = sqlalchemy.Column(sqlalchemy.String(75))
    
    # Add indexes for commonly queried columns
    __table_args__ = (
        Index('idx_blog_author', 'author'),
        Index('idx_blog_title', 'title'),
        Index('idx_blog_created_at', 'created_at'),
    )

    @staticmethod
    def createDatabase():
        Base.metadata.create_all(engine)

    @staticmethod
    def insertBlogPost(title, author, description, content, tags, thumbnail_path):
        with db_session() as session:
            post = BlogPost(
                title=title,
                author=author,
                description=description,
                content=content, 
                thumbnail_path=thumbnail_path, 
                created_at=datetime.strftime(datetime.now(), DATETIMEFORMAT),
                updated_at=''
            )
            session.add(post)
            session.flush()  # Get ID before committing
            blog_id = post.id
            
        # Add tags in a separate session to ensure blog exists
        BlogTag.add_tags(blog_id, tags)
        
        # Clear relevant caches
        cache_keys = ['blog_tags', 'blog_authors']
        for key in cache_keys:
            cache.delete(key)
        
        return blog_id

    @staticmethod
    @cached(ttl=60, key_prefix="blog_count")
    def count():
        with db_session() as session:
            return session.query(BlogPost).count()

    @staticmethod
    @cached(ttl=30, key_prefix="blog_paginated")
    def queryPaginated(page, limit=3):
        with db_session(expire_on_commit=False) as session:
            total_count = session.query(BlogPost).count()
            offset = (page - 1) * limit

            if offset >= total_count:
                return []

            blog_posts = (
                session.query(BlogPost)
                .order_by(BlogPost.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )

            # Process the blog posts INSIDE the session
            blog_posts_json = []
            for post in blog_posts:
                post_dict = post.to_dict()  # Convert to dict inside session
                post_dict['tags'] = BlogTag.get_tags(post.id, session=session)
                
                # Parse JSON strings if needed
                for field in ['content', 'thumbnail_path']:
                    if field in post_dict and isinstance(post_dict[field], str):
                        try:
                            post_dict[field] = json.loads(post_dict[field])
                        except json.JSONDecodeError:
                            pass

                blog_posts_json.append(post_dict)

            return blog_posts_json

    @staticmethod
    @cached(ttl=10, key_prefix="blog_by_id")
    def query(id):
        with db_session() as session:
            post = session.query(BlogPost).filter(BlogPost.id == id).first()
            
            if post:
                post_dict = post.to_dict()
                # Get tags from BlogTag
                post_dict['tags'] = BlogTag.get_tags(post.id,session=session)
                
                # Parse JSON strings if needed
                for field in ['content', 'thumbnail_path']:
                    if field in post_dict and isinstance(post_dict[field], str):
                        try:
                            post_dict[field] = json.loads(post_dict[field])
                        except json.JSONDecodeError:
                            pass
                            
                return post_dict
            else:
                return 404
    
    @staticmethod
    def query_by_ids(ids, page=1, limit=5):
        """Fetches blog posts by their IDs with pagination"""
        result = BaseRepository.query_by_ids(
            model=BlogPost,
            ids=ids,
            page=page,
            limit=limit,
            include_tags=True,
            tag_getter=BlogTag.get_tags
        )
        
        # Rename 'items' key to 'blogs' for API consistency
        result['blogs'] = result.pop('items')
        return result
    
    @staticmethod
    def queryLatest():
        with db_session() as session:
            latest = session.query(BlogPost).with_entities(
                BlogPost.id,
                BlogPost.title,
                BlogPost.author,
                BlogPost.created_at,
                BlogPost.thumbnail_path
            ).order_by(BlogPost.created_at.desc()).limit(3).all()
            
            latest_dict = []
            for post in latest:
                post_data = {
                    'id': post.id,
                    'title': post.title,
                    'author': post.author,
                    'created_at': post.created_at,
                    'thumbnail_path': post.thumbnail_path
                }
                
                # Parse JSON fields if needed
                if isinstance(post_data['thumbnail_path'], str):
                    try:
                        post_data['thumbnail_path'] = json.loads(post_data['thumbnail_path'])
                    except json.JSONDecodeError:
                        pass
                        
                latest_dict.append(post_data)
            
            return latest_dict
    
    @staticmethod
    def queryRecent():
        with db_session() as session:
            latest = session.query(BlogPost).with_entities(
                BlogPost.id,
                BlogPost.title,
                BlogPost.author,
                BlogPost.created_at,
                BlogPost.thumbnail_path
            ).order_by(BlogPost.created_at.desc()).limit(1).first()
            
            if latest:
                result = {
                    'id': latest.id,
                    'title': latest.title,
                    'author': latest.author,
                    'created_at': latest.created_at,
                    'thumbnail_path': latest.thumbnail_path
                }
                
                # Parse JSON fields if needed
                if isinstance(result['thumbnail_path'], str):
                    try:
                        result['thumbnail_path'] = json.loads(result['thumbnail_path'])
                    except json.JSONDecodeError:
                        pass
                        
                return result
            return None
    
    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path):
        with db_session() as session:
            blog_post = session.query(BlogPost).filter_by(id=id).first()
            
            if not blog_post:
                return 404
                
            blog_post.title = title
            blog_post.author = author
            blog_post.description = description
            blog_post.content = content
            blog_post.thumbnail_path = thumbnail_path
            blog_post.updated_at = datetime.strftime(datetime.now(), DATETIMEFORMAT)
            
        # Update tags separately
        BlogTag.add_tags(id, tags)
        
        # Clear caches
        cache.delete(f"blog_by_id:{id}")
        cache.delete("blog_tags")
        cache.delete("blog_authors")
        cache.delete("blog_paginated")
        
        return True

    @staticmethod
    def search(query="", tags=None, author="", page=1, limit=5):
        result = BaseRepository.search(
            model=BlogPost,
            query=query,
            tags=tags,
            author=author,
            page=page,
            limit=limit,
            tag_model=BlogTag,
            item_id_field="blog_id",
            tag_getter=BlogTag.get_tags
        )
        
        # Process JSON fields if needed
        for item in result['items']:
            for field in ['content', 'thumbnail_path']:
                if field in item and isinstance(item[field], str):
                    try:
                        item[field] = json.loads(item[field])
                    except json.JSONDecodeError:
                        pass
        
        # Rename 'items' key to 'blogs' for API consistency
        result['blogs'] = result.pop('items')
        return result
    
    @staticmethod
    @cached(ttl=60, key_prefix="blog_tags")
    def get_all_tags():
        with db_session() as session:
            tags = session.query(BlogTag.tag).distinct().all()
            return sorted([tag[0] for tag in tags])

    @staticmethod
    @cached(ttl=60, key_prefix="blog_authors")
    def get_all_authors():
        with db_session() as session:
            authors = session.query(BlogPost.author).distinct().all()
            return sorted([author[0] for author in authors])
    
    @staticmethod
    def query_authors_by_ids(ids):
        return BaseRepository.query_authors_by_ids(BlogPost, ids)

    @staticmethod
    def query_tags_by_ids(ids):
        if not ids:
            return []
            
        tags = []
        for blog_id in ids:
            blog_tags = BlogTag.get_tags(blog_id)
            tags.extend(blog_tags)
                
        # Remove duplicates and sort
        return sorted(list(set(tags)))

    @staticmethod
    def delete(id):
        with db_session() as session:
            blog_post = session.query(BlogPost).filter_by(id=id).first()
            
            if blog_post:
                session.delete(blog_post)
                
                # Clear caches
                cache.delete(f"blog_by_id:{id}")
                cache.delete("blog_tags")
                cache.delete("blog_authors")
                cache.delete("blog_paginated")
                cache.delete("blog_count")
                
                return True
            
            return False


# Blog Tags
class BlogTag(Base, BaseModel):
    __tablename__ = 'blog_tags'
    
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    blog_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('blog_posts.id', ondelete='CASCADE'))
    tag = sqlalchemy.Column(sqlalchemy.String(50))
    
    # Add indexes for commonly queried columns
    __table_args__ = (
        Index('idx_blogtag_blogid', 'blog_id'),
        Index('idx_blogtag_tag', 'tag'),
    )
    
    @staticmethod
    def createDatabase():
        Base.metadata.create_all(engine)
    
    @staticmethod
    def add_tags(blog_id, tags):
        with db_session() as session:
            # First remove any existing tags for this blog
            session.query(BlogTag).filter(BlogTag.blog_id == blog_id).delete()
            
            # Add new tags
            for tag in tags:
                blog_tag = BlogTag(blog_id=blog_id, tag=tag)
                session.add(blog_tag)
                
        # Clear tag cache
        cache.delete("blog_tags")
        cache.delete(f"blog_tags_by_id:{blog_id}")
    
    @staticmethod
    @cached(ttl=30, key_prefix="blog_tags_by_id")
    def get_tags(blog_id, session=None):
        if session is None:
            with db_session() as new_session:
                tags = new_session.query(BlogTag.tag).filter(BlogTag.blog_id == blog_id).all()
                return [tag[0] for tag in tags]
        else:
            tags = session.query(BlogTag.tag).filter(BlogTag.blog_id == blog_id).all()
            return [tag[0] for tag in tags]
    
    @staticmethod
    @cached(ttl=30, key_prefix="blogs_by_tag")
    def find_blogs_by_tag(tag):
        with db_session() as session:
            blog_ids = session.query(BlogTag.blog_id).filter(BlogTag.tag == tag).all()
            return [blog_id[0] for blog_id in blog_ids]


# Timeline
class Timeline(Base, BaseModel):
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
        CheckConstraint('phase IN (1, 2, 3, 4, 5, 6, 7, 8, 9)', name='phase_check'),
        Index('idx_timeline_phase', 'phase'),
        Index('idx_timeline_name', 'name'),
    )
    
    @staticmethod
    def createDatabase():
        Base.metadata.create_all(engine)

    @staticmethod
    def insert(phase, name, release_date, synopsis, img_path):
        with db_session() as session:
            project = Timeline(
                phase=phase, 
                name=name, 
                release_date=release_date, 
                synopsis=synopsis, 
                posterpath=img_path
            )
            session.add(project)

    @staticmethod
    @cached(ttl=60, key_prefix="timeline_phase")
    def queryPhase(phaseno):
        with db_session() as session:
            posts = session.query(Timeline).filter(Timeline.phase == phaseno).all()
            
            if posts:
                # Create dict representations inside the session
                result = [post.to_dict() for post in posts]
                return result
            else:
                return 404

    @staticmethod
    @cached(ttl=60, key_prefix="timeline_id")  
    def queryId(id):
        with db_session() as session:
            project = session.query(Timeline).filter(Timeline.id == id).first()
            
            if project:
                return project.to_dict()
            else:
                return 404
        
    @staticmethod
    @cached(ttl=300, key_prefix="timeline_all")  # Cache for 5 minutes
    def queryAll():
        with db_session() as session:
            projects = session.query(Timeline).all()
            # Create dict representations inside the session
            return [project.to_dict() for project in projects]
    
    @staticmethod
    def query_by_ids(ids, page=1, limit=5):
        result = BaseRepository.query_by_ids(
            model=Timeline,
            ids=ids,
            page=page,
            limit=limit
        )
        
        # Rename 'items' key to 'projects' for API consistency
        result['projects'] = result.pop('items')
        return result
    
    @staticmethod
    def populateNewDB(project):
        with db_session() as session:
            newProject = Timeline(
                phase=project.phase, 
                name=project.name, 
                release_date=project.release_date, 
                synopsis=project.synopsis, 
                posterpath=project.posterpath, 
                castinfo=project.castinfo, 
                director=project.director, 
                musicartist=project.musicartist, 
                timelineid=project.timelineid
            )
            session.add(newProject)
            
        # Clear cache
        cache.delete("timeline_all")
        cache.delete(f"timeline_phase:{project.phase}")
        
    @staticmethod
    def forPopulate():
        with db_session() as session:
            result = session.query(Timeline.name).all()
            return [j for i in result for j in i]
    
    @staticmethod
    def updateViaTkinter(name, syn, cast, direc, musicd, timelinepos):
        with db_session() as session:
            timeline = session.query(Timeline).filter(Timeline.name == name).first()
            if timeline:
                timeline.synopsis = syn
                timeline.castinfo = cast
                timeline.director = direc
                timeline.musicartist = musicd
                timeline.timelineid = timelinepos
                
                # Cache specific timeline id for faster invalidation
                timeline_id = timeline.id
                
        # Clear cache        
        cache.delete("timeline_all")
        cache.delete(f"timeline_id:{timeline_id}")
        cache.delete(f"timeline_phase:{timeline.phase}")
    
    @staticmethod
    def getTkinterContent(name):
        with db_session() as session:
            return session.query(Timeline.synopsis, Timeline.musicartist, 
                               Timeline.director, Timeline.castinfo).filter(Timeline.name == name).first()

    @staticmethod
    def removeDuplicates():
        with db_session() as session:
            duplicates = session.query(Timeline).filter(Timeline.id > 23).all()
            for item in duplicates:
                session.delete(item)
            
        # Clear cache
        cache.delete("timeline_all")
        for i in range(1, 10):  # Clear all phase caches
            cache.delete(f"timeline_phase:{i}")


# Reviews
class Reviews(Base, BaseModel):
    __tablename__ = 'reviews'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(255))
    author = sqlalchemy.Column(sqlalchemy.String(30))
    description = sqlalchemy.Column(sqlalchemy.Text)
    content = sqlalchemy.Column(sqlalchemy.JSON)
    thumbnail_path = sqlalchemy.Column(sqlalchemy.JSON)
    created_at = sqlalchemy.Column(sqlalchemy.String(75))
    updated_at = sqlalchemy.Column(sqlalchemy.String(75))
    
    # Add indexes for commonly queried columns
    __table_args__ = (
        Index('idx_review_author', 'author'),
        Index('idx_review_title', 'title'),
        Index('idx_review_created_at', 'created_at'),
    )

    @staticmethod
    def createDatabase():
        Base.metadata.create_all(engine)

    @staticmethod
    def insertReview(title, author, description, content, tags, thumbnail_path):
        with db_session() as session:
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
            session.flush()  # Get ID before committing
            review_id = review.id

        # Add tags after creating review
        ReviewTag.add_tags(review_id, tags)
        
        # Clear caches
        cache.delete("review_tags")
        cache.delete("review_authors")
        
        return review_id

    @staticmethod
    @cached(ttl=60, key_prefix="review_count")
    def count():
        with db_session() as session:
            return session.query(Reviews).count()

    @staticmethod
    @cached(ttl=30, key_prefix="review_paginated")
    def queryPaginated(page, limit=3):
        with db_session(expire_on_commit=False) as session:
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

            # Process reviews INSIDE the session
            reviews_json = []
            for review in reviews:
                review_dict = review.to_dict()  # Convert to dict inside session
                
                # Get tags from ReviewTag
                review_dict['tags'] = ReviewTag.get_tags(review.id, session=session)
                
                # Ensure JSON fields are properly parsed
                for field in ['content', 'thumbnail_path']:
                    if field in review_dict and isinstance(review_dict[field], str):
                        try:
                            review_dict[field] = json.loads(review_dict[field])
                        except json.JSONDecodeError:
                            pass

                reviews_json.append(review_dict)

            return reviews_json

    @staticmethod
    @cached(ttl=10, key_prefix="review_by_id")
    def query(id):
        with db_session() as session:
            review = session.query(Reviews).filter(Reviews.id == id).first()
            
            if review:
                review_dict = review.to_dict()
                # Get tags from ReviewTag
                review_dict['tags'] = ReviewTag.get_tags(review.id, session=session)
                
                # Parse JSON fields if needed
                for field in ['content', 'thumbnail_path']:
                    if field in review_dict and isinstance(review_dict[field], str):
                        try:
                            review_dict[field] = json.loads(review_dict[field])
                        except json.JSONDecodeError:
                            pass
                            
                return review_dict
            else:
                return 404
    
    @staticmethod
    @cached(ttl=30, key_prefix="review_latest")
    def queryLatest():
        with db_session() as session:
            latest = session.query(Reviews).with_entities(
                Reviews.id,
                Reviews.title,
                Reviews.author,
                Reviews.created_at,
                Reviews.thumbnail_path
            ).order_by(Reviews.created_at.desc()).limit(3).all()
            
            latest_dict = []
            for review in latest:
                review_data = {
                    'id': review.id,
                    'title': review.title,
                    'author': review.author,
                    'created_at': review.created_at,
                    'thumbnail_path': review.thumbnail_path
                }
                
                # Parse JSON fields if needed
                if isinstance(review_data['thumbnail_path'], str):
                    try:
                        review_data['thumbnail_path'] = json.loads(review_data['thumbnail_path'])
                    except json.JSONDecodeError:
                        pass
                        
                latest_dict.append(review_data)
            
            return latest_dict
    
    @staticmethod
    def query_by_ids(ids, page=1, limit=5):
        result = BaseRepository.query_by_ids(
            model=Reviews,
            ids=ids,
            page=page,
            limit=limit,
            include_tags=True,
            tag_getter=ReviewTag.get_tags
        )
        
        # Rename 'items' key to 'blogs' for API consistency
        result['reviews'] = result.pop('items')
        return result

    @staticmethod
    def query_authors_by_ids(ids):
        return BaseRepository.query_authors_by_ids(Reviews, ids)

    @staticmethod
    def query_tags_by_ids(ids):
        if not ids:
            return []
                
        # Get all tags for the specified review IDs
        tags = []
        for review_id in ids:
            review_tags = ReviewTag.get_tags(review_id)
            tags.extend(review_tags)
                
        # Remove duplicates and sort
        return sorted(list(set(tags)))

    @staticmethod
    def update(id, title, author, description, content, tags, thumbnail_path):
        with db_session() as session:
            review = session.query(Reviews).filter_by(id=id).first()

            if not review:
                return 404

            review.title = title
            review.author = author
            review.description = description
            review.content = content
            review.thumbnail_path = thumbnail_path
            review.updated_at = datetime.strftime(datetime.now(), DATETIMEFORMAT)

        # Update tags
        ReviewTag.add_tags(id, tags)
        
        # Clear caches
        cache.delete(f"review_by_id:{id}")
        cache.delete("review_tags")
        cache.delete("review_authors")
        cache.delete("review_paginated")
        
        return True

    @staticmethod
    def delete(id):
        with db_session() as session:
            review = session.query(Reviews).filter_by(id=id).first()

            if review:
                session.delete(review)
                
                # Clear caches
                cache.delete(f"review_by_id:{id}")
                cache.delete("review_tags")
                cache.delete("review_authors")
                cache.delete("review_paginated")
                cache.delete("review_count")
                cache.delete("review_latest")
                
                return True
            
            return False

    @staticmethod
    def search(query="", tags=None, author="", page=1, limit=5):
        result = BaseRepository.search(
            model=Reviews,
            query=query,
            tags=tags,
            author=author,
            page=page,
            limit=limit,
            tag_model=ReviewTag,
            item_id_field="review_id",
            tag_getter=ReviewTag.get_tags
        )
        
        # Process JSON fields if needed
        for item in result['items']:
            for field in ['content', 'thumbnail_path']:
                if field in item and isinstance(item[field], str):
                    try:
                        item[field] = json.loads(item[field])
                    except json.JSONDecodeError:
                        pass
        
        # Rename 'items' key to 'reviews' for API consistency
        result['blogs'] = result.pop('items')
        return result

    @staticmethod
    @cached(ttl=60, key_prefix="review_tags")
    def get_all_tags():
        with db_session() as session:
            tags = session.query(ReviewTag.tag).distinct().all()
            return sorted([tag[0] for tag in tags])

    @staticmethod
    @cached(ttl=60, key_prefix="review_authors")
    def get_all_authors():
        with db_session() as session:
            authors = session.query(Reviews.author).distinct().all()
            return sorted([author[0] for author in authors])


class ReviewTag(Base, BaseModel):
    __tablename__ = 'review_tags'
    
    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    review_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('reviews.id', ondelete='CASCADE'))
    tag = sqlalchemy.Column(sqlalchemy.String(50))
    
    # Add indexes for commonly queried columns
    __table_args__ = (
        Index('idx_reviewtag_reviewid', 'review_id'),
        Index('idx_reviewtag_tag', 'tag'),
    )
    
    @staticmethod
    def createDatabase():
        Base.metadata.create_all(engine)
    
    @staticmethod
    def add_tags(review_id, tags):
        with db_session() as session:
            # First remove any existing tags for this review
            session.query(ReviewTag).filter(ReviewTag.review_id == review_id).delete()
            
            # Add new tags
            for tag in tags:
                review_tag = ReviewTag(review_id=review_id, tag=tag)
                session.add(review_tag)
                
        # Clear tag cache with more specific key pattern
        cache.delete("review_tags")
        cache.delete(f"review_tags_by_id:{review_id}")
    
    @staticmethod
    @cached(ttl=30, key_prefix="review_tags_by_id")
    def get_tags(review_id, session=None):
        if session is None:
            with db_session() as new_session:
                tags = new_session.query(ReviewTag.tag).filter(ReviewTag.review_id == review_id).all()
                return [tag[0] for tag in tags]
        else:
            tags = session.query(ReviewTag.tag).filter(ReviewTag.review_id == review_id).all()
            return [tag[0] for tag in tags]
    
    @staticmethod
    @cached(ttl=30, key_prefix="reviews_by_tag")
    def find_reviews_by_tag(tag):
        with db_session() as session:
            review_ids = session.query(ReviewTag.review_id).filter(ReviewTag.tag == tag).all()
            return [review_id[0] for review_id in review_ids]

# Migration code (only run when needed)
def migrate_tags():
    with db_session() as session:
        # Migrate blog tags
        blogs = session.query(BlogPost).all()
        for blog in blogs:
            if hasattr(blog, 'tags') and blog.tags:
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
            if hasattr(review, 'tags') and review.tags:
                tags = review.tags
                if isinstance(tags, str):
                    try:
                        tags = json.loads(tags)
                    except json.JSONDecodeError:
                        tags = []
                ReviewTag.add_tags(review.id, tags)
    
    print('Tag migration complete')


if __name__ == '__main__':
    # Create tables if they don't exist
    Base.metadata.create_all(engine)
    
    # Add any required maintenance or migration steps
    # Uncomment if needed:
    # migrate_tags()