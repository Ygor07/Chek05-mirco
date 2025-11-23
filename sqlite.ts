// src/database/sqlite.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Produto } from "../models/Produto";
import { Movimentacao } from "../models/Movimentacao";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "estoque.sqlite",
    synchronize: true, // Usado apenas para desenvolvimento
    logging: false,
    entities: [Produto, Movimentacao],
    migrations: [],
    subscribers: [],
});

export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Data Source inicializado com sucesso!");
        }
    } catch (err) {
        console.error("Erro durante a inicialização do Data Source:", err);
        throw err;
    }
};
