// src/models/Movimentacao.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Produto } from "./Produto";

export enum TipoMovimentacao {
    ENTRADA = "ENTRADA",
    SAIDA = "SAIDA",
}

@Entity("movimentacoes")
export class Movimentacao {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    produto_id!: number;

    @Column({
        type: "enum",
        enum: TipoMovimentacao,
    })
    tipo!: TipoMovimentacao;

    @Column()
    quantidade!: number;

    @CreateDateColumn()
    data_movimentacao!: Date;

    @Column({ nullable: true })
    lote!: string | null; // Para perecíveis

    @Column({ type: "date", nullable: true })
    data_validade!: Date | null; // Para perecíveis

    @ManyToOne(() => Produto, produto => produto.movimentacoes)
    @JoinColumn({ name: "produto_id" })
    produto!: Produto;
}
