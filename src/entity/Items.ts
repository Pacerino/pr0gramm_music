import {Column, Entity, Generated, PrimaryColumn} from "typeorm";

@Entity("Items")
export class Items {

    @PrimaryColumn("integer")
    @Generated()
    id: number;

    @Column()
    itemID: number;

    @Column({nullable: true})
    title: string;

    @Column({nullable: true})
    album: string;

    @Column({nullable: true})
    artist: string;

    @Column({nullable: true})
    url: string;

}
