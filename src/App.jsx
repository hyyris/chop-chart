import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Preproduction');

  const renderContent = () => {
    switch (activeTab) {
      case 'Preproduction':
        return <div>Preproduction Content</div>;
      case 'Storage':
        return <div>Storage Content</div>;
      case 'Packing':
        return <div>Packing Content</div>;
      default:
        return null;
    }
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