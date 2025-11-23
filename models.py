# models.py
from sqlalchemy import Column, Integer, String, Float, Enum, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

# Enum para Categoria do Produto
class CategoriaProduto(str, enum.Enum):
    PERECIVEL = "PERECIVEL"
    NAO_PERECIVEL = "NAO_PERECIVEL"

# Enum para Tipo de Movimentação
class TipoMovimentacao(str, enum.Enum):
    ENTRADA = "ENTRADA"
    SAIDA = "SAIDA"

class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    categoria = Column(Enum(CategoriaProduto), nullable=False)
    preco_unitario = Column(Float, nullable=False)
    quantidade_minima = Column(Integer, default=0)
    saldo_estoque = Column(Integer, default=0) # Saldo atual
    data_criacao = Column(DateTime, default=datetime.now)

    movimentacoes = relationship("MovimentacaoEstoque", back_populates="produto")

class MovimentacaoEstoque(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    tipo = Column(Enum(TipoMovimentacao), nullable=False)
    quantidade = Column(Integer, nullable=False)
    data_movimentacao = Column(DateTime, default=datetime.now)
    lote = Column(String, nullable=True) # Para perecíveis
    data_validade = Column(Date, nullable=True) # Para perecíveis (usando Date para corresponder ao Pydantic date)

    produto = relationship("Produto", back_populates="movimentacoes")
