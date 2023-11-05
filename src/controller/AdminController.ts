import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { User } from '../model/User';
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)


const{successResponse,errorResponse,validationResponse} = require('../utils/response')


const userRepository = AppDataSource.getRepository(User)


export const getUsers = async (req: Request, res: Response) => {
    try {
        const { fullname,username,page,limit: queryLimit } = req.query;

    
        const queryBuilder = userRepository.createQueryBuilder('user')
        .orderBy('user.createdAt','DESC')

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
            const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
            const skip = (currentPage - 1) * (dynamicLimit || 0);

        if(fullname){
            queryBuilder.andWhere('user.fullname LIKE :fullname', {
                fullname: `%${fullname}%`
            })
        }


        const [data,totalCount] = await queryBuilder
        .skip(skip)
        .take(dynamicLimit || undefined)
        .getManyAndCount();


        res.status(200).json({
            data,
            totalCount,
            currentPage,
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),
        })

}catch(error){
    res.status(500).json({ msg: error.message })
}
}




export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }

        res.status(200).json(user)

}catch(error){
    res.status(500).json({ msg: error.message })
}
}



export const createUser = async (req: Request, res: Response) => {
    try {
        const userSchema = Joi.object({
            fullname: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: joiPassword
            .string()
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .noWhiteSpaces(),
        });

        const body = req.body;
        const schema = userSchema.validate(body);

        const existingUser = await userRepository.findOneBy({ email: body.email });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }


        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }


        const newAdmin = new User()
        newAdmin.fullname = body.fullname
        newAdmin.email = body.email
        newAdmin.password = body.password
        newAdmin.hashPassword()
        await userRepository.save(newAdmin)


        res.status(201).json({
            data: newAdmin
        })

}catch(error){
    res.status(500).json({ msg: error.message })
}
}


export const updateUser = async (req: Request, res: Response) => {
    try {
        const userSchema = Joi.object({
            fullname: Joi.string().optional(),
            email: Joi.string().email().optional(),
            password: joiPassword
            .string()
            .minOfSpecialCharacters(1)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .noWhiteSpaces(),
        });

        const body = req.body;
        const id = req.params.id



        const updateAdmin = await userRepository.findOneBy({ id })
        
        if (!updateAdmin) {
            return res.status(500).send(successResponse('User not Found', { data: updateAdmin }));
        }


        updateAdmin.fullname = body.fullname
        updateAdmin.email = body.email
        updateAdmin.password = body.password
        updateAdmin.hashPassword()
        await userRepository.save(updateAdmin)

        res.status(200).json({
            data: updateAdmin
        })


}catch(error){
    res.status(500).json({ msg: error.message })
}
}


export const deleteUser = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            return res.status(500).send(successResponse('User not Found', { data: user }));
        }

        await userRepository.remove(user)
        return res.status(200).json({ message: 'Admin has been deleted' });
    }catch(error){
    res.status(500).json({ msg: error.message })
}
}


