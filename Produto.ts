// src/models/Produto.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn } from "typeorm";
import { Movimentacao } from "./Movimentacao";

export enum CategoriaProduto {
    PERECIVEL = "PERECIVEL",
    NAO_PERECIVEL = "NAO_PERECIVEL",
}

@Entity("produtos")
export class Produto {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    @Index()
    sku!: string;

    @Column()
    nome!: string;

    @Column({
        type: "enum",
        enum: CategoriaProduto,
        default: CategoriaProduto.NAO_PERECIVEL,
    })
    categoria!: CategoriaProduto;

    @Column({ type: "real" })
    preco_unitario!: number;

    @Column({ default: 0 })
    quantidade_minima!: number;

    @Column({ default: 0 })
    saldo_estoque!: number; // Saldo atual

    @CreateDateColumn()
    data_criacao!: Date;

    @OneToMany(() => Movimentacao, movimentacao => movimentacao.produto)
    movimentacoes!: Movimentacao[];
}
