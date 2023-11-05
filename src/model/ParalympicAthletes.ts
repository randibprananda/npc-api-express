import { ArrayMinSize, IsArray, IsDate, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ParalympicSport } from "./Paralympicsports";


@Entity()
export class ParalympicAtheletes{
    @PrimaryGeneratedColumn('uuid')
    public id:string


    @Column()
    @IsString()
    public atheletes_name: string

    @Column()
    @IsString()
    public atheletes_regional: string


    @Column({
        type: 'longtext',
        default: null,
        nullable: true
        })
    @IsString()
    public image: string

    @Column()
    @IsString()
    public atheletes_debute: string

    @Column()
    @IsString()
    public atheletes_birthdate: string

    @Column()
    @IsString()
    public atheletes_class: string

    @Column({
        type: 'longtext',
    })
    @IsString()
    public atheletes_biography: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public gold_medal: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public silver_medal: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public bronze_medal: string

    @Column({
        type: 'simple-array',
        default: null,
        nullable: true
    })
    @IsString()
    public atheletes_result: string

    @Column({
        type: 'json',
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    public result_gold_medal: any[];


    @Column({
        type: 'json',
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    public result_silver_medal: any[];



    @Column({
        type: 'json',
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    public result_bronze_medal: any[];



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date


    @ManyToOne(() => ParalympicSport, (paralympic_sport) => paralympic_sport.paralympic_athletes)
    @JoinColumn()
    public paralympic_sport: ParalympicSport






}