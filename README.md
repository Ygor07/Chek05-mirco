# Chek05-mirco

estoque-app-node/
├── src/
│   ├── database/
│   │   └── sqlite.ts       # Configuração do TypeORM e SQLite
│   ├── models/
│   │   ├── Produto.ts      # Entidade Produto (TypeORM)
│   │   └── Movimentacao.ts # Entidade Movimentacao (TypeORM)
│   ├── schemas/
│   │   ├── produtoSchema.ts
│   │   └── movimentacaoSchema.ts # Validação de dados (Zod)
│   ├── services/
│   │   ├── EstoqueErrors.ts      # Exceções personalizadas
│   │   ├── ProdutoService.ts     # Lógica de negócio de Produto
│   │   ├── MovimentacaoService.ts# Lógica de negócio de Movimentação
│   │   └── RelatorioService.ts   # Lógica de negócio de Relatórios
│   ├── routes/
│   │   └── index.ts        # Rotas da API (Express)
│   └── app.ts              # Configuração do Express e inicialização
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Documentação e exemplos de uso


Sistema de Gestão de Estoque

Este projeto implementa um sistema de gestão de estoque simples para produtos perecíveis e não-perecíveis, utilizando Node.js, Express e TypeScript para a API e TypeORM com SQLite para persistência.

Regras de Negócio Implementadas

As seguintes regras foram implementadas e validadas:

1.
Produtos Perecíveis: Devem ter Lote e Data de Validade no momento da ENTRADA no estoque.

2.
Quantidade Positiva: Não é permitida a movimentação (entrada/saída) de quantidade negativa (garantido pelo Zod).

3.
Controlo de Estoque: Ao registar uma SAÍDA, o sistema verifica se há saldo suficiente. Caso contrário, retorna um erro.

4.
Alerta de Estoque Mínimo: O sistema permite listar produtos cujo `saldo_estoque` é inferior à `quantidade_minima` definida.

5.
Atualização Automática: O `saldo_estoque` do produto é atualizado automaticamente após cada movimentação.

6.
Prevenção de Vencimento: Não é permitida a movimentação (entrada ou saída) de produtos perecíveis cuja `data_validade` seja anterior à data atual.

Diagrama de Entidades (Texto)

```mermaid erDiagram PRODUTO ||--o{ MOVIMENTACAO_ESTOQUE : tem

Plain Text


PRODUTO {
    int id PK
    string sku UK
    string nome
    CategoriaProduto categoria ENUM
    float preco_unitario
    int quantidade_minima
    int saldo_estoque
    datetime data_criacao
}

MOVIMENTACAO_ESTOQUE {
    int id PK
    int produto_id FK
    TipoMovimentacao tipo ENUM
    int quantidade
    datetime data_movimentacao
    string lote
    date data_validade
}


```

Como Executar o Projeto

Pré-requisitos

•
Node.js (versão LTS recomendada)

•
npm ou pnpm (gerenciador de pacotes do Node.js)

Instalação

1.
Crie a estrutura de ficheiros conforme as etapas anteriores.

2.
Instale as dependências (assumindo que você está no diretório raiz do projeto `estoque-app-node`):

Execução

1.
Execute a aplicação usando `ts-node`:

2.
A API estará disponível em `http://localhost:3000\`.

Exemplos de Requisições API

A documentação completa da API está disponível em `/docs` (implementação futura). Abaixo estão alguns exemplos de uso via `curl`.

1. Criar Produto Não-Perecível

```bash curl -X POST http://localhost:3000/produtos -H "Content-Type: application/json" -d '{ "sku": "NP-001", "nome": "Parafuso M8", "categoria": "NAO_PERECIVEL", "preco_unitario": 0.50, "quantidade_minima": 100 }' ```

2. Criar Produto Perecível

```bash curl -X POST http://localhost:3000/produtos -H "Content-Type: application/json" -d '{ "sku": "P-001", "nome": "Leite Integral", "categoria": "PERECIVEL", "preco_unitario": 1.20, "quantidade_minima": 10 }' ```

3. Entrada de Estoque (Perecível)

•
Necessário: `lote` e `data_validade`.

```bash curl -X POST http://localhost:3000/movimentacoes -H "Content-Type: application/json" -d '{ "produto_id": 2, "tipo": "ENTRADA", "quantidade": 50, "lote": "LOTE-A1", "data_validade": "2025-12-31" }' ```

4. Saída de Estoque (Não-Perecível)

•
Validação: Verifica se há saldo suficiente.

```bash curl -X POST http://localhost:3000/movimentacoes -H "Content-Type: application/json" -d '{ "produto_id": 1, "tipo": "SAIDA", "quantidade": 10, "lote": null, "data_validade": null }' ```

5. Relatório de Estoque Mínimo

```bash curl -X GET http://localhost:3000/relatorios/estoque_minimo ```

6. Relatório de Valor Total do Estoque

```bash curl -X GET http://localhost:3000/relatorios/valor_total_estoque ```




