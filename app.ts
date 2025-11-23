// src/app.ts (Atualizado)
import express, { Request, Response, NextFunction } from 'express';
import { initializeDatabase } from './database/sqlite';
import { router } from './routes';
import { EstoqueException } from './services/EstoqueErrors';
import { ZodError } from 'zod';

const app = express();
const PORT = 3000;

// Middleware para JSON
app.use(express.json());

// Rotas da API
app.use('/', router);

// Middleware de tratamento de erros
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    if (err instanceof EstoqueException) {
        return res.status(err.statusCode).json({
            message: err.message,
            details: err.name,
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Erro de validação de dados.",
            details: err.issues,
        });
    }

    // Erro genérico
    res.status(500).json({
        message: "Erro interno do servidor",
        details: err.message,
    });
});

// Inicializa o banco de dados e inicia o servidor
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Documentação da API (Swagger/OpenAPI) em http://localhost:${PORT}/docs (implementação futura)`);
    });
}).catch(error => {
    console.error("Falha ao iniciar o servidor devido a erro no banco de dados:", error);
    process.exit(1);
});
