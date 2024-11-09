import csv from 'csvtojson';
import { writeFileSync } from 'fs';

const convertCsvToJson = async () => {
  let jsonProduction = await csv().fromFile('./data/production.csv');
  let jsonStorage = await csv().fromFile('./data/storage.csv');

  let combined = jsonStorage.map(s => {
    const production = jsonProduction.find(p => s.id === p.id);
    return {
        id: s.id,
        dateIntoStorage: getCorrectDate(s.dateIntoStorage),
        dateOutStorage: getCorrectDate(s.dateOutStorage),
        dateProduction: getCorrectDate(production.dateProduction),
        weightAfterStorage: Number(s.weightAfterStorage),
        weightPreCooking: Number(production.weightPreCooking),
        weightAfterCooking: Number(production.weightAfterCooking),
    }
  })

  writeFileSync('./data/data.json', JSON.stringify(combined, null, 2));
  console.log('JSON file has been created');
};

const getCorrectDate = (s) => {
    const d = new Date(s);
    d.setDate(d.getDate() + 1);
    return d.toISOString().substring(0, 10);
}

convertCsvToJson();