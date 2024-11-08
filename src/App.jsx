import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Preproduction');
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:3001/api/${activeTab}`);
      const result = await response.json();
      setData(result);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const renderContent = () => {
    return <div>{data.message || 'Loading...'}</div>;
  };

  return (
    <div className="App">
      <nav>
        <ul>
          <li className={activeTab === 'Preproduction' ? 'active' : ''} onClick={() => setActiveTab('Preproduction')}>Preproduction</li>
          <li className={activeTab === 'Storage' ? 'active' : ''} onClick={() => setActiveTab('Storage')}>Storage</li>
          <li className={activeTab === 'Packing' ? 'active' : ''} onClick={() => setActiveTab('Packing')}>Packing</li>
        </ul>
      </nav>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;