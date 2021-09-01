import {Column, Entity, Generated, PrimaryColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity()
export class Items {

    @PrimaryColumn("bigint", { width: 20, unsigned: true})
    @Generated()
    id: number;

    @CreateDateColumn({ type: "datetime", width: 3, default: () => "CURRENT_TIMESTAMP(3)" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", width: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)" })
    updated_at: Date;

    @Column({nullable: true, type: "datetime", width: 3,  default: () => null})
    deleted_at: Date

    @Column({type: "bigint", width: 20})
    itemID: number;

    @Column({type: "longtext", nullable: true, default: () => null})
    title: string;

    @Column({type:"longtext", nullable: true, default: () => null})
    album: string;

    @Column({type: "longtext", nullable: true, default: () => null})
    artist: string;

    @Column({type: "longtext", nullable: true, default: () => null})
    url: string;

    @Column({type: "longtext", nullable: true, default: () => null})
    acrID: string;

}
