import { useState, useEffect } from 'react';
import './App.css';
import { fetchData, updateDataStatus, getAdditionalData } from './dataService';

function App() {
  const [preproductionData, setPreproductionData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [packingData, setPackingData] = useState([]);
  const [additionalData, setAdditionalData] = useState({});

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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className="columns">
        <div className="column">
          <div className="column-header">
            <h2>Preproduction</h2>
            <span>Target weight: {Math.round(additionalData.target * 10) / 10}g</span>
          </div>
          <div className="column-content">
            <div>
              {preproductionData.map(item => (
                <div key={item.id} className="entity-row">
                  <span>{item.id} | </span>
                  <span>{item.weight}g (~{Math.round(item.weight*additionalData.efficiency)}g)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="column">
          <div className="column-header">
            <h2>Storage</h2>
            <span>{additionalData.date}</span>
          </div>
          <div className="column-content">
            <div>
              {storageData.map(item => (
                <div key={item.id} className="entity-row">
                  <span>{item.id} | </span>
                  <span>weight: {item.weight}g</span>
                </div>
              ))}
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
                <div key={item.id} className="entity-row">
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