import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { ParalympicSport } from '../model/Paralympicsports';
import { User } from '../model/User';
import { News } from '../model/News';
import { ParalympicAtheletes } from '../model/ParalympicAthletes';
import { In } from 'typeorm'; // Impor In dari TypeORM
import isBase64 from 'is-base64';



const{successResponse,errorResponse,validationResponse} = require('../utils/response')


const paralympicRepository =  AppDataSource.getRepository(ParalympicSport)
const userRepository = AppDataSource.getRepository(User)
const newsRepository = AppDataSource.getRepository(News)
const ParalympicAtheletesRepository = AppDataSource.getRepository(ParalympicAtheletes)

export const getParalympicSport = async (req: Request, res: Response) => {

    try {

        const {limit: queryLimit, page,name_sport} = req.query
  

    const queryBuilder = paralympicRepository.createQueryBuilder('paralympic_sport') 
    .orderBy('paralympic_sport.createdAt','DESC')
    

    if (name_sport) {
        queryBuilder.where('paralympic_sport.name_sport LIKE :name_sport', {
            name_sport: `%${name_sport}%`
        });
    }
    
    const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
    const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
    const skip = (currentPage - 1) * (dynamicLimit || 0);

    const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(dynamicLimit || undefined)
    .getManyAndCount();


    return res.status(200).send(successResponse('Get Paralympic Sport', { data, totalCount,currentPage,
        totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200))


    }catch(error){
        return res.status(400).send(errorResponse(error,400))
    }

}


export const getParalympicSportById = async (req: Request, res: Response) => {
    try {
        const response = await paralympicRepository.find({
            where: {
                id: req.params.id,
            },
        });

    
  
        res.status(200).json(response);


    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: error.message });
    }
}


export const getParalympicSportByIdLandingPage = async (req: Request, res: Response) => {
    try {
        const paralympicId = req.params.id;

        // Ambil data paralympic berdasarkan ID
        const paralympic = await paralympicRepository.findOne({
            where: {
                id: paralympicId,
            },
            relations: ['news'],
        });

        if (!paralympic) {
            return res.status(404).json({ msg: 'Paralympic sport not found' });
        }

        // Ambil berita yang sesuai dengan selected_top_news
// Hapus tanda kurung siku dan tanda kurung kurawal dari ID
const selectedNewsIds = paralympic.selected_top_news.map(id => id.replace(/[\[\]{}]/g, ''));
const selectedNews = await newsRepository.find({
    where: {
        id: In(selectedNewsIds),
    },
});

        // Tambahkan berita ke dalam respons
        const response = {
            ...paralympic,
            news: selectedNews,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
}


export const createParalympicSports = async (req: Request, res: Response) => {
    const createSportSchema = (input) => Joi.object({
        image: Joi.string().optional(),
        name_sport: Joi.string().optional(),
        history: Joi.string().optional(),
        first_debut: Joi.string().optional(),
        selected_top_news: Joi.string().optional().allow(null),
        most_medal : Joi.string().optional(),
        video: Joi.array().items(
            Joi.object({
                title: Joi.string().required(),
                link: Joi.string().required(),
            })
        ),  
      }).validate(input);

    try {
        const body = req.body;
        const schema = createSportSchema(req.body);

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema));
        }



        const formattedVideo = body.video;


        const newPralympicSport = new ParalympicSport();
        newPralympicSport.name_sport = body.name_sport;
        newPralympicSport.history = body.history;
        newPralympicSport.first_debut = body.first_debut;
        newPralympicSport.selected_top_news = body.selected_top_news;
        newPralympicSport.image = ''
        newPralympicSport.most_medal = body.most_medal

        newPralympicSport.video = formattedVideo;
        // The rest of your code...

        await paralympicRepository.save(newPralympicSport);

        
        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
       
  
            const imageName = `NPC-image-${newPralympicSport.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/sport/${imageName}`);
  
            newPralympicSport.image = `public/assets/images/sport/${imageName}`;
            await paralympicRepository.save(newPralympicSport);
        }

        res.status(201).json({
            data: newPralympicSport,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


export const updateParalympicSports = async (req: Request, res: Response) => {
    const updateSportSchema = (input) => Joi.object({
        image: Joi.string().required(),
        name_sport: Joi.string().optional(),
        history: Joi.string().optional(),
        first_debut: Joi.string().optional(),
        selected_top_news: Joi.string().optional(),
        most_medal:Joi.string().optional(),
        video: Joi.array().items(
            Joi.object({
                title: Joi.string().required(),
                link: Joi.string().required(),
            })
        ),  
        }).validate(input)

    try {
        const body = req.body;
        const schema = updateSportSchema(req.body);
        const id = req.params.id;

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }));
        }

        let UpdateParalympicSport;
        const imageName = `NPC-image-${req.params.id}.jpeg`;
        const formattedVideo = body.video;

        if (body.image || body.name_sport || body.history) {
            if (body.image && isBase64(body.image, { mimeRequired: true })) {
                // Input gambar adalah base64
                let parts = body.image.split(';');
                let imageData = parts[1].split(',')[1];
                const img = Buffer.from(imageData, 'base64');

                // Validate image size
                const imageSizeInBytes = Buffer.byteLength(imageData);
                const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB

                await sharp(img)
                    .toFormat('jpeg', { mozjpeg: true })
                    .jpeg({ quality: 100 })
                    .toFile(`./public/assets/images/sport/${imageName}`);
            } else {
                // Input gambar bukan base64, abaikan
            }

            UpdateParalympicSport = await paralympicRepository.findOneBy({ id });

            if (!UpdateParalympicSport) {
                return res.status(404).send({ message: 'Paralympic Sport Not Found' });
            }

            UpdateParalympicSport.name_sport = body.name_sport
            UpdateParalympicSport.history = body.history
            UpdateParalympicSport.first_debut = body.first_debut
            UpdateParalympicSport.selected_top_news = body.selected_top_news
            UpdateParalympicSport.most_medal=body.most_medal
            UpdateParalympicSport.video = formattedVideo
            UpdateParalympicSport.image = `public/assets/images/sport/${imageName}`
            await paralympicRepository.save(UpdateParalympicSport);

            
        } else {
            UpdateParalympicSport = await paralympicRepository.findOneBy({ id });
        }

        res.status(200).json({
            data: UpdateParalympicSport
        });
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400));
    }
};



