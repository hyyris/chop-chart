import { useState, useEffect } from 'react';
import './App.css';
import { fetchData, updateDataStatus } from './dataService';

function App() {
  const [preproductionData, setPreproductionData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [packingData, setPackingData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const preproduction = await fetchData('Preproduction');
      preproduction.sort((a, b) => b.id - a.id);
      setPreproductionData([...preproduction]);
      setStorageData([...await fetchData('Storage')]);
      setPackingData([...await fetchData('Packing')]);
    };

    getData();
    const interval = setInterval(() => {
      updateDataStatus();
      getData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const renderContent = (filteredData) => {
    return (
      <div>
        {filteredData.map(item => (
          <div key={item.id} className="entity-row">
            id: {item.id} | weight: {item.weight}g
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="columns">
        <div className="column">
          <div className="column-header">
            <h2>Preproduction</h2>
          </div>
          <div className="column-content">
            {renderContent(preproductionData)}
          </div>
        </div>
        <div className="column">
          <div className="column-header">
            <h2>Storage</h2>
          </div>
          <div className="column-content">
            {renderContent(storageData)}
          </div>
        </div>
        <div className="column">
          <div className="column-header">
            <h2>Packing</h2>
          </div>
          <div className="column-content">
            {renderContent(packingData)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;