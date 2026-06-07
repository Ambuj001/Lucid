import os, re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User
from schemas import UserCreate, UserOut, Token
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def verify_password(plain, hashed): return pwd_ctx.verify(plain, hashed)
def hash_password(password):        return pwd_ctx.hash(password)

def create_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=EXPIRE_MIN))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    cred_exc = HTTPException(status_code=401, detail="Could not validate credentials",
                             headers={"WWW-Authenticate": "Bearer"})
    try:
        email = None
        # 1. Try custom local JWT token verification
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
        except Exception:
            # 2. Try Firebase unverified claims fallback or expired local token sub fallback
            try:
                from jose import jwt as jose_jwt
                payload = jose_jwt.get_unverified_claims(token)
                email = payload.get("email") or payload.get("sub")
            except Exception:
                pass
        
        if email is None:
            raise cred_exc
    except Exception:
        raise cred_exc
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    # Auto-register/sync Firebase user in local SQLite DB if not found
    if user is None:
        try:
            user = User(email=email, hashed_password="firebase_auth_user")
            db.add(user)
            await db.commit()
            await db.refresh(user)
        except Exception:
            await db.rollback()
            # Fetch again in case another concurrent request committed first
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            if not user:
                raise cred_exc
        
    return user

@router.post("/register", response_model=UserOut, status_code=201)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, hashed_password=hash_password(body.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form.username))
    user = result.scalars().first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    token = create_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
