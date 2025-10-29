// src/schemas/produtoSchema.ts
import { z } from 'zod';
import { CategoriaProduto } from '../models/Produto';

export const ProdutoBaseSchema = z.object({
    sku: z.string().min(1, "SKU é obrigatório"),
    nome: z.string().min(1, "Nome é obrigatório"),
    categoria: z.nativeEnum(CategoriaProduto, {
        errorMap: () => ({ message: `Categoria deve ser ${CategoriaProduto.PERECIVEL} ou ${CategoriaProduto.NAO_PERECIVEL}` }),
    }),
    preco_unitario: z.number().positive("Preço unitário deve ser maior que zero"),
    quantidade_minima: z.number().int().min(0).default(0),
});

export const ProdutoCreateSchema = ProdutoBaseSchema;

// Para resposta (inclui campos gerados pelo BD)
export const ProdutoResponseSchema = ProdutoBaseSchema.extend({
    id: z.number().int().positive(),
    saldo_estoque: z.number().int(),
    data_criacao: z.date(),
});

export type ProdutoCreate = z.infer<typeof ProdutoCreateSchema>;
export type ProdutoResponse = z.infer<typeof ProdutoResponseSchema>;
