import { Request, Response } from 'express';
import Joi, { string } from "joi";
import { AppDataSource } from '../data-source';
import fs from 'fs'; // Import modul fs
import sharp from "sharp"
import { ParalympicEvent } from '../model/ParalympicEvent';
import { User } from '../model/User';
import { startOfDay, endOfDay, getYear, getMonth, getDate, isAfter,isBefore } from 'date-fns';
import isBase64 from 'is-base64';





const{successResponse,errorResponse,validationResponse} = require('../utils/response')


const paralympicEventRepository =  AppDataSource.getRepository(ParalympicEvent)
const userRepository = AppDataSource.getRepository(User)

export const getParalympicEvent = async (req: Request, res: Response) => {
    try {
        const {
            limit: queryLimit,
            page,
            title,
            location,
        } = req.query;

        const today = new Date();
        const queryBuilder = paralympicEventRepository.createQueryBuilder('paralympic_event')
            .orderBy('paralympic_event.createdAt', 'DESC'); // Urutkan berdasarkan tahun pembukaan terkecil

            if (title) {
                queryBuilder.where('paralympic_event.title LIKE :title', {
                    title: `%${title}%`
                });
            }

        if (location) {
            queryBuilder.where('paralympic_event.location LIKE :location', {
                location: `%${location}%`
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
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200));
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400));
    }
}



export const getParalympicEventById = async (req: Request, res: Response) => {
    try {
        const response = await paralympicEventRepository.find({
            where: {
                id: req.params.id,    
            }    
        });

            res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: error.message });
    }
}


export const createParalympicEvent = async (req: Request, res: Response) => {
    const createSportSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        opening: Joi.string().optional(),
        closing: Joi.string().optional(),
        location: Joi.string().optional(),
        count: Joi.string().optional(),
        gold_medal: Joi.string().optional(),
        silver_medal: Joi.string().optional(),
        bronze_medal: Joi.string().optional(),
        event_category: Joi.string().optional(),
    }).validate(input)

    try {
        const body = req.body
        const schema = createSportSchema(req.body)

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        
        const openingDate = new Date(body.opening);
        const closingDate = new Date(body.closing);
        
        if (openingDate > closingDate) {
            return res.status(400).json({ message: 'Tanggal pembukaan tidak boleh lebih besar dari tanggal penutupan' });
        }


        const newParalympicEvent = new ParalympicEvent()
        newParalympicEvent.title = body.title
        newParalympicEvent.opening = body.opening
        newParalympicEvent.closing = body.closing
        newParalympicEvent.location = body.location
        newParalympicEvent.count_down_time = body.count
        newParalympicEvent.gold_medal = body.gold_medal
        newParalympicEvent.silver_medal = body.silver_medal
        newParalympicEvent.bronze_medal = body.bronze_medal
        newParalympicEvent.event_category = body.event_category
        newParalympicEvent.image = ''


        await paralympicEventRepository.save(newParalympicEvent)

        if (body.image && typeof body.image === 'string' && body.image.trim() !== '') {
            let parts = body.image.split(';');
            let imageData = parts[1].split(',')[1];
            const img = Buffer.from(imageData, 'base64');
  
            // Validate image size
            const imageSizeInBytes = Buffer.byteLength(imageData);
            const imageSizeInMB = imageSizeInBytes / (1024 * 1024); // Convert bytes to MB
  
  
            const imageName = `NPC-image-${newParalympicEvent.id}.jpeg`;
  
            await sharp(img)
                .toFormat('jpeg', { mozjpeg: true })
                .jpeg({ quality: 100 })
                .toFile(`public/assets/images/event/${imageName}`);
  
            newParalympicEvent.image = `public/assets/images/event/${imageName}`;
            await paralympicEventRepository.save(newParalympicEvent);
        }

        res.status(201).json({
            data: newParalympicEvent
        })
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const UpdateParalympicEvent = async (req: Request, res: Response) => {
    const updateSportSchema = (input) => Joi.object({
        image: Joi.string().required(),
        title: Joi.string().optional(),
        opening: Joi.date().optional(),
        closing: Joi.date().optional(),
        location: Joi.string().optional(),
        count: Joi.string().optional(),
        gold_medal: Joi.string().optional(),
        silver_medal: Joi.string().optional(),
        bronze_medal: Joi.string().optional(),
        event_category: Joi.string().optional(),
    }).validate(input)
    
    try {
        const body = req.body
        const schema = updateSportSchema(req.body)
        const id = req.params.id

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        let UpdateParalympicEvent;
        const imageName = `NPC-image-${req.params.id}.jpeg`


        if(body.image|| body.title || body.opening || body.closing || body.location || body.count){ 
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
                .toFile(`./public/assets/images/event/${imageName}`);
        }else{
            // Input gambar bukan base64, abaikan

            }

         UpdateParalympicEvent = await paralympicEventRepository.findOneBy({ id })

        if (!UpdateParalympicEvent) {
            return res.status(404).send({ message: 'Paralympic Sport Not Found' })
        }
     

        UpdateParalympicEvent.title = body.title
        UpdateParalympicEvent.opening = body.opening
        UpdateParalympicEvent.closing = body.closing
        UpdateParalympicEvent.location = body.location
        UpdateParalympicEvent.count_down_time = body.count
        UpdateParalympicEvent.gold_medal = body.gold_medal
        UpdateParalympicEvent.silver_medal = body.silver_medal
        UpdateParalympicEvent.bronze_medal = body.bronze_medal
        UpdateParalympicEvent.event_category = body.event_category
        UpdateParalympicEvent.image = `public/assets/images/event/${imageName}`;

        await paralympicEventRepository.save(UpdateParalympicEvent)

    }else{
        UpdateParalympicEvent = await paralympicEventRepository.findOneBy({ id })
        console.log('Invalid base64 image format');

    }
        res.status(200).json({
            data: UpdateParalympicEvent
        })

    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}

export const deletedparalympicEvent = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        const paralympicEvent = await paralympicEventRepository.findOne({ 
            where: {
                id: id
            }
         })

         if (!paralympicEvent) {
            return res.status(404).send({ message: 'Paralympic Sport Not Found' })
         }

        const deletedparalympicEvent = await paralympicEventRepository.remove(paralympicEvent)
        
        return res.status(200).json({
            data: deletedparalympicEvent
        })
}catch(error){
    res.status(500).json({ msg: error.message });
}
}


