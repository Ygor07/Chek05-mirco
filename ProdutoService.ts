// src/services/ProdutoService.ts
import { AppDataSource } from "../database/sqlite";
import { Produto, CategoriaProduto } from "../models/Produto";
import { ProdutoCreate } from "../schemas/produtoSchema";
import { ProdutoJaExiste } from "./EstoqueErrors";

const produtoRepository = AppDataSource.getRepository(Produto);

export class ProdutoService {
    async createProduto(produtoData: ProdutoCreate): Promise<Produto> {
        // Regra de Negócio: Validar unicidade do SKU
        const produtoExistente = await produtoRepository.findOneBy({ sku: produtoData.sku });
        if (produtoExistente) {
            throw new ProdutoJaExiste(produtoData.sku);
        }

        const novoProduto = produtoRepository.create(produtoData);
        await produtoRepository.save(novoProduto);
        return novoProduto;
    }

    async getProdutosAbaixoMinimo(): Promise<Produto[]> {
        // Regra de Negócio: Produtos abaixo da quantidade mínima devem gerar alerta
        return produtoRepository
            .createQueryBuilder("produto")
            .where("produto.saldo_estoque < produto.quantidade_minima")
            .getMany();
    }
}
