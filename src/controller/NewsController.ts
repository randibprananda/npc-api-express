import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { User } from '../model/User';
import { News } from '../model/News';
import isBase64 from 'is-base64';


const{successResponse,errorResponse,validationResponse} = require('../utils/response')
const newsRepository = AppDataSource.getRepository(News)
const userRepository = AppDataSource.getRepository(User)


export const getParalympicNews = async (req: Request, res: Response) => {

    try {

        const {limit: queryLimit,page,title} = req.query
     

        const queryBuilder = newsRepository.createQueryBuilder('news')
        .leftJoinAndSelect('news.news_type', 'paralympic_sport')
        .orderBy('news.createdAt', 'DESC')

    

   
        if (title){
            queryBuilder.where('news.title LIKE :title', {
                title: `%${title}%`
            })
    
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
        res.status(500).json({ msg: error.message })

    }

}


export const getParalympicNewsById = async (req: Request, res: Response) => {
    try {
    

        const SportId = req.params.id
        const response = await newsRepository.find({
            where: {
                id: SportId,
            },
            relations : ['news_type']
            
        });
        console.log(response)

 
        res.status(200).json(response);


    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message })
    }
}





export const createParalympicNews = async (req: Request, res: Response) => {
    const createNewsSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        news_type: Joi.string().optional(),
        date: Joi.date().optional(),
    }).validate(input)

    try {
        const body = req.body
        const schema = createNewsSchema(req.body)

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }


        const newParalympicNews = new News()
        newParalympicNews.title = body.title
        newParalympicNews.description = body.description
        newParalympicNews.news_type = body.news_type
        newParalympicNews.date = body.date
        newParalympicNews.image = ''

        await newsRepository.save(newParalympicNews)

        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
        
  
            const imageName = `NPC-image-${newParalympicNews.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/news/${imageName}`);
  
            newParalympicNews.image = `public/assets/images/news/${imageName}`;
            await newsRepository.save(newParalympicNews);
        }

        res.status(201).json({
            data: newParalympicNews
        })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const updateParalympicNews = async (req: Request, res: Response) => {
    const updateNewsSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        news_type: Joi.string().optional(),
    }).validate(input);

    try {
        const body = req.body;
        const schema = updateNewsSchema(req.body);
        const id = req.params.id;

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }));
        }

        let updateParalympicNews;
        const imageName = `NPC-image-${req.params.id}.jpeg`

         if(body.image|| body.title || body.description){
            if (body.image && isBase64(body.image, { mimeRequired: true })) {


            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
          
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`./public/assets/images/news/${imageName}`);
  
        }else{
            // Input gambar bukan base64, abaikan

            }


        updateParalympicNews = await newsRepository.findOneBy({ id });

        if (!updateParalympicNews) {
            return res.status(404).send({ message: 'Paralympic News Not Found' });
        }

        updateParalympicNews.title = body.title;
        updateParalympicNews.image = `public/assets/images/news/${imageName}`;
        updateParalympicNews.description = body.description;
        updateParalympicNews.news_type = body.news_type;
        updateParalympicNews.date = body.date;
        await newsRepository.save(updateParalympicNews);
    } else {
        updateParalympicNews = await newsRepository.findOneBy({ id });
        console.log('Invalid base64 image format');

    }

     

        res.status(200).json({
            data: updateParalympicNews
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const deleteParalympicNews = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        const paralympicSport = await newsRepository.findOne({ 
            where: {
                id: id
            }
         })

         if (!paralympicSport) {
            return res.status(404).send({ message: 'Paralympic Sport Not Found' })
         }

        const deletedParalympicSport = await newsRepository.remove(paralympicSport)
        
        return res.status(200).json({
            data: deletedParalympicSport
        })
}catch(error){
    res.status(500).json({ msg: error.message });
}
}


export const getParalympicNewsByIdLandingPage = async (req: Request, res: Response) => {
    try {
        const newsId = req.params.id;

        const onClickNews = await newsRepository.findOneBy({ id: newsId });

        if (!onClickNews) {
            return res.status(404).json({ msg: 'News not found' });
        }

        if (onClickNews.view === null) {
            onClickNews.view = '0';
        }

        onClickNews.view = (parseInt(onClickNews.view, 10) + 1).toString();
        await newsRepository.save(onClickNews);




        // Query berdasarkan ID berita dan jenis berita (news_type_id)
        const queryBuilder = newsRepository.createQueryBuilder('news')
            .leftJoinAndSelect('news.news_type', 'paralympic_sport')
            .where('news.id = :newsId', { newsId: newsId });

        const news = await queryBuilder.getOne(); // Menggunakan getOne karena kita mencari berita dengan ID tertentu

        if (!news) {
            return res.status(404).json({ msg: 'News not found' });
        }

        // Mencari berita terkait yang memiliki news_type yang sama
        const relatedNewsQueryBuilder = newsRepository.createQueryBuilder('related_news')
            .leftJoin('related_news.news_type', 'related_news_type')
            .where('related_news.news_type_id = :newsTypeId', { newsTypeId: news.news_type.id })
            .andWhere('related_news.id != :newsId', { newsId: newsId })
            .limit(5); // Mengambil maksimal 5 berita terkait

        const relatedNews = await relatedNewsQueryBuilder.getMany();

        res.status(200).json({
            data: news,
            related_news: relatedNews
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const getTopViewedNews = async (req: Request, res: Response) => {
    try {
        // Query untuk mendapatkan 4 berita dengan view terbanyak
        const topViewedNews = await newsRepository
            .createQueryBuilder('news')
            .leftJoinAndSelect('news.news_type', 'paralympic_sport')
            .orderBy('CAST(news.view AS SIGNED)', 'DESC') // Urutkan berdasarkan view terbanyak
            .limit(3) // Ambil 4 berita teratas
            .getMany();

        if (topViewedNews.length === 0) {
            return res.status(404).json({ msg: 'No top viewed news found' });
        }

        // Mencari berita terkait untuk setiap berita dalam topViewedNews
        const relatedNewsPromises = topViewedNews.map(async (newsItem) => {
            const relatedNews = await newsRepository
                .createQueryBuilder('related_news')
                .leftJoin('related_news.news_type', 'related_news_type')
                .where('related_news.news_type_id = :newsTypeId', { newsTypeId: newsItem.news_type.id })
                .andWhere('related_news.id != :newsId', { newsId: newsItem.id })
                .limit(3) // Ambil 3 berita terkait
                .getMany();

            return {
                ...newsItem,
                related_news: relatedNews,
            };
        });

        // Tunggu hingga semua promise untuk berita terkait selesai
        const newsWithRelatedNews = await Promise.all(relatedNewsPromises);

        res.status(200).json({
            data: newsWithRelatedNews,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}
