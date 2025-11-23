// src/routes/index.ts
import { Router, Request, Response } from 'express';
import { ProdutoService } from '../services/ProdutoService';
import { MovimentacaoService } from '../services/MovimentacaoService';
import { RelatorioService } from '../services/RelatorioService';
import { ProdutoCreateSchema, ProdutoResponseSchema } from '../schemas/produtoSchema';
import { MovimentacaoCreateSchema } from '../schemas/movimentacaoSchema';
import { EstoqueException } from '../services/EstoqueErrors';
import { ZodError } from 'zod';

export const router = Router();

const produtoService = new ProdutoService();
const movimentacaoService = new MovimentacaoService();
const relatorioService = new RelatorioService();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: "Bem-vindo ao Sistema de Gestão de Estoque (Node.js/Express)" });
});

// --- Rotas de Produto ---

router.post('/produtos', async (req: Request, res: Response, next) => {
    try {
        const produtoData = ProdutoCreateSchema.parse(req.body);
        const novoProduto = await produtoService.createProduto(produtoData);
        res.status(201).json(ProdutoResponseSchema.parse(novoProduto));
    } catch (error) {
        next(error);
    }
});

router.get('/produtos', async (req: Request, res: Response, next) => {
    try {
        const produtos = await produtoService.getProdutosAbaixoMinimo(); // Usando getProdutosAbaixoMinimo para demonstrar uma regra
        res.json(produtos);
    } catch (error) {
        next(error);
    }
});

// --- Rotas de Movimentação ---

router.post('/movimentacoes', async (req: Request, res: Response, next) => {
    try {
        const movData = MovimentacaoCreateSchema.parse(req.body);
        const novaMovimentacao = await movimentacaoService.createMovimentacao(movData);
        res.status(201).json(novaMovimentacao);
    } catch (error) {
        next(error);
    }
});

// --- Rotas de Relatórios ---

router.get('/relatorios/valor_total_estoque', async (req: Request, res: Response, next) => {
    try {
        const valor = await relatorioService.calcularValorTotalEstoque();
        res.json({ valor_total_estoque: valor });
    } catch (error) {
        next(error);
    }
});

router.get('/relatorios/estoque_minimo', async (req: Request, res: Response, next) => {
    try {
        const produtos = await produtoService.getProdutosAbaixoMinimo();
        res.json(produtos);
    } catch (error) {
        next(error);
    }
});

router.get('/relatorios/produtos_a_vencer', async (req: Request, res: Response, next) => {
    try {
        const produtos = await relatorioService.listarProdutosAVencer();
        res.json(produtos);
    } catch (error) {
        next(error);
    }
});
