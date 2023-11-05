import { IsDate, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";


@Entity()
export class ParalympicEvent{
    @PrimaryGeneratedColumn('uuid')
    public id:string



    @Column()
    @IsString()
    public title : string


    @Column()
    @IsDate()
    public opening : Date

    @Column()
    @IsDate()
    public closing : Date


    @Column()
    @IsString()
    public location : string


    @Column({
        type: 'longtext',
        default: null,
        nullable: true
        })
    @IsString()
    public image : string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public count_down_time : string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public gold_medal : string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public silver_medal : string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public bronze_medal : string

    
    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public event_category : string




    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date



}