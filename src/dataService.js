import data from '../data/data.json';

let originalData = [...data];
let modifiedData = [];
let doneData = [];
let doneID = 1;

export const fetchData = async (status) => {
  return modifiedData
    .filter(item => item.status === status)
    .map(item => {
      switch (status) {
        case 'Preproduction':
          return { id: item.id, weight: item.weightPreCooking };
        case 'Storage':
          return { id: item.id, weight: item.weightAfterCooking };
        case 'Packing':
          return { id: item.id, weight: item.weightAfterStorage };
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

function performRandomOperation(entities) {
  const operations = ['read', 'updatePreproductionToStorage', 'updateStorageToPacking'];
  const selectedOperation = operations[Math.floor(Math.random() * operations.length)];

  switch (selectedOperation) {
    case 'read':
      readNewEntity(entities);
      break;
    case 'updatePreproductionToStorage':
      updateStatus(entities, 'Preproduction', 'Storage');
      break;
    case 'updateStorageToPacking':
      updateStatus(entities, 'Storage', 'Packing');
      break;
  }
}

function readNewEntity(entities) {
  const newEntity = originalData
    .filter(e => e.status === undefined)
    .sort((a, b) => a.id - b.id)[0];

  if (newEntity) {
    newEntity.status = 'Preproduction';
    entities.push(newEntity);
    originalData = originalData.filter(e => e.id !== newEntity.id);
  }
}

function updateStatus(entities, fromStatus, toStatus) {
  const entityToUpdate = entities
    .filter(e => e.status === fromStatus)
    .sort((a, b) => a.id - b.id)[0];

  if (entityToUpdate) {
    entityToUpdate.status = toStatus;
  }
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