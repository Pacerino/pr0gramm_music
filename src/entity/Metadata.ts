import { Items } from "./Items"
import {Column, Entity} from "typeorm";

@Entity("items")
export class MusicMetadata extends Items {
    
    @Column({type: "longtext", nullable: true, default: () => null})
    deezerURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    deezerID: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    soundcloudURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    soundcloudID: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    spotifyURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    spotifyID: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    youtubeURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    youtubeID: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    tidalURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    tidalID: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    applemusicURL: string;
    
    @Column({type: "longtext", nullable: true, default: () => null})
    applemusicID: string;
    
}