export const deleteParalympicSports = async (req: Request, res: Response) => {
    try {
        const paralympicSport = await paralympicRepository.findOne({
            where: {
                id: req.params.id,
            },
            relations: ["paralympic_athletes", "news"], // Include related entities in the query
        });

        if (!paralympicSport) {
            return res.status(404).send({ message: 'Paralympic Sport Not Found' });
        }

        // Delete related ParalympicAtheletes first (if they exist)
        if (paralympicSport.paralympic_athletes) {
            await ParalympicAtheletesRepository.remove(paralympicSport.paralympic_athletes);
        }

        // Delete related News (if they exist)
        if (paralympicSport.news) {
            await newsRepository.remove(paralympicSport.news);
        }

        // Finally, delete the ParalympicSport
        await paralympicRepository.remove(paralympicSport);

        return res.status(200).json({
            message: 'Paralympic Sport and related data deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting Paralympic Sport:', error);
        res.status(500).json({ msg: error.message });
    }
};

export const getAllParalympicNewsByType = async (req: Request, res: Response) => {
    try {
        const queryBuilder = newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.news_type', 'paralympic_sport')
            .select(['paralympic_sport.name_sport AS name_sport', 'news.id AS id', 'news.title AS title'])
            .orderBy('paralympic_sport.name_sport', 'ASC'); // Urutkan berdasarkan nama tipe berita secara ascending

        const newsByType = await queryBuilder.getRawMany();

        // Kelompokkan berita berdasarkan tipe berita
        const groupedNews = newsByType.reduce((acc, news) => {
            if (!acc[news.name_sport]) {
                acc[news.name_sport] = [];
            }
            acc[news.name_sport].push({ id: news.id, title: news.title });
            return acc;
        }, {});

        // Ubah objek grup menjadi format yang diinginkan
        const formattedNewsByType = Object.keys(groupedNews).map(name_sport => ({
            name_sport: name_sport,
            data: groupedNews[name_sport],
        }));

        res.status(200).json({
            data: formattedNewsByType
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
