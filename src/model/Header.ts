import { ArrayMinSize, IsArray, IsDate, IsObject, IsOptional, IsString, ValidateNested, isString } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Header{

    @PrimaryGeneratedColumn('uuid')
    public id:string


    // @Column({
    //     type: 'json',
    // })
    // @IsArray()
    // @ArrayMinSize(1)
    // @IsOptional()
    // public video: any[];

    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public video_title :string

    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public video_link :string

    
    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public headersId :string



    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public about :string

    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public officeInfo :string


    @Column({
        default:null,
        nullable:true,
        type: 'longtext'
    })
    @IsString()
    public organization_structure :string


    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public email :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public whatsapp :string


    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public facebook :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public instagram :string


    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public youtube :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public twiter :string

    @Column({
        default:null,
        nullable:true
    })
    @IsString()
    public tiktok :string


    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}