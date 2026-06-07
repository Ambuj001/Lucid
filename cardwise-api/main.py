from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, cards, engine as engine_router
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="CardWise AI — Recommendation API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, cards, engine as engine_router, deals

app.include_router(auth.router)
app.include_router(cards.router)
app.include_router(engine_router.router)
app.include_router(deals.router)

@app.get("/")
async def root():
    return {"service": "CardWise AI API", "status": "running", "version": "1.0.0"}
