import {Column, Entity, Generated, PrimaryColumn} from "typeorm";

@Entity()
export class Items {

    @PrimaryColumn("integer")
    @Generated()
    id: number;

    @Column()
    itemID: number;

    @Column({nullable: true, default: () => null})
    title: string;

    @Column({nullable: true, default: () => null})
    album: string;

    @Column({nullable: true, default: () => null})
    artist: string;

    @Column({nullable: true, default: () => null})
    url: string;

    @Column({nullable: true, default: () => null})
    acrID: string;

}
