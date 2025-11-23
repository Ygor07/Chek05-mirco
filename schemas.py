# schemas.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, date
from .models import CategoriaProduto, TipoMovimentacao

# --- Schemas Base ---

class ProdutoBase(BaseModel):
    sku: str = Field(..., description="Código SKU do produto (identificador único)")
    nome: str = Field(..., description="Nome do produto")
    categoria: CategoriaProduto = Field(..., description="Categoria (PERECIVEL, NAO_PERECIVEL)")
    preco_unitario: float = Field(..., gt=0, description="Preço unitário (deve ser maior que zero)")
    quantidade_minima: int = Field(default=0, ge=0, description="Quantidade mínima em estoque (default 0)")

    class Config:
        use_enum_values = True # Permite que o enum seja usado como string

class MovimentacaoBase(BaseModel):
    produto_id: int = Field(..., description="ID do produto movimentado")
    tipo: TipoMovimentacao = Field(..., description="Tipo de movimentação (ENTRADA, SAIDA)")
    quantidade: int = Field(..., gt=0, description="Quantidade movimentada (deve ser positiva)")
    lote: Optional[str] = Field(None, description="Lote (obrigatório para perecíveis)")
    data_validade: Optional[date] = Field(None, description="Data de validade (obrigatório para perecíveis)")

    class Config:
        use_enum_values = True

# --- Schemas para Criação e Resposta ---

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoResponse(ProdutoBase):
    id: int
    saldo_estoque: int
    data_criacao: datetime

    class Config:
        orm_mode = True # Permite mapear de um objeto SQLAlchemy

class MovimentacaoCreate(MovimentacaoBase):
    pass

class MovimentacaoResponse(MovimentacaoBase):
    id: int
    data_movimentacao: datetime

    class Config:
        orm_mode = True
