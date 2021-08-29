import { Items } from "./Items"
import {Column, Entity} from "typeorm";

@Entity("Items")
export class MusicMetadata extends Items {
    
    @Column({nullable: true, default: () => null})
    entityUniqueId: string;
    
    @Column({nullable: true, default: () => null})
    userCountry: string;
    
    @Column({nullable: true, default: () => null})
    pageUrl: string;
    
    @Column({nullable: true, default: () => null})
    size: string;
    
    @Column({nullable: true, default: () => null})
    deezerUrl: string;
    
    @Column({nullable: true, default: () => null})
    deezerID: string;
    
    @Column({nullable: true, default: () => null})
    soundcloudUrl: string;
    
    @Column({nullable: true, default: () => null})
    soundcloudID: string;
    
    @Column({nullable: true, default: () => null})
    spotifyURL: string;
    
    @Column({nullable: true, default: () => null})
    spotifyID: string;
    
    @Column({nullable: true, default: () => null})
    youtubeURL: string;
    
    @Column({nullable: true, default: () => null})
    youtubeID: string;
    
    @Column({nullable: true, default: () => null})
    tidalURL: string;
    
    @Column({nullable: true, default: () => null})
    tidalID: string;
    
    @Column({nullable: true, default: () => null})
    applemusicURL: string;
    
    @Column({nullable: true, default: () => null})
    applemusicID: string;
    
}