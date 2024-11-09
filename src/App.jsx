import { useState, useEffect } from 'react';
import './App.css';
import { fetchData, updateDataStatus, getAdditionalData } from './dataService';

function App() {
  const [preproductionData, setPreproductionData] = useState([]);
  const [storageData, setStorageData] = useState([]);
  const [packingData, setPackingData] = useState([]);
  const [additionalData, setAdditionalData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Settings
  const [targetWeight, setTargetWeight] = useState(290);
  const [maxDeviation, setMaxDeviation] = useState(0.03);
  const [acceptedDeviation, setAcceptedDeviation] = useState(0.02);
  const [dryingLoss, setDryingLoss] = useState(0.01);
  const [speed, setSpeed] = useState(1.0);

  const getColor = (estimatedWeight) => {
    if (estimatedWeight >= additionalData.target * (1 - additionalData.deviation)
      && estimatedWeight <= additionalData.target * (1 + additionalData.deviation)) {
        return 'var(--good-color)';
    }
    const isNotAllowed =  
      estimatedWeight < additionalData.minAllowed ||
      estimatedWeight > additionalData.maxAllowed;
    const style = isNotAllowed 
      ? 'var(--bad-color)' 
      : 'var(--okish-color)';
    
    return style;
  }

  useEffect(() => {
    const getData = async () => {
      const preproduction = await fetchData('Preproduction');
      preproduction.sort((a, b) => b.id - a.id);
      setPreproductionData([...preproduction]);
      setStorageData([...await fetchData('Storage')]);
      setPackingData([...await fetchData('Packing')]);
      setAdditionalData(await getAdditionalData({
        targetWeight: targetWeight,
        maxDeviation: maxDeviation / 100,
        acceptedDeviation: acceptedDeviation / 100,
        dryingLoss: dryingLoss / 100,
      }));
      
    };

    getData();
    const interval = setInterval(() => {
      updateDataStatus();
      getData();
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [speed, targetWeight, maxDeviation, acceptedDeviation, dryingLoss]);

  const handleCogwheelClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleTargetWeightChange = (e) => setTargetWeight(e.target.value);
  const handleMaxDeviationChange = (e) => setMaxDeviation(e.target.value);
  const handleAcceptedDeviationChange = (e) => setAcceptedDeviation(e.target.value);
  const handleDryingLossChange = (e) => setDryingLoss(e.target.value);
  const handleSpeedChange = (e) => setSpeed(e.target.value);

  return (
    <div className="App">
      <div className="settings-icon" onClick={handleCogwheelClick} style={{ color: '#ccc' }}>
        <i className="fas fa-cog"></i>
      </div>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content" style={{ backgroundColor: '#333', color: '#fff' }}>
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Settings</h2>
            <label>
              Target weight:
              <br /><input type="number" value={targetWeight} onChange={handleTargetWeightChange} required />g
            </label>
            <br />
            <label>
              Max deviation:
              <br /><input type="number" value={maxDeviation} onChange={handleMaxDeviationChange} required />%
            </label>
            <br />
            <label>
              Accepted deviation:
              <br /><input type="number" value={acceptedDeviation} onChange={handleAcceptedDeviationChange} required />%
            </label>
            <br />
            <label>
              Drying loss:
              <br /><input type="number" value={dryingLoss} onChange={handleDryingLossChange} required />%
            </label>
            <br />
            <label>
              Throttle:
              <br />
              <input type="range" min="0.1" max="2.0" step="0.1" value={speed} onChange={handleSpeedChange} required />
              <span>{speed}s</span>
            </label>
          </div>
        </div>
      )}
      <div className="columns">
        <div className="column">
          <div className="column-header">
            <h2>Preproduction</h2>
            <div className="target-weight">
              <span style={{color: 'var(--good-color)'}}>{additionalData.rawTarget}g</span>
              <span>Pre-target weight</span>
            </div>
          </div>
          <div className="column-content">
            <div>
              {preproductionData.map(item => {
                const estimatedWeight = item.weight * additionalData.efficiency;
                return (
                  <div key={item.id} className="entity-row" style={{borderColor: getColor(estimatedWeight)}}>
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
            <div className="target-weight">
              <span>{additionalData.avgStorage}</span>
              <span>Avg storage days</span>
            </div>
          </div>
          <div className="column-content">
            <div>
              {storageData.map(item => {
                const estimatedWeight = item.weight * (1 - (item.currentTimeInStorage || 0) * additionalData.dryingLoss);
                return (
                <div key={item.id} className="entity-row" 
                  style={{borderColor: getColor(estimatedWeight)}}>
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
            <div className="target-weight">
              <span>
                <span style={{color: getColor(additionalData.avgWeight), 'font-size': '1em'}}>{Math.round(additionalData.avgWeight)}</span>
                <span style={{color: 'white', 'font-size': '0.5em'}}>/{additionalData.target}g</span>
              </span>
              <span>avg/target</span>
            </div>
          </div>
          <div className="column-content">
            <div>
              {packingData.map(item => (
                <div key={item.id} className="entity-row" style={{borderColor: getColor(item.weight)}}>
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