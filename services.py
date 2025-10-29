# services.py
from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from . import models, schemas
from .models import CategoriaProduto, TipoMovimentacao

# --- Exceções Personalizadas ---
class EstoqueException(Exception):
    """Base para exceções de estoque"""
    pass

class ProdutoNaoEncontrado(EstoqueException):
    """Produto não existe no sistema"""
    pass

class ValidacaoProduto(EstoqueException):
    """Erro de validação de dados do produto ou movimentação"""
    pass

class EstoqueInsuficiente(ValidacaoProduto):
    """Tentativa de saída com quantidade maior que estoque disponível"""
    pass

class ProdutoVencido(ValidacaoProduto):
    """Tentativa de movimentação (entrada/saída) de produto já vencido"""
    pass

# --- Serviço de Produto ---

def create_produto(db: Session, produto: schemas.ProdutoCreate):
    # Regra de Negócio: Validar unicidade do SKU
    db_produto = db.query(models.Produto).filter(models.Produto.sku == produto.sku).first()
    if db_produto:
        raise ValidacaoProduto(f"Produto com SKU '{produto.sku}' já existe.")
    
    db_produto = models.Produto(**produto.dict())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def get_produtos_abaixo_minimo(db: Session):
    # Regra de Negócio: Produtos abaixo da quantidade mínima devem gerar alerta
    return db.query(models.Produto).filter(models.Produto.saldo_estoque < models.Produto.quantidade_minima).all()

# --- Serviço de Movimentação ---

def create_movimentacao(db: Session, mov: schemas.MovimentacaoCreate):
    produto = db.query(models.Produto).filter(models.Produto.id == mov.produto_id).first()
    if not produto:
        raise ProdutoNaoEncontrado(f"Produto com ID {mov.produto_id} não encontrado.")

    # Regra de Negócio: Produtos perecíveis devem ter lote e data de validade
    if produto.categoria == CategoriaProduto.PERECIVEL:
        if not mov.lote or not mov.data_validade:
            # Cenário de Validação: Tentativa de cadastrar produto perecível sem data de validade
            raise ValidacaoProduto("Produtos perecíveis requerem Lote e Data de Validade.")
        
        # Regra de Negócio Complexa: Produto perecível não pode ter movimentação após data de validade
        if mov.data_validade < date.today():
            raise ProdutoVencido(f"A data de validade ({mov.data_validade}) é anterior à data atual. Movimentação não permitida.")

    # Regra de Negócio: Ao registrar saída, deve verificar se há estoque suficiente
    if mov.tipo == TipoMovimentacao.SAIDA:
        # Cenário de Validação: Tentativa de saída com quantidade maior que estoque disponível
        if produto.saldo_estoque < mov.quantidade:
            raise EstoqueInsuficiente(f"Estoque insuficiente para o produto {produto.nome}. Saldo atual: {produto.saldo_estoque}, Saída solicitada: {mov.quantidade}")
        
        # Atualiza saldo do produto automaticamente
        produto.saldo_estoque -= mov.quantidade
    
    elif mov.tipo == TipoMovimentacao.ENTRADA:
        # Atualiza saldo do produto automaticamente
        produto.saldo_estoque += mov.quantidade
    
    # Cria a movimentação
    db_mov = models.MovimentacaoEstoque(**mov.dict())
    db.add(db_mov)
    db.commit()
    db.refresh(produto)
    db.refresh(db_mov)
    return db_mov

# --- Serviço de Relatórios ---

def calcular_valor_total_estoque(db: Session):
    # Regra de Negócio: Calcular valor total do estoque (quantidade × preço)
    produtos = db.query(models.Produto).all()
    valor_total = sum(p.saldo_estoque * p.preco_unitario for p in produtos)
    return valor_total

def listar_produtos_a_vencer(db: Session, dias: int = 7):
    # Regra de Negócio: Listar produtos que vencerão em até 7 dias
    data_limite = date.today() + timedelta(days=dias)
    
    # Filtra movimentações de ENTRADA (pois é onde a validade é registrada)
    # e agrupa por produto para listar apenas o produto
    movimentacoes_a_vencer = db.query(models.MovimentacaoEstoque).join(models.Produto).filter(
        models.Produto.categoria == CategoriaProduto.PERECIVEL,
        models.MovimentacaoEstoque.data_validade <= data_limite
    ).all()
    
    # Retorna uma lista de produtos únicos que têm movimentações a vencer
    produtos_ids = set(m.produto_id for m in movimentacoes_a_vencer)
    produtos_a_vencer = db.query(models.Produto).filter(models.Produto.id.in_(produtos_ids)).all()
    
    return produtos_a_vencer
