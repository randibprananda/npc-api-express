import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Joi, { object } from "joi";
import * as xlsx from 'xlsx';
import multer from 'multer';
import * as path from 'path';
import { ParalympicSport } from "../model/Paralympicsports";
import { News } from "../model/News";

const { successResponse, errorResponse, validationResponse } = require('../utils/response')


const SportsRepository = AppDataSource.getRepository(ParalympicSport)
const NewsRepository = AppDataSource.getRepository(News)


const storage = multer.diskStorage({
    destination: './public/assets/files/sport',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
    }
}); 


export const uploadFile = multer({ storage: storage });


export const importSports = async (req: Request, res: Response) => {
  

  
    try {
      const filePath = path.join(__dirname, `../../public/assets/files/sport/${req.file.filename}`);
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
    
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
        let columnMapping;
        if (sheetName === 'Sport') {
          columnMapping = {
            A: 'Name Sport',
            B: 'Olympic Debut',
            C: 'Most Medal',
            D: 'History',
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
          return row['Name Sport'] && row['Olympic Debut'] && row['Most Medal'] && row['History'];
      });
              for (const cell of sheetData) {
          if (sheetName === 'Sport') {
            const newPralympicSport = new ParalympicSport();
            newPralympicSport.name_sport = cell['Name Sport'];
            newPralympicSport.first_debut = cell['Olympic Debut'];
            newPralympicSport.most_medal = cell['Most Medal'];
            newPralympicSport.history = cell['History'];

            await SportsRepository.save(newPralympicSport);
          }
        }
      }
  
      return res.status(200).send(successResponse('Import Successfully', 200));
    } catch (error) {
      console.log(error)
      return res.status(400).send(errorResponse('Import Template Sport Tidak Sesuai',{ message: error.message }));
    }
  };



