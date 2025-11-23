// src/services/RelatorioService.ts
import { AppDataSource } from "../database/sqlite";
import { Produto, CategoriaProduto } from "../models/Produto";
import { Movimentacao, TipoMovimentacao } from "../models/Movimentacao";
import { subDays } from "date-fns";

const produtoRepository = AppDataSource.getRepository(Produto);
const movimentacaoRepository = AppDataSource.getRepository(Movimentacao);

export class RelatorioService {
    async calcularValorTotalEstoque(): Promise<number> {
        // Regra de Negócio: Calcular valor total do estoque (quantidade × preço)
        const produtos = await produtoRepository.find();
        const valorTotal = produtos.reduce((acc, p) => acc + (p.saldo_estoque * p.preco_unitario), 0);
        return parseFloat(valorTotal.toFixed(2));
    }

    async listarProdutosAVencer(dias: number = 7): Promise<Produto[]> {
        // Regra de Negócio: Listar produtos que vencerão em até 7 dias
        const dataLimite = subDays(new Date(), -dias); // Data atual + 7 dias

        // 1. Encontrar IDs dos produtos perecíveis com movimentações a vencer
        const movimentacoesAVencer = await movimentacaoRepository
            .createQueryBuilder("movimentacao")
            .innerJoinAndSelect("movimentacao.produto", "produto")
            .where("produto.categoria = :categoria", { categoria: CategoriaProduto.PERECIVEL })
            .andWhere("movimentacao.data_validade <= :dataLimite", { dataLimite: dataLimite.toISOString().split('T')[0] })
            .getMany();

        const produtosIds = [...new Set(movimentacoesAVencer.map(m => m.produto_id))];

        if (produtosIds.length === 0) {
            return [];
        }

        // 2. Buscar os produtos únicos
        const produtosAVencer = await produtoRepository
            .createQueryBuilder("produto")
            .where("produto.id IN (:...ids)", { ids: produtosIds })
            .getMany();

        return produtosAVencer;
    }
}
