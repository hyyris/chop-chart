import csv from 'csvtojson';
import { writeFileSync } from 'fs';

const convertCsvToJson = async () => {
  let jsonProduction = await csv().fromFile('./data/production.csv');
  let jsonStorage = await csv().fromFile('./data/storage.csv');
  console.log(jsonProduction.length + ' vs ' + jsonStorage.length);
  let combined = [];
  jsonProduction.forEach(production => {
    const s = jsonStorage.find(j => production.id === j.id && production.dateProduction === j.dateIntoStorage);
    if (!s) {
      return;
    }

    combined.push({
      id: s.id,
      dateIntoStorage: s.dateIntoStorage,
      dateOutStorage: s.dateOutStorage,
      dateProduction: production.dateProduction,
      weightAfterStorage: Number(s.weightAfterStorage),
      weightPreCooking: Number(production.weightPreCooking),
      weightAfterCooking: Number(production.weightAfterCooking),
      timeInStorage: getDifferenceInDays(s.dateIntoStorage, s.dateOutStorage),
      efficiency: Number(s.weightAfterStorage) / Number(production.weightPreCooking),
    });
  })

  writeFileSync('./data/data.json', JSON.stringify(combined, null, 2));
  console.log('JSON file has been created');
};

const getDifferenceInDays = (s1, s2) => {
    const date1 = new Date(s1)
    const date2 = new Date(s2);
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));

}

convertCsvToJson();