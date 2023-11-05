import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Joi, { object } from "joi";
import * as xlsx from 'xlsx';
import multer from 'multer';
import * as path from 'path';
import { ParalympicAtheletes } from "../model/ParalympicAthletes";
import { ParalympicSport } from "../model/Paralympicsports";

const { successResponse, errorResponse, validationResponse } = require('../utils/response')

const AtheletesRepository = AppDataSource.getRepository(ParalympicAtheletes)
const SportsRepository = AppDataSource.getRepository(ParalympicSport)


const storage = multer.diskStorage({
    destination: './public/assets/files/atheletes',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
    }
}); 


export const uploadFile = multer({ storage: storage });

export const importAtheletes = async (req: Request, res: Response) => {
  

  
    try {
      const filePath = path.join(__dirname, `../../public/assets/files/atheletes/${req.file.filename}`);
      const workbook = xlsx.readFile(filePath);
      const sheetNames = workbook.SheetNames;
    
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
        let columnMapping;
        if (sheetName === 'Atheletes') {
          columnMapping = {
            A: 'Name Atheletes',
            B: 'Sport Type',
            C: 'Date of Birth',
            D: 'Region Of Origin',
            E: 'Debute',
            F: 'Class',
            G: 'Biography',
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
          return row['Name Atheletes'] && row['Sport Type'] && row['Date of Birth'] && row['Region Of Origin']&& row['Debute']&& row['Class']&& row['Biography'];
      });
          for (const cell of sheetData) {

        const SportGetId = await SportsRepository.findOne({ where: { name_sport: cell['Sport Type'] } });


          if (sheetName === 'Atheletes') {
            const newParalympicAtheltes = new ParalympicAtheletes();
            newParalympicAtheltes.atheletes_name = cell['Name Atheletes'];
            newParalympicAtheltes.paralympic_sport = SportGetId ;
            newParalympicAtheltes.atheletes_birthdate = cell['Date of Birth'];
            newParalympicAtheltes.atheletes_regional = cell['Region Of Origin'];
            newParalympicAtheltes.atheletes_debute = cell['Debute'];
            newParalympicAtheltes.atheletes_class = cell['Class'];
            newParalympicAtheltes.atheletes_biography = cell['Biography'];

            const goldResult = [{}] // Parse goldResult from your data
            const silverResult = [{}] // Parse silverResult from your data
            const bronzeResult = [{}] // Parse bronzeResult from your data
  
            newParalympicAtheltes.result_gold_medal = goldResult;
            newParalympicAtheltes.result_silver_medal = silverResult;
            newParalympicAtheltes.result_bronze_medal = bronzeResult;
            await AtheletesRepository.save(newParalympicAtheltes);

          }
        }
      }

  
      return res.status(200).send(successResponse('Import Successfully', 200));
    } catch (error) {
      console.log(error)
      return res.status(400).send(errorResponse('Import Template Atheletes Tidak Sesuai',{ message: error.message }));
    }
  };