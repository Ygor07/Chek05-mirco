# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, services
from .database import engine, get_db

# Cria as tabelas no banco de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Gestão de Estoque", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Sistema de Gestão de Estoque"}

# --- Rotas de Produto ---

@app.post("/produtos/", response_model=schemas.ProdutoResponse, status_code=status.HTTP_201_CREATED)
def criar_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    try:
        return services.create_produto(db=db, produto=produto)
    except services.ValidacaoProduto as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.get("/produtos/", response_model=list[schemas.ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):
    return db.query(models.Produto).all()

# --- Rotas de Movimentação ---

@app.post("/movimentacoes/", response_model=schemas.MovimentacaoResponse, status_code=status.HTTP_201_CREATED)
def criar_movimentacao(mov: schemas.MovimentacaoCreate, db: Session = Depends(get_db)):
    try:
        return services.create_movimentacao(db=db, mov=mov)
    except services.ProdutoNaoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except services.EstoqueInsuficiente as e:
        # Cenário de Validação: Tentativa de saída com quantidade maior que estoque disponível
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except services.ProdutoVencido as e:
        # Cenário de Validação: Produto perecível não pode ter movimentação após data de validade
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except services.ValidacaoProduto as e:
        # Cenário de Validação: Tentativa de cadastrar produto perecível sem data de validade
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# --- Rotas de Relatórios ---

@app.get("/relatorios/valor_total_estoque/")
def relatorio_valor_total(db: Session = Depends(get_db)):
    valor = services.calcular_valor_total_estoque(db)
    return {"valor_total_estoque": round(valor, 2)}

@app.get("/relatorios/estoque_minimo/", response_model=list[schemas.ProdutoResponse])
def relatorio_estoque_minimo(db: Session = Depends(get_db)):
    # Regra de Negócio: Identificar produtos com estoque abaixo do mínimo
    return services.get_produtos_abaixo_minimo(db)

@app.get("/relatorios/produtos_a_vencer/", response_model=list[schemas.ProdutoResponse])
def relatorio_produtos_a_vencer(db: Session = Depends(get_db)):
    # Regra de Negócio: Listar produtos que vencerão em até 7 dias
    return services.listar_produtos_a_vencer(db)
