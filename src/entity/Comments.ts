import {Column, Entity, Generated, PrimaryColumn} from "typeorm";
import { ItemFlags } from "pr0gramm-api";

@Entity("Comments")
export class Comments {

    @Column()
    type: string;

    @PrimaryColumn("integer")
    @Generated()
    id: number;

    @Column({nullable: true})
    itemId: number;

    @Column({nullable: true})
    image: string;

    @Column({nullable: true})
    thumb: string;

    @Column("enum", { enum: ItemFlags})
    flags: ItemFlags;

    @Column()
    name: string;

    @Column()
    senderId: number;

    @Column({nullable: true})
    collection: number;

    @Column()
    created: string;

    @Column("longtext")
    message: string;

    @Column()
    read: number;

}
