import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Joi, { date, object } from "joi";
import * as xlsx from 'xlsx';
import multer from 'multer';
import * as path from 'path';
import { ParalympicEvent } from "../model/ParalympicEvent";


const { successResponse, errorResponse, validationResponse } = require('../utils/response')

const EventRpository = AppDataSource.getRepository(ParalympicEvent)


const storage = multer.diskStorage({
    destination: './public/assets/files/event',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.xlsx');
    }
}); 


export const uploadFile = multer({ storage: storage });

export const importEvent = async (req: Request, res: Response) => {
  

  
  try {
    const filePath = path.join(__dirname, `../../public/assets/files/event/${req.file.filename}`);
    const workbook = xlsx.readFile(filePath);
    const sheetNames = workbook.SheetNames;
  
    for (const sheetName of sheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

      let columnMapping;
      if (sheetName === 'Event') {
        columnMapping = {
          A: 'Title Event',
          B: 'opening',
          C: 'closing',
          D: 'location',
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
        return row['Title Event'] && row['opening'] && row['closing'] && row['location'];
    });
        for (const cell of sheetData) {


        if (sheetName === 'Event') {
          const newParalumpicEvent = new ParalympicEvent();
          newParalumpicEvent.title = cell['Title Event'];
          newParalumpicEvent.opening = parseExcelDate(cell['opening']);
          newParalumpicEvent.closing = parseExcelDate(cell['closing']);
          
          newParalumpicEvent.location = cell['location'];

          await EventRpository.save(newParalumpicEvent);
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
