import data from '../data/data.json';

const TARGET_WEIGHT = 290;

let originalData = [...data];
let modifiedData = [];
let doneData = [];
let doneID = 1;
let lastTen = [];

let currentDate = '10/10/24';

export const fetchData = async (status) => {
  return modifiedData
    .filter(item => item.status === status)
    .map(item => {
      switch (status) {
        case 'Preproduction':
          return { ...item, weight: item.weightPreCooking };
        case 'Storage':
          return { ...item, weight: item.weightAfterCooking };
        case 'Packing':
          return { ...item, weight: item.weightAfterStorage };
        default:
          return item;
      }
    });
};

export const updateDataStatus = () => {
  if (modifiedData.filter(item => item.status === 'Packing').length === 62) {
    markAllPackingAsDone(modifiedData);
  } else {
    performRandomOperation(modifiedData);
  }
  console.log('Data status updated');
};

export const getAdditionalData = async () => {
  let totalWeight = 0;
  let totalStorageTime = 0;
  const pArray = modifiedData.filter(item => item.status === 'Packing');
  for (let i = 0; pArray.length > i; i++) {
    totalWeight += pArray[i].weightAfterStorage;
    totalStorageTime += pArray[i].timeInStorage;
  }
  let totalEfficiency = 0;
  for (let i = 0; lastTen.length > i; i++) {
    totalEfficiency += lastTen[i].efficiency;
  }
  const efficiency = lastTen.length ? totalEfficiency / lastTen.length * 100 : 99;

  return {
    target: TARGET_WEIGHT,
    rawTarget: Math.round(TARGET_WEIGHT / efficiency * 100) / 10 * 10,
    date: currentDate,
    avgWeight: pArray.length ? totalWeight / pArray.length : 0,
    avgStorage: Math.round(pArray.length ? totalStorageTime / pArray.length : 0) / 10 * 10,
    efficiency: efficiency / 100,
    minAllowed: TARGET_WEIGHT - 9,
    maxAllowed: TARGET_WEIGHT + 9,
    deviation: 0.02,
    dryingLoss: 0.01,
  };
};

function performRandomOperation(entities) {
  const operations = ['read', 'updatePreproductionToStorage', 'updateStorageToPacking'];
  let selectedOperation = operations[Math.floor(Math.random() * operations.length)];
  if (selectedOperation === 'updateStorageToPacking') {
    const storageEntities = entities.filter(e => e.status === 'Storage' && e.dateOutStorage === currentDate);
    if (storageEntities.length === 0) {
      selectedOperation = Math.random() < 0.5 ? 'read' : 'updatePreproductionToStorage';
    }
  }
  let entity;

  switch (selectedOperation) {
    case 'read':
      entity = readNewEntity(entities);
      updatedCurrentDate(entity ? entity.dateProduction : currentDate);
      break;
    case 'updatePreproductionToStorage':
      entity = updateStatus(entities, 'Preproduction', 'Storage');
      updatedCurrentDate(entity ? entity.dateIntoStorage : currentDate);
      break;
    case 'updateStorageToPacking':
      entity = updateStatus(entities, 'Storage', 'Packing');
      if (entity) {
        updatedCurrentDate(entity.dateOutStorage);
        addToLastTen(entity);
      }
      break;
  }
}

function readNewEntity(entities) {
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

function addToLastTen(element, limit = 15) {
  lastTen.push(element);
  if (lastTen.length > limit) {
    lastTen.shift();
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
