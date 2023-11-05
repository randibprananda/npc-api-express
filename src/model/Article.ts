import { IsOptional, IsString, validateOrReject } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm"



@Entity()
export class article {
    @PrimaryGeneratedColumn('uuid')
    public id: string


    @Column({
        type: 'longtext',
        default: null,
        nullable: true
    })
    @IsOptional()
    public image: string


    @Column()
    @IsString()
    public title: string


    @Column()
    @IsString()
    public author: string


    @Column({
        type: 'longtext',
        default: null,
        nullable: true
    })
    @IsOptional()
    public description: string

    @CreateDateColumn()
    public createdAt: Date
    
    @UpdateDateColumn()
    public updatedAt: Date
    
    @DeleteDateColumn()
    public deletedAt: Date




}


