import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import { Header } from '../model/Header';


const{successResponse,errorResponse,validationResponse} = require('../utils/response')


const headerRepository =  AppDataSource.getRepository(Header)

export const getHeaderParalympic = async (req: Request, res: Response) => {
    try {

        const {limit: queryLimit, page: page} = req.query

        const queryBuilder = headerRepository.createQueryBuilder('header')

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
        const skip = (currentPage - 1) * (dynamicLimit || 0);

        const [data, totalCount] = await queryBuilder
        .skip(skip)
        .take(dynamicLimit || undefined)
        .getManyAndCount();


        return res.status(200).send(successResponse('Get Paralympic Sport', { 
            data, 
            totalCount,
            currentPage,
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),
         }, 200))
    
    }catch(error){
        res.status(500).json({ msg: error.message });

    }
}


export const getHeaderParalympicById = async (req: Request, res: Response) => {
    try{
        const response = await headerRepository.find({
            where: {
                id: req.params.id,
            },
        });

        res.status(200).json(response);

    }catch(error){
        res.status(500).json({ msg: error.message });
    }
}



export const createParalympicHeader = async (req: Request, res: Response) => {
    const createParalympicHeaderSchema = (input) => Joi.object({
        video_title : Joi.string().optional(),
        video_link : Joi.string().required(),
        about : Joi.string().optional(),
        officeInfo : Joi.string().optional(),
        organization_structure : Joi.string().optional(),
        email : Joi.string().optional(),
        whatsapp : Joi.string().optional(),
        facebook : Joi.string().optional(),
        instagram : Joi.string().optional(),
        youtube : Joi.string().optional(),
        twitter : Joi.string().optional(),
        tiktok : Joi.string().optional(),
    }).validate(input)

    try {
        const body = req.body;
        const schema = createParalympicHeaderSchema(req.body);

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema));
        }



        const existingSetHeader = await headerRepository.findOneBy({ headersId: body.headersId });

        if(existingSetHeader){
        existingSetHeader.video_title = body.video_title|| existingSetHeader.video_title;
        existingSetHeader.video_link = body.video_link|| existingSetHeader.video_link;        
        existingSetHeader.about = body.about|| existingSetHeader.about;
        existingSetHeader.officeInfo = body.officeInfo|| existingSetHeader.officeInfo;
        existingSetHeader.organization_structure = body.organization_structure|| existingSetHeader.organization_structure;
        existingSetHeader.email = body.email|| existingSetHeader.email;
        existingSetHeader.whatsapp = body.whatsapp|| existingSetHeader.whatsapp;
        existingSetHeader.facebook = body.facebook|| existingSetHeader.facebook;
        existingSetHeader.instagram = body.instagram|| existingSetHeader.instagram;
        existingSetHeader.youtube = body.yotube|| existingSetHeader.youtube;
        existingSetHeader.twiter = body.twiter|| existingSetHeader.twiter;
        existingSetHeader.tiktok = body.tiktok|| existingSetHeader.tiktok;
        existingSetHeader.headersId = '1';

        await headerRepository.save(existingSetHeader)

        return res.status(200).json({
            data : existingSetHeader,
            message : 'Existing Header Updaed Succesfully'
        })
    } else {
        const newHeader = new Header();
        newHeader.video_title = body.video_title;
        newHeader.video_link = body.video_link
        newHeader.about = body.about;
        newHeader.officeInfo = body.officeInfo;
        newHeader.organization_structure = body.organization_structure;
        newHeader.email = body.email;
        newHeader.whatsapp = body.whatsapp;
        newHeader.facebook = body.facebook;
        newHeader.instagram = body.instagram;
        newHeader.youtube = body.yotube;
        newHeader.twiter = body.twiter;
        newHeader.tiktok = body.tiktok;
        newHeader.headersId = '1';

        await headerRepository.save(newHeader)

        return res.status(200).json({
            data : newHeader,
            message : 'New Header Created Succesfully'
        })
    }

}catch(error){
    return res.status(400).send({ message: error.message });
}
}



export const updateHeaderParalympic = async (req: Request, res: Response) => {
    const updateHeaderParalympicSchema = (input) => Joi.object({
        // video: Joi.array().items(
        //     Joi.object({
        //         title: Joi.string().optional(),
        //         link: Joi.string().optional(),
        //     })
        // ),
        video_title : Joi.string().required(),
        video_link : Joi.string().required(),
        about : Joi.string().optional(),
        officeInfo : Joi.string().optional(),
        organizatonal_structure : Joi.string().optional(),
        email : Joi.string().optional(),
        whatsapp : Joi.string().optional(),
        facebook : Joi.string().optional(),
        instagram : Joi.string().optional(),
        yotube : Joi.string().optional(),
        twiter : Joi.string().optional(),
        tiktok : Joi.string().optional(),
    }).validate(input)

    try{

        const body = req.body;
        const schema = updateHeaderParalympicSchema(req.body);
        const id = req.params.id;

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema));
        }


        let formattedVideo = body.video
        const updateHeaderParalympic = await headerRepository.findOneBy({ id });

        updateHeaderParalympic.video_link = body.video_link ;
        updateHeaderParalympic.video_title=  body.video_title ;
        updateHeaderParalympic.about = body.about;
        updateHeaderParalympic.officeInfo = body.officeInfo;
        updateHeaderParalympic.organization_structure = body.organizatonal_structure;
        updateHeaderParalympic.email = body.email;
        updateHeaderParalympic.whatsapp = body.whatsapp;
        updateHeaderParalympic.facebook = body.facebook;
        updateHeaderParalympic.instagram = body.instagram;
        updateHeaderParalympic.youtube = body.yotube;
        updateHeaderParalympic.twiter = body.twiter;
        updateHeaderParalympic.tiktok = body.tiktok;

        await headerRepository.save(updateHeaderParalympic)

        return res.status(200).json({
            data : updateHeaderParalympic
        })


    }catch(error){
        return res.status(400).send({ message: error.message });
    }
}


export const deleteHeaderParalympic = async (req: Request, res: Response) => {
    try {

        const id = req.params.id

        const headerParalympic = await headerRepository.findOneBy({ id });
        

        const deletedHeaderParalympic = await headerRepository.remove(headerParalympic);
        return res.status(200).json({ message: 'Header has been deleted' });

}catch(error){
    res.status(500).json({ msg: error.message })
}
}