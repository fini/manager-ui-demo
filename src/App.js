import React from 'react';
import './App.css';
import FilteredInputField from './components/FilteredInputField';

function App() {
  return (
    <div className="App">
      <header className="App-header">        
        <h3>Filtered Input Selection Demo</h3>
        <h4>by Fini Alring, &copy;2020</h4>
      </header>

      <FilteredInputField 
          title="Favorite Manager"
          name="test"
          placeholder="Choose Manager..."
          dataUrl="https://gist.githubusercontent.com/daviferreira/41238222ac31fe36348544ee1d4a9a5e/raw/5dc996407f6c9a6630bfcec56eee22d4bc54b518/employees.json"
        />
        <br />
        <br />
        <button>Continue</button>
    </div>
  );
}

export default App;
