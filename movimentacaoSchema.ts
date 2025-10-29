// src/schemas/movimentacaoSchema.ts
import { z } from 'zod';
import { TipoMovimentacao } from '../models/Movimentacao';

export const MovimentacaoBaseSchema = z.object({
    produto_id: z.number().int().positive("ID do produto deve ser um número inteiro positivo"),
    tipo: z.nativeEnum(TipoMovimentacao, {
        errorMap: () => ({ message: `Tipo de movimentação deve ser ${TipoMovimentacao.ENTRADA} ou ${TipoMovimentacao.SAIDA}` }),
    }),
    quantidade: z.number().int().positive("Quantidade deve ser um número inteiro positivo"),
    lote: z.string().nullable().optional(),
    data_validade: z.preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date().nullable().optional()),
});

export const MovimentacaoCreateSchema = MovimentacaoBaseSchema;

export type MovimentacaoCreate = z.infer<typeof MovimentacaoCreateSchema>;
