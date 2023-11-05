import { Request, Response } from "express";
import Joi from "joi";
import { AppDataSource } from "../data-source";
import { ParalympicSport } from "../model/Paralympicsports";
import { News } from "../model/News";


const { successResponse, errorResponse, validationResponse } = require('../utils/response')

const paralympicRepository =  AppDataSource.getRepository(ParalympicSport)
const newsRepository =  AppDataSource.getRepository(News)

export const sportSeeder = async (req: Request, res: Response) => {
    const sportType = [{ name_sport: "General News", video : [] }];
    try {
        for (const data of sportType) {
            // Membuat tipe olahraga (ParalympicSport)
            const newSportType = new ParalympicSport();
            newSportType.name_sport = data.name_sport;
            newSportType.video = data.video;
            await paralympicRepository.save(newSportType);

            // Membuat berita (News) dan mengaitkannya dengan tipe olahraga
            const newNews = new News();
            newNews.title = "General News"; // Ganti dengan judul berita yang sesuai
            newNews.description = "General News"; // Ganti dengan deskripsi berita yang sesuai
            newNews.news_type = newSportType; // Mengaitkan berita dengan tipe olahraga
            await newsRepository.save(newNews);
        }

        return res.status(200).json({ msg: 'Seeder berhasil' });
    } catch (error) {
        console.error(error);
        return res.status(400).send(errorResponse(error, 400));
    }
};
