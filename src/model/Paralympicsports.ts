import { ArrayMinSize, IsArray, IsDate, IsObject, IsOptional, IsString, ValidateNested, isString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,JoinColumn } from "typeorm";
import { ParalympicAtheletes } from "./ParalympicAthletes";
import { News } from "./News";


@Entity()
export class ParalympicSport{
    @PrimaryGeneratedColumn('uuid')
    public id:string

    // @Column({
    //     default:null,
    //     nullable:true
    // })
    // @IsString()
    // public paralympic_athletesId :string

    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public image :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public name_sport :string

    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public history :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public first_debut :string

    
    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public most_medal :string


    @Column({
        default:null,
        nullable:true,
        type: 'simple-array'
    })
    @IsString()
    public selected_top_news :string[]

      @Column({
        type: 'json',
        default:null
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    public video: any[];



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    @OneToMany(() => ParalympicAtheletes, (paralympic_athletes) => paralympic_athletes.paralympic_sport)
    public paralympic_athletes: ParalympicAtheletes

    @OneToMany(() => News, (news) => news.news_type)
    public news: News

}