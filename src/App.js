import './App.css';
import ScatterPlot from './components/ScatterPlot';
import CSVtoJson from './components/CSVtoJson';

import { useState, useEffect } from 'react';

function App() {
  const [csv, setCsv] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataset1, setDataset1] = useState(true);

  useEffect(()=> {
    load()
  },[])

 function load() {
    let address = ""
    if(dataset1) {
      address = "http://localhost:3000/data/data1.csv"
      setDataset1(false)
    }
    else {
      address = "http://localhost:3000/data/data2.csv"
      setDataset1(true)
    }
    fetch(address)
        .then( response => response.text())
        .then( responseText => {
            setCsv(CSVtoJson(responseText))
            setLoading(false)
    })
  }

  return (
    <div className="App">
      {
        loading ?
        <></>
        : 
        <ScatterPlot
          data={csv}
          width={500}
          height={300}
        />
      }
      <button style={{userSelect: "none"}} onClick={() => load()}>Swap Dataset</button>
    </div>
  );
}

export default App;
