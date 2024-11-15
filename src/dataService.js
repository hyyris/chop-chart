import data from '../data/data.json';
import { pairPackings } from './pairPackings';

const TARGET_WEIGHT = 290;

let assigned_target = TARGET_WEIGHT;
let originalData = [...data];
// let originalData = data.slice(data.length / 2, data.length);
let modifiedData = [];
let doneData = [];
let doneID = 1;
let latest = [];

let currentDate = '10/10/24';

export const fetchData = async (status) => {
  let returnData = modifiedData
    .filter(item => item.status === status)
    .map(item => {
      switch (status) {
        case 'Preproduction':
          return { ...item, weight: Math.round(item.weightPreCooking) };
        case 'Storage':
          return { ...item, weight: Math.round(item.weightAfterCooking) };
        case 'Packing':
          return { ...item, weight: Math.round(item.weightAfterStorage) };
        default:
          return item;
      }
    });
  if (status === 'Packing') {
    returnData = pairPackings(returnData, assigned_target);
    
    // Order the arrays based on the highest combined weightAfterStorage value
    returnData.sort((a, b) => {
      const weightA = a.reduce((sum, entity) => sum + entity.weightAfterStorage, 0);
      const weightB = b.reduce((sum, entity) => sum + entity.weightAfterStorage, 0);
      return weightB - weightA;
    });
  }
  return returnData;
};

export const updateDataStatus = () => {
  if (modifiedData.filter(item => item.status === 'Packing').length >= 62) {
    markAllPackingAsDone(modifiedData);
  } else {
    performRandomOperation(modifiedData);
  }
};

export const getAdditionalData = async ({
  targetWeight,
  maxDeviation,
  acceptedDeviation,
  dryingLoss,
}) => {
  assigned_target = targetWeight || TARGET_WEIGHT;
  let totalWeight = 0;
  const pArray = modifiedData.filter(item => item.status === 'Packing');
  for (let i = 0; pArray.length > i; i++) {
    totalWeight += pArray[i].weightAfterStorage;
  }
  let totalStorageTime = 0;
  const storageEntities = modifiedData.filter(e => e.status === 'Storage');
  for (let i = 0; storageEntities.length > i; i++) {
    totalStorageTime += storageEntities[i].currentTimeInStorage || 0;
  }
  let totalEfficiency = 0;
  for (let i = 0; latest.length > i; i++) {
    totalEfficiency += latest[i].efficiency;
  }
  const efficiency = latest.length ? totalEfficiency / latest.length * 100 : 99;
  return {
    target: assigned_target,
    rawTarget: Math.round(assigned_target / efficiency * 100),
    date: currentDate,
    avgWeight: pArray.length ? totalWeight / pArray.length : 0,
    avgStorage: Math.round(storageEntities.length ? (totalStorageTime / storageEntities.length) * 10 : 0) / 10,
    efficiency: efficiency / 100,
    minAllowed: assigned_target - (assigned_target * maxDeviation),
    maxAllowed: assigned_target + (assigned_target * maxDeviation),
    deviation: acceptedDeviation || 0.02,
    dryingLoss: dryingLoss || 0.01,
  };
};

function performRandomOperation(entities) {
  const operations = ['read', 'updatePreproductionToStorage', 'updateStorageToPacking'];
  let selectedOperation = operations[Math.floor(Math.random() * operations.length)];
  const storageEntities = entities.filter(e => e.status === 'Storage' && e.dateOutStorage === currentDate);
  if (selectedOperation === 'updateStorageToPacking') {
    if (storageEntities.length === 0) {
      selectedOperation = Math.random() < 0.5 ? 'read' : 'updatePreproductionToStorage';
    }
  }
  if (selectedOperation === 'read') {
    const preEntities = entities.filter(e => e.status === 'Preproduction' && e.dateIntoStorage === currentDate);
    if (preEntities.length > 0) {
      selectedOperation = storageEntities.length !== 0
        ? 'updateStorageToPacking' : 'updatePreproductionToStorage';
    }
  }
  
  let entity;
  switch (selectedOperation) {
    case 'read':
      entity = readNewEntity(entities);
      if (entity) {
        updatedCurrentDate(entity.dateProduction);
      }
      break;
    case 'updatePreproductionToStorage':
      entity = updateStatus(entities, 'Preproduction', 'Storage');
      if (entity) {
        updatedCurrentDate(entity.dateIntoStorage);
      }
      break;
    case 'updateStorageToPacking':
      entity = updateStatus(entities, 'Storage', 'Packing');
      pairPackings();
      if (entity) {
        updatedCurrentDate(entity.dateOutStorage);
        addToLatest(entity);
      }
      break;
  }
}

function resetData() {
  originalData = [...data];
  modifiedData = [];
  doneData = [];
  doneID = 1;
  latest = [];
}

function readNewEntity(entities) {
  if (originalData.length === 0) {
    resetData();
  }
  const newEntity = originalData
    .sort((a, b) => {
      const dateA = new Date(a.dateProduction);
      const dateB = new Date(b.dateProduction);
      if (dateA - dateB !== 0) {
        return dateA - dateB;
      }
      return a.id - b.id;
    })[0];

  if (newEntity) {
    newEntity.status = 'Preproduction';
    entities.push(newEntity);
    originalData = originalData.filter(e => e.id !== newEntity.id);
  }
  return newEntity;
}

function updateStatus(entities, fromStatus, toStatus) {
  const entityToUpdate = entities
    .filter(e => e.status === fromStatus)
    .sort((a, b) => a.id - b.id)[0];

  if (entityToUpdate) {
    entityToUpdate.status = toStatus;
  }
  return entityToUpdate;
}

function markAllPackingAsDone(entities) {
  entities.forEach(entity => {
    if (entity.status === 'Packing') {
      entity.status = 'Done';
      entity.doneID = doneID;
      doneData.push(entity);
    }
  });
  modifiedData = modifiedData.filter(e => e.status !== 'Done');
  doneID++;
}

function addToLatest(element, limit = 15) {
  latest.push(element);
  if (latest.length > limit) {
    latest.shift();
  }
}

function updatedCurrentDate(date) {
  if (currentDate !== date) {
    currentDate = date;
    modifiedData.forEach(e => {
      if (e.status === 'Storage') {
        e.currentTimeInStorage = getDifferenceInDays(e.dateIntoStorage, currentDate);
      }
    });
  }
}

function getDifferenceInDays(s1, s2) {
  const date1 = new Date(s1)
  const date2 = new Date(s2);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
}
