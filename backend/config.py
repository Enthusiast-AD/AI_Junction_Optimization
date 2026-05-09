import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GOOGLE_AI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    
    GROQ_PRIMARY_MODEL: str = "llama-3.1-8b-instant"
    GROQ_ANALYSIS_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    OPENROUTER_FALLBACK_MODEL: str = "deepseek/deepseek-chat:free"
    
    SIMULATION_SPEED_MULTIPLIER: int = 1
    DATABASE_URL: str = "postgresql://user:password@hostname.neon.tech/dbname?sslmode=require"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
