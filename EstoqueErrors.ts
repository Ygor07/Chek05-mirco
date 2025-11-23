// src/services/EstoqueErrors.ts

export class EstoqueException extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
        this.name = this.constructor.name;
        // Mantém o stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class ProdutoNaoEncontrado extends EstoqueException {
    constructor(id: number) {
        super(`Produto com ID ${id} não encontrado.`, 404);
    }
}

export class ValidacaoProduto extends EstoqueException {
    constructor(message: string) {
        super(message, 400);
    }
}

export class EstoqueInsuficiente extends ValidacaoProduto {
    constructor(nome: string, saldo: number, solicitada: number) {
        super(`Estoque insuficiente para o produto ${nome}. Saldo atual: ${saldo}, Saída solicitada: ${solicitada}`);
    }
}

export class ProdutoJaExiste extends ValidacaoProduto {
    constructor(sku: string) {
        super(`Produto com SKU '${sku}' já existe.`);
    }
}
