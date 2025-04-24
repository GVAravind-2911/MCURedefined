from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer, Boolean, select, ForeignKey, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
from datetime import datetime, timedelta
import secrets
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List

# Load environment variables
load_dotenv()

# Database connection settings
DB_HOST = os.getenv("PG_DB_HOST", "localhost")
DB_PORT = os.getenv("PG_DB_PORT", "5432")
DB_NAME = os.getenv("PG_DB_NAME", "mcu_redefined")
DB_USER = os.getenv("PG_DB_USER", "postgres")
DB_PASSWORD = os.getenv("PG_DB_PASSWORD", "")

# Create SQLAlchemy engine
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

# Create base class for our models
Base = declarative_base()

# Define SQLAlchemy models that mirror your Drizzle schema
class User(Base):
    __tablename__ = "user"
    
    # Match Drizzle schema - text-based primary key
    id = Column(Text, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    email_verified = Column(Boolean, nullable=False, default=False)
    image = Column(Text)
    account_type = Column(String, nullable=False, default="user")  # admin, user, etc.
    password = Column(Text)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)


class Session(Base):
    __tablename__ = "session"
    
    # Match Drizzle schema - text-based primary key and foreign key
    id = Column(Text, primary_key=True)
    user_id = Column(Text, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    token = Column(Text, unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(Text)
    user_agent = Column(Text)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)


# Create a session factory
SessionFactory = sessionmaker(bind=engine)


class UserDBManager:
    def __init__(self):
        # Create a new session for operations
        self.session = SessionFactory()
    
    def close(self):
        """Close the session when done"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
    
    def validate_admin_token(self, token: str) -> bool:
        """
        Check if a token belongs to an admin user and is still valid
        
        Args:
            token: Session token to validate
            
        Returns:
            bool: True if token belongs to an admin user and is valid, False otherwise
        """
        if not token:
            return False
        
        try:
            # Query for the session with the given token that hasn't expired
            stmt = select(Session).where(
                Session.token == token,
                Session.expires_at > datetime.now()
            )
            session_obj = self.session.execute(stmt).scalar_one_or_none()
            
            if not session_obj:
                return False
            
            # Get the user associated with this session using a separate query
            user_stmt = select(User).where(User.id == session_obj.user_id)
            user = self.session.execute(user_stmt).scalar_one_or_none()
            
            if not user:
                return False
            
            # Check if the user is an admin and active
            if user.account_type == "admin" and user.email_verified:
                return True
                
            return False
        
        except Exception as e:
            print(f"Error validating admin token: {e}")
            return False
    
    def get_user_from_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Get user details from a token
        
        Args:
            token: Session token
            
        Returns:
            Optional[Dict]: User details or None if token is invalid
        """
        if not token:
            return None
            
        try:
            # Query for the session first
            stmt = select(Session).where(
                Session.token == token,
                Session.expires_at > datetime.now()
            )
            session_obj = self.session.execute(stmt).scalar_one_or_none()
            
            if not session_obj:
                return None
            
            # Then query for the user
            user_stmt = select(User).where(User.id == session_obj.user_id)
            user = self.session.execute(user_stmt).scalar_one_or_none()
            
            if not user:
                return None
                
            # Return user details without sensitive information
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "email_verified": user.email_verified,
                "image": user.image,
                "account_type": user.account_type,
                "created_at": user.created_at
            }
            
        except Exception as e:
            print(f"Error getting user from token: {e}")
            return None
    
    def is_session_valid(self, token: str) -> bool:
        """
        Check if a session token is valid
        
        Args:
            token: Session token to validate
            
        Returns:
            bool: True if token is valid, False otherwise
        """
        try:
            stmt = select(Session).where(
                Session.token == token,
                Session.expires_at > datetime.now()
            )
            session = self.session.execute(stmt).scalar_one_or_none()
            return session is not None
        except Exception as e:
            print(f"Error validating session: {e}")
            return False
    
    def create_session(self, user_id: str, ip_address: str = None, user_agent: str = None, 
                        expiry_days: int = 30) -> Optional[str]:
        """
        Create a new session for a user
        
        Args:
            user_id: User ID
            ip_address: Client IP address
            user_agent: Client user agent string
            expiry_days: Session validity in days
            
        Returns:
            Optional[str]: New session token or None if error
        """
        try:
            # First check if the user exists
            user_stmt = select(User).where(User.id == user_id)
            user = self.session.execute(user_stmt).scalar_one_or_none()
            
            if not user:
                print(f"User with ID {user_id} not found")
                return None
            
            # Generate a secure token
            token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(days=expiry_days)
            session_id = secrets.token_urlsafe(16)  # Generate ID for the session
            
            # Create new session
            new_session = Session(
                id=session_id,
                user_id=user_id,
                token=token,
                expires_at=expires_at,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.session.add(new_session)
            self.session.commit()
            
            return token
        
        except Exception as e:
            self.session.rollback()
            print(f"Error creating session: {e}")
            return None
    
    def revoke_token(self, token: str) -> bool:
        """
        Revoke a session token
        
        Args:
            token: Session token to revoke
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            stmt = select(Session).where(Session.token == token)
            session_obj = self.session.execute(stmt).scalar_one_or_none()
            
            if session_obj:
                # Set expiry to now to invalidate
                session_obj.expires_at = datetime.now()
                self.session.commit()
                return True
                
            return False
        
        except Exception as e:
            self.session.rollback()
            print(f"Error revoking token: {e}")
            return False
    
    def get_all_sessions_for_user(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all active sessions for a user
        
        Args:
            user_id: User ID
            
        Returns:
            List[Dict]: List of session information dictionaries
        """
        try:
            stmt = select(Session).where(
                Session.user_id == user_id,
                Session.expires_at > datetime.now()
            )
            sessions = self.session.execute(stmt).scalars().all()
            
            return [{
                "id": session.id,
                "token": session.token,
                "expires_at": session.expires_at,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent,
                "created_at": session.created_at
            } for session in sessions]
            
        except Exception as e:
            print(f"Error getting user sessions: {e}")
            return []


# Example usage functions for convenient imports
def is_admin(token: str) -> bool:
    """Convenient function to check if a token belongs to an admin"""
    with UserDBManager() as manager:
        return manager.validate_admin_token(token)


def get_user(token: str) -> Optional[Dict[str, Any]]:
    """Convenient function to get user details from a token"""
    with UserDBManager() as manager:
        return manager.get_user_from_token(token)


def is_token_valid(token: str) -> bool:
    """Convenient function to check if a token is valid"""
    with UserDBManager() as manager:
        return manager.is_session_valid(token)


if __name__ == "__main__":
    # Test functionality
    with UserDBManager() as manager:
        # Example: Check if a token belongs to an admin
        test_token = "some_token_here"
        is_valid_admin = manager.validate_admin_token(test_token)
        print(f"Is valid admin? {is_valid_admin}")
        
        # Get user details
        user_details = manager.get_user_from_token(test_token)
        if user_details:
            print(f"User: {user_details['name']}, Account type: {user_details['account_type']}")