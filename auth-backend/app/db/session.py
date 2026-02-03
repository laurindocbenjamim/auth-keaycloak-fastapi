import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings

# Debug: Mostre a URL que está sendo usada
print(f"DEBUG: DATABASE_URL from settings = '{settings.DATABASE_URL}'")
print(f"DEBUG: DATABASE_URL from os.getenv = '{os.getenv('DATABASE_URL')}'")

# Verifique se a URL não está vazia
if not settings.DATABASE_URL or settings.DATABASE_URL.isspace():
    print("ERROR: DATABASE_URL is empty or None!")
    # Use um valor padrão explícito
    database_url = "sqlite:///./app.db"
else:
    database_url = settings.DATABASE_URL.strip()

print(f"DEBUG: Using database URL = '{database_url}'")

# Para SQLite, garanta que o diretório existe
if database_url.startswith("sqlite"):
    # Extrai o caminho do arquivo
    db_path = database_url.replace("sqlite:///", "")
    print(f"DEBUG: SQLite file path = '{db_path}'")
    
    # Cria diretório se não existir
    import os
    db_dir = os.path.dirname(db_path)
    if db_dir:
        os.makedirs(db_dir, exist_ok=True)
        print(f"DEBUG: Created directory '{db_dir}'")

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {},
    echo=True  # Ative para ver queries SQL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)