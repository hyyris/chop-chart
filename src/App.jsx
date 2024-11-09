import { useState, useEffect } from 'react';
import './App.css';
import { fetchData, updateDataStatus, getAdditionalData } from './dataService';

function App() {
  const [preproductionData, setPreproductionData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [packingData, setPackingData] = useState([]);
  const [additionalData, setAdditionalData] = useState({});

  const getColor = (estimatedWeight) => {
    if (estimatedWeight >= additionalData.target * (1 - additionalData.deviation)
      && estimatedWeight <= additionalData.target * (1 + additionalData.deviation)) {
        return {borderColor: 'var(--good-color)'};
    }
    const isNotAllowed =  
      estimatedWeight < additionalData.minAllowed ||
      estimatedWeight > additionalData.maxAllowed;
    const style = isNotAllowed 
      ? { borderColor: 'var(--bad-color)' } 
      : {borderColor: 'var(--okish-color)'};
    
    return style;
  }

  useEffect(() => {
    const getData = async () => {
      const preproduction = await fetchData('Preproduction');
      preproduction.sort((a, b) => b.id - a.id);
      setPreproductionData([...preproduction]);
      setStorageData([...await fetchData('Storage')]);
      setPackingData([...await fetchData('Packing')]);
      setAdditionalData(await getAdditionalData());
      
    };

    getData();
    const interval = setInterval(() => {
      updateDataStatus();
      getData();
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className="columns">
        <div className="column">
          <div className="column-header">
            <h2>Preproduction</h2>
            <span>Pre-target weight: {additionalData.rawTarget}g</span>
          </div>
          <div className="column-content">
            <div>
              {preproductionData.map(item => {
                const estimatedWeight = item.weight * additionalData.efficiency;
                return (
                  <div key={item.id} className="entity-row" style={getColor(estimatedWeight)}>
                    <span>{item.id} | </span>
                    <span>{item.weight}g | </span>
                    <span>est. weight: {Math.round(estimatedWeight)}g</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="column">
          <div className="column-header">
            <h2>Storage {additionalData.date}</h2>
            <span>avg days in {additionalData.avgStorage}</span>
          </div>
          <div className="column-content">
            <div>
              {storageData.map(item => {
                const estimatedWeight = item.weight * (1 - (item.currentTimeInStorage || 0) * additionalData.dryingLoss);
                return (
                <div key={item.id} className="entity-row" 
                  style={getColor(estimatedWeight)}>
                  <span>{item.id} | </span>
                  <span>d: {item.currentTimeInStorage || 0} | </span>
                  <span>est. weight: {Math.round(estimatedWeight)}g </span>
                </div>)
              })}
            </div>
          </div>
        </div>
        <div className="column">
          <div className="column-header">
            <h2>Packing</h2>
            <span>avg: {Math.round(additionalData.avgWeight * 10) / 10}g</span>
          </div>
          <div className="column-content">
            <div>
              {packingData.map(item => (
                <div key={item.id} className="entity-row" style={getColor(item.weight)}>
                  <span>{item.id} | </span>
                  <span>weight: {item.weight}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;