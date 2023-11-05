import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { User } from '../model/User';
import { ParalympicAtheletes } from '../model/ParalympicAthletes';
import {  FindManyOptions,SelectQueryBuilder,Brackets } from 'typeorm';
import { ParalympicSport } from '../model/Paralympicsports';
import { News } from '../model/News';
import { ParalympicEvent } from '../model/ParalympicEvent';
import isBase64 from 'is-base64';




const{successResponse,errorResponse,validationResponse} = require('../utils/response')

const userRepository = AppDataSource.getRepository(User)
const paralympicAtheletesRepository = AppDataSource.getRepository(ParalympicAtheletes)
const paralympicSportRepository = AppDataSource.getRepository(ParalympicSport)
const paralympicNewsRepository = AppDataSource.getRepository(News)
const paralympcEventRepository = AppDataSource.getRepository(ParalympicEvent)


export const getParalympicAtheletes = async (req: Request, res: Response) => {

    try {

        const {limit: queryLimit, page,atheletes_name} = req.query
        


    const queryBuilder = paralympicAtheletesRepository.createQueryBuilder('atheletes')
    .leftJoinAndSelect('atheletes.paralympic_sport', 'paralympic_sport') 
    .orderBy('atheletes.createdAt','DESC')

    if (atheletes_name){
        queryBuilder.where('atheletes.atheletes_name LIKE :atheletes_name', {
            atheletes_name: `%${atheletes_name}%`
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
        totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200));


    }catch(error){
        res.status(500).json({ msg: error.message })
    }

}


export const getMedalStatistics = async (req: Request, res: Response) => {
    try {

         // Calculate total sports count
         const totalSports = await paralympicSportRepository.count();

         // Calculate total events count
         const totalEvents = await paralympcEventRepository.count();
 
         // Calculate total news count
         const totalNews = await paralympicNewsRepository.count();
 
         // Calculate total athletes count
         const totalAthletes = await paralympicAtheletesRepository.count();

        

        const eventCategoryASEAN = req.query.ASEAN as string;
        const eventCategoryASIAN = req.query.ASIAN as string;
        const eventCategoryWORLD = req.query.WORLD as string;

        // Validasi input
        if (!eventCategoryASEAN && !eventCategoryASIAN && !eventCategoryWORLD) {
            return res.status(400).json({ message: 'At least one event category is required.' });
        }

        // Initialize medal counts for each category
        const medalCounts = {};

        // Function to calculate medal counts for a category
        const calculateMedalCounts = async (categoryName, eventCategory) => {
            const athletes = await paralympicAtheletesRepository.createQueryBuilder('athlete')
                .where(new Brackets(qb => {
                    qb.where(`athlete.result_gold_medal LIKE :eventCategory`, { eventCategory: `%${eventCategory}%` })
                        .orWhere(`athlete.result_silver_medal LIKE :eventCategory`, { eventCategory: `%${eventCategory}%` })
                        .orWhere(`athlete.result_bronze_medal LIKE :eventCategory`, { eventCategory: `%${eventCategory}%` });
                }))
                .getMany();

            // Initialize medal counts for the current category
            let goldMedalCount = 0;
            let silverMedalCount = 0;
            let bronzeMedalCount = 0;

            // Calculate medal counts for each athlete in the category
            athletes.forEach((athlete) => {
                if (athlete.result_gold_medal) {
                    athlete.result_gold_medal.forEach((medal) => {
                        if (medal.event_category.includes(eventCategory)) {
                            goldMedalCount += 1;
                        }
                    });
                }
                if (athlete.result_silver_medal) {
                    athlete.result_silver_medal.forEach((medal) => {
                        if (medal.event_category.includes(eventCategory)) {
                            silverMedalCount += 1;
                        }
                    });
                }
                if (athlete.result_bronze_medal) {
                    athlete.result_bronze_medal.forEach((medal) => {
                        if (medal.event_category.includes(eventCategory)) {
                            bronzeMedalCount += 1;
                        }
                    });
                }
            });

            // Store medal counts for the current category
            medalCounts[categoryName] = {
                gold_medal_count: goldMedalCount,
                silver_medal_count: silverMedalCount,
                bronze_medal_count: bronzeMedalCount,
            };
        };

        // Calculate medal counts for each specified category
        if (eventCategoryASEAN) {
            await calculateMedalCounts('ASEAN', eventCategoryASEAN);
        }

        if (eventCategoryASIAN) {
            await calculateMedalCounts('ASIAN', eventCategoryASIAN);
        }

        if (eventCategoryWORLD) {
            await calculateMedalCounts('WORLD', eventCategoryWORLD);
        }

        const totalMedalCounts = {
            totalMedals: 0, // Inisialisasi jumlah total medali dengan 0
        };

        if (medalCounts['ASEAN']) {
            totalMedalCounts.totalMedals += medalCounts['ASEAN'].gold_medal_count;
            totalMedalCounts.totalMedals += medalCounts['ASEAN'].silver_medal_count;
            totalMedalCounts.totalMedals += medalCounts['ASEAN'].bronze_medal_count;
        }
        
        if (medalCounts['ASIAN']) {
            totalMedalCounts.totalMedals += medalCounts['ASIAN'].gold_medal_count;
            totalMedalCounts.totalMedals += medalCounts['ASIAN'].silver_medal_count;
            totalMedalCounts.totalMedals += medalCounts['ASIAN'].bronze_medal_count;
        }
        
        if (medalCounts['WORLD']) {
            totalMedalCounts.totalMedals += medalCounts['WORLD'].gold_medal_count;
            totalMedalCounts.totalMedals += medalCounts['WORLD'].silver_medal_count;
            totalMedalCounts.totalMedals += medalCounts['WORLD'].bronze_medal_count;
        }

        res.status(200).json({ 
            total_sports: totalSports ,
            total_events: totalEvents ,
            total_news : totalNews ,
            total_athletes: totalAthletes ,
            medal_counts: medalCounts,
            total_medal_counts: totalMedalCounts,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getParalympicAtheletesById = async (req: Request, res: Response) => {
    try {
   

        const SportId = req.params.id
        const response = await paralympicAtheletesRepository.find({
            relations : ['paralympic_sport'],
            where: {
                id: SportId,
            },
            
        });
        console.log(response)

    
        res.status(200).json(response);

}catch(error){
    console.log(error)
    res.status(500).json({ msg: error.message })
}
}



export const createPralympicAtheletes = async (req: Request, res: Response) => {
    const createPralympicAtheletesSchema =  Joi.object({
        atheletes_name: Joi.string().optional(),
        atheletes_regional: Joi.string().optional(),
        atheletes_image: Joi.string().optional(),
        atheletes_debute: Joi.string().optional(),
        atheletes_birthdate: Joi.string().optional(),
        atheletes_class: Joi.string().optional(),
        atheletes_biography: Joi.string().optional(),
        gold_medal: Joi.string().optional(),
        silver_medal: Joi.string().optional(),
        bronze_medal: Joi.string().optional(),
        atheletes_result: Joi.string().optional(),
        paralympic_sport_type: Joi.string().optional(),
        image : Joi.string().optional(),
        goldResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                event_category: Joi.string().optional(),

            })
        ), 

        silverResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                event_category: Joi.string().optional(),

            })
        ),

        bronzeResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                event_category: Joi.string().optional(),

            })
        ), 
    })
    //change

    try {
        const body = req.body

        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

  


        const formatedResultGoldMedal = body.goldResult
        const formatedResultSilverMedal = body.silverResult
        const formatedResultBronzeMedal = body.bronzeResult

        const newPralympicAtheletes = new ParalympicAtheletes()
        newPralympicAtheletes.atheletes_name = body.atheletes_name
        newPralympicAtheletes.atheletes_regional = body.atheletes_regional
        newPralympicAtheletes.atheletes_biography = body.atheletes_biography
        newPralympicAtheletes.gold_medal = body.gold_medal
        newPralympicAtheletes.silver_medal = body.silver_medal
        newPralympicAtheletes.bronze_medal = body.bronze_medal
        newPralympicAtheletes.result_gold_medal = formatedResultGoldMedal
        newPralympicAtheletes.result_silver_medal = formatedResultSilverMedal
        newPralympicAtheletes.result_bronze_medal = formatedResultBronzeMedal
        newPralympicAtheletes.atheletes_debute = body.atheletes_debute
        newPralympicAtheletes.atheletes_birthdate = body.atheletes_birthdate
        newPralympicAtheletes.atheletes_class = body.atheletes_class
        newPralympicAtheletes.atheletes_result = body.atheletes_result
        newPralympicAtheletes.paralympic_sport = body.paralympic_sport_type
        newPralympicAtheletes.image = ''

        await paralympicAtheletesRepository.save(newPralympicAtheletes)

        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
         
            const imageName = `NPC-image-${newPralympicAtheletes.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/atheletes/${imageName}`);
  
            newPralympicAtheletes.image = `public/assets/images/atheletes/${imageName}`;
            await paralympicAtheletesRepository.save(newPralympicAtheletes);
        }

        res.status(201).json({
            data: newPralympicAtheletes
        })

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}


export const updatePralympicAtheletes = async (req: Request, res: Response) => {
    const updatePralympicAtheletesSchema = (input) => Joi.object({
        atheletes_name: Joi.string().optional(),
        atheletes_regional: Joi.string().optional(),
        atheletes_image: Joi.string().optional(),
        atheletes_debute: Joi.string().optional(),
        atheletes_birthdate: Joi.string().optional(),
        atheletes_class: Joi.string().optional(),
        atheletes_biography: Joi.string().optional(),
        gold_medal: Joi.string().optional(),
        silver_medal: Joi.string().optional(),
        bronze_medal: Joi.string().optional(),
        atheletes_result: Joi.string().optional(),
        paralympic_sport_type: Joi.string().optional(),
        goldResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                event_category: Joi.string().optional(),
            })
        ), 

        silverResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                evet_category: Joi.string().optional(),
            })
        ),

        bronzeResult: Joi.array().items(
            Joi.object({
                sport_event: Joi.string().optional(),
                class: Joi.string().optional(),
                year: Joi.string().optional(),
                event_category: Joi.string().optional(),
            })
        ), 
    }).validate(input)

    try{
        const body = req.body
        const schema = updatePralympicAtheletesSchema(req.body)
        const id = req.params.id

        


        let updatePralympicAtheletes
        const imageName = `NPC-image-${req.params.id}.jpeg`

        if(body.atheletes_name|| body.atheletes_regional || body.atheletes_biography || body.gold_medal || body.silver_medal || body.bronze_medal || body.atheletes_result || body.paralympic_sport_type){
            if (body.image && isBase64(body.image, { mimeRequired: true })) {

                let parts = body.image.split(';');
                let imageData = parts[1].split(',')[1];
                const img = Buffer.from(imageData, 'base64');
      
                // Validate image size
                const imageSizeInBytes = Buffer.byteLength(imageData);
                const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
            
                await sharp(img)
                    .resize(280, 175)
                    .toFormat('jpeg', { mozjpeg: true })
                    .jpeg({ quality: 100 })
                    .toFile(`./public/assets/images/atheletes/${imageName}`);
            }else{
            // Input gambar bukan base64, abaikan

            }


        updatePralympicAtheletes = await paralympicAtheletesRepository.findOneBy({ id })

        if(!updatePralympicAtheletes){
            return res.status(404).json({ msg: 'Athelete not found' })
        }
        const formatedResultGoldMedal = body.goldResult
        const formatedResultSilverMedal = body.silverResult
        const formatedResultBronzeMedal = body.bronzeResult

        updatePralympicAtheletes.image = `public/assets/images/atheletes/${imageName}`;
        updatePralympicAtheletes.atheletes_name = body.atheletes_name
        updatePralympicAtheletes.atheletes_regional = body.atheletes_regional
        updatePralympicAtheletes.atheletes_biography = body.atheletes_biography
        updatePralympicAtheletes.gold_medal = body.gold_medal
        updatePralympicAtheletes.silver_medal = body.silver_medal
        updatePralympicAtheletes.bronze_medal = body.bronze_medal
        updatePralympicAtheletes.result_gold_medal = formatedResultGoldMedal
        updatePralympicAtheletes.result_silver_medal = formatedResultSilverMedal
        updatePralympicAtheletes.result_bronze_medal = formatedResultBronzeMedal
        updatePralympicAtheletes.atheletes_debute = body.atheletes_debute
        updatePralympicAtheletes.atheletes_birthdate = body.atheletes_birthdate
        updatePralympicAtheletes.atheletes_class = body.atheletes_class
        updatePralympicAtheletes.atheletes_result = body.athletes_result
        updatePralympicAtheletes.paralympic_sport = body.paralympic_sport_type
        
        await paralympicAtheletesRepository.save(updatePralympicAtheletes);
   
    }else{
        updatePralympicAtheletes = await paralympicAtheletesRepository.findOneBy({ id })
        console.log('Invalid base64 image format');

    }

    return res.status(200).json({
        data: updatePralympicAtheletes
    })

       
        
    }catch(error){
        console.log(error)
        res.status(500).json({ msg: error.message })
    }
}


export const deletePralympicAtheletes = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        const deletedAthlete = await paralympicAtheletesRepository.findOneBy({
                id
        });

        if (!deletedAthlete) {
            return res.status(404).json({ message: 'Paralympic Athlete Not Found' });
        }

        await paralympicAtheletesRepository.delete(id);

        res.status(200).json({
            data: deletedAthlete,
            message: 'Paralympic Athlete deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



export const getParalympicAtheletesLanding = async (req: Request, res: Response) => {
    try {
        const { limit: queryLimit, page, athletes_name, sport_name } = req.query;

        const queryBuilder = paralympicAtheletesRepository.createQueryBuilder('atheletes')
            .leftJoinAndSelect('atheletes.paralympic_sport', 'paralympic_sport')
            .orderBy('paralympic_sport.name_sport', 'ASC');

        if (athletes_name) {
            queryBuilder.andWhere('atheletes.atheletes_name = :athletes_name', {
                athletes_name: `${athletes_name}`
            });
        }

        if (sport_name) {
            queryBuilder.andWhere('paralympic_sport.name_sport = :sport_name', {
                sport_name: `${sport_name}`
            });
        }

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
        const skip = (currentPage - 1) * (dynamicLimit || 0);

        const [data, totalCount] = await queryBuilder
            .skip(skip)
            .take(dynamicLimit || undefined)
            .getManyAndCount();

        // Group data by "name_sport"
        const groupedData = data.reduce((acc, item) => {
            const key = item.paralympic_sport.name_sport;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push({
                id: item.id,
                athletes_name: item.atheletes_name,
                image: item.image
            });
            return acc;
        }, {});

        // Transform grouped data into the desired format
        const transformedData = Object.entries(groupedData).map(([name_sport, data]) => ({
            name_sport,
            data
        }));

        return res.status(200).send(successResponse('Get Paralympic Sport', { data: transformedData, totalCount }, 200));
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


