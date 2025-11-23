# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL do banco de dados SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./estoque.db"

# Cria o motor do banco de dados
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Cria a classe base para os modelos declarativos
Base = declarative_base()

# Configura a sessão do banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função para obter a sessão do banco de dados (dependência para o FastAPI)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
