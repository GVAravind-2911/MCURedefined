"""
Migration script to add author_id column to blog_posts and reviews tables.
This creates a cross-database foreign key reference to the user table in PostgreSQL.

Usage: python -m migrations.run_migration
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import content_engine


def run_migration():
    """Run the author_id migration."""
    
    with content_engine.connect() as conn:
        # Check if column exists in blog_posts
        result = conn.execute(text("PRAGMA table_info(blog_posts)"))
        columns = [row[1] for row in result.fetchall()]
        
        if "author_id" not in columns:
            print("Adding author_id column to blog_posts...")
            conn.execute(text("ALTER TABLE blog_posts ADD COLUMN author_id TEXT"))
            print("✓ Added author_id to blog_posts")
        else:
            print("✓ author_id already exists in blog_posts")
        
        # Check if column exists in reviews
        result = conn.execute(text("PRAGMA table_info(reviews)"))
        columns = [row[1] for row in result.fetchall()]
        
        if "author_id" not in columns:
            print("Adding author_id column to reviews...")
            conn.execute(text("ALTER TABLE reviews ADD COLUMN author_id TEXT"))
            print("✓ Added author_id to reviews")
        else:
            print("✓ author_id already exists in reviews")
        
        # Create indexes (these are idempotent)
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_blog_author_id ON blog_posts(author_id)"))
            print("✓ Created index idx_blog_author_id")
        except Exception as e:
            print(f"Index idx_blog_author_id already exists or error: {e}")
        
        try:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_review_author_id ON reviews(author_id)"))
            print("✓ Created index idx_review_author_id")
        except Exception as e:
            print(f"Index idx_review_author_id already exists or error: {e}")
        
        conn.commit()
        print("\n✓ Migration completed successfully!")


if __name__ == "__main__":
    print("Running author_id migration...")
    print("=" * 50)
    run_migration()
