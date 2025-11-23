// src/services/MovimentacaoService.ts
import { AppDataSource } from "../database/sqlite";
import { Produto, CategoriaProduto } from "../models/Produto";
import { Movimentacao, TipoMovimentacao } from "../models/Movimentacao";
import { MovimentacaoCreate } from "../schemas/movimentacaoSchema";
import { ProdutoNaoEncontrado, ValidacaoProduto, EstoqueInsuficiente } from "./EstoqueErrors";
import { LessThanOrEqual } from "typeorm";
import { format } from "date-fns";

const produtoRepository = AppDataSource.getRepository(Produto);
const movimentacaoRepository = AppDataSource.getRepository(Movimentacao);

export class MovimentacaoService {
    async createMovimentacao(movData: MovimentacaoCreate): Promise<Movimentacao> {
        const produto = await produtoRepository.findOneBy({ id: movData.produto_id });
        if (!produto) {
            throw new ProdutoNaoEncontrado(movData.produto_id);
        }

        // Regra de Negócio: Produtos perecíveis devem ter lote e data de validade
        if (produto.categoria === CategoriaProduto.PERECIVEL) {
            if (!movData.lote || !movData.data_validade) {
                throw new ValidacaoProduto("Produtos perecíveis requerem Lote e Data de Validade.");
            }
            
            // Regra de Negócio Complexa: Produto perecível não pode ter movimentação após data de validade
            const dataValidade = movData.data_validade;
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0); 
            
            if (dataValidade < hoje) {
                throw new ValidacaoProduto(`A data de validade (${format(dataValidade, 'yyyy-MM-dd')}) é anterior à data atual. Movimentação não permitida.`);
            }
        }

        // Regra de Negócio: Ao registrar saída, deve verificar se há estoque suficiente
        if (movData.tipo === TipoMovimentacao.SAIDA) {
            if (produto.saldo_estoque < movData.quantidade) {
                throw new EstoqueInsuficiente(produto.nome, produto.saldo_estoque, movData.quantidade);
            }
            // Atualiza saldo do produto automaticamente
            produto.saldo_estoque -= movData.quantidade;
        } else if (movData.tipo === TipoMovimentacao.ENTRADA) {
            // Atualiza saldo do produto automaticamente
            produto.saldo_estoque += movData.quantidade;
        }

        // Cria a movimentação
        const novaMovimentacao = movimentacaoRepository.create(movData);
        
        // Salva a movimentação e atualiza o produto numa transação
        await AppDataSource.manager.transaction(async transactionalEntityManager => {
            await transactionalEntityManager.save(novaMovimentacao);
            await transactionalEntityManager.save(produto);
        });

        return novaMovimentacao;
    }
}
