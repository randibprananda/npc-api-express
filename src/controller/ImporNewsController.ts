import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Joi, { object } from "joi";
import * as xlsx from 'xlsx';
import multer from 'multer';
import * as path from 'path';
import { News } from "../model/News"
import { ParalympicSport } from "../model/Paralympicsports";


const { successResponse, errorResponse, validationResponse } = require('../utils/response')

const NewsRepository = AppDataSource.getRepository(News)
const SportsRepository = AppDataSource.getRepository(ParalympicSport)


const storage = multer.diskStorage({
    destination: './public/assets/files/news',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
    }
}); 


export const uploadFile = multer({ storage: storage });

export const importNews = async (req: Request, res: Response) => {
  

  
  try {
    const filePath = path.join(__dirname, `../../public/assets/files/news/${req.file.filename}`);
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
  
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      let columnMapping;
      if (sheetName === 'News') {
        columnMapping = {
          A: 'Title News',
          B: 'News Type',
          C: 'Description',
          D: 'Date'
        };
      };

      const customizedData = data.slice(1).map((row) => {
        const newRow: any = {};
        Object.values(row).forEach((cell, index) => {
          const columnLetter = String.fromCharCode(65 + index); // A: 65, B: 66, ...
          const columnName = columnMapping[columnLetter];
          if (columnName) {
            newRow[columnName] = cell;
          }
        });
        return newRow;
      });

      const sheetData = customizedData.filter(row => {
        return row['Title News'] && row['News Type'] && row['Description'] && row['Date'];
    });
        for (const cell of sheetData) {

        const SportGetId = await SportsRepository.findOne({ where: { name_sport: cell['News Type'] } });

        if (sheetName === 'News') {
          const newParalumpicNews = new News();
          newParalumpicNews.title = cell['Title News'];
          newParalumpicNews.news_type = SportGetId;
          newParalumpicNews.description = cell['Description'];
          newParalumpicNews.date = parseExcelDate(cell['Date']);

          await NewsRepository.save(newParalumpicNews);
        }
      }
    }

    return res.status(200).send(successResponse('Import Successfully', 200));
  } catch (error) {
    console.log(error)
    return res.status(400).send(errorResponse({ message: error.message }));
  }
};


function parseExcelDate(excelDate) {
  const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  // Ubah angka 25569 sesuai dengan offset tanggal Excel
  return date;
}

