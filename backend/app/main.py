from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import verify

app = FastAPI(title="TruthLens API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "TruthLens"}