export const getParalympicEventLandingPage = async (req: Request, res: Response) => {
    try {
        const {
            limit: queryLimit,
            page,
            title,
            recent,
            next,
            all,
            countdown,
            year // Tambahkan parameter tahun
        } = req.query;

        const today = new Date();
        const queryBuilder = paralympicEventRepository.createQueryBuilder('paralympic_event')
            .orderBy('paralympic_event.opening', 'ASC'); // Urutkan berdasarkan tanggal pembukaan secara ascending

        if (title) {
            queryBuilder.where('paralympic_event.title LIKE :title', {
                title: `%${title}%`
            });
        }
        if (year) {
            const [startYear, endYear] = (year as string).split('-');
            queryBuilder.andWhere('YEAR(paralympic_event.opening) >= :startYear', {
                startYear: parseInt(startYear),
            });
            queryBuilder.andWhere('YEAR(paralympic_event.opening) <= :endYear', {
                endYear: parseInt(endYear),
            });
        }
        

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
        const skip = (currentPage - 1) * (dynamicLimit || 0);

        const [data, totalCount] = await queryBuilder
            .skip(skip)
            .take(dynamicLimit || undefined)
            .getManyAndCount();

        const responseData = {
            paralympic_count_event: null,
            paralympic_recent_event: [],
            paralympic_next_event: [],
            paralympic_all_event: [],
        };

        const allEvents = data; // Menggunakan data dari database

        const groupedEvents = {};

        // Filter dan urutkan data sesuai dengan kriteria

        if (countdown) {
            // Filter untuk countdown event (countdown time terdekat dengan next event terdekat)
            const closestCountdownEvent = data.find(event => {
                const eventDate = new Date(event.opening);
                return isAfter(eventDate, today);
            });
        
            console.log('closestCountdownEvent:', closestCountdownEvent);
        
            if (closestCountdownEvent) {
                responseData.paralympic_count_event = {
                    id: closestCountdownEvent.id,
                    title: closestCountdownEvent.title,
                    count_down_time: closestCountdownEvent.count_down_time,
                    opening : closestCountdownEvent.opening,
                    closing : closestCountdownEvent.closing
                    // tambahkan atribut lain yang ingin Anda sertakan dalam respons countdown di sini
                };
            }
        }
        

        if (recent) {
            // Filter untuk recent event (event yang sudah selesai berdasarkan opening date)
            const recentEvents = data.filter(event => {
                const eventDate = new Date(event.opening);
                return isBefore(eventDate, today);
            });
            responseData.paralympic_recent_event = recentEvents.slice(0, 3);
        }

        if (next) {
            // Filter untuk next event (3 data event yang akan datang berdasarkan opening date)
            const nextEvents = data.filter(event => {
                const eventDate = new Date(event.opening);
                return (
                    isAfter(eventDate, today) &&
                    eventDate.getTime() !== today.getTime()
                );
            });
            responseData.paralympic_next_event = nextEvents.slice(0, 3);
        }

        allEvents.forEach(event => {
            const eventDate = new Date(event.opening);
            const eventYear = eventDate.getFullYear();

            if (!groupedEvents[eventYear]) {
                // Jika tahun belum ada dalam objek groupedEvents, buat array kosong untuk tahun tersebut
                groupedEvents[eventYear] = [];
            }

            // Tambahkan event ke array tahun yang sesuai
            groupedEvents[eventYear].push(event);
        });

        // Mengurutkan tahun secara terbalik (dari yang termuda ke yang tertua)
        const sortedYears = Object.keys(groupedEvents).sort((a, b) => parseInt(b) - parseInt(a));

        // Membuat array baru untuk paralympic_all_event dengan format yang diinginkan
    const formattedAllEvents = sortedYears.map(year => {
    const eventsForYear = groupedEvents[year];
    return {
        year: year,
        data: eventsForYear,
    };
});

        // Ubah responseData untuk mencakup formattedAllEvents
        responseData.paralympic_all_event = formattedAllEvents;

        const finalResponse = { data: [responseData], year: year ? parseInt(year as string) : null };

        return res.status(200).send(successResponse('Get Paralympic Sport', finalResponse, 200));
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400));
    }
}