import {Column, Entity, Generated, PrimaryColumn } from "typeorm";

@Entity()
export class Items {

    @PrimaryColumn("bigint", { width: 20, unsigned: true})
    @Generated()
    id: number;

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
