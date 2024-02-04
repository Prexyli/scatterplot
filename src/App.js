import './App.css'
import ScatterPlot from './components/ScatterPlot'
import CSVtoJson from './components/CSVtoJson'

import { useState, useEffect } from 'react'

function App() {
  const [csv, setCsv] = useState([])              //Stores the parsed csv data
  const [loading, setLoading] = useState(true)    //Not really necesary since the data is local and will be loaded fast but hey :)
  const [dataset, setDataset] = useState(true)    //Keeps track of which dataset should be displayed true = dataset1 and false = dataset2
  const [currentPoint, setCurrentPoint] = useState(null) // Just for debugging, making it easier to see the coordinates of the current clicked point

  //On loading page load the csv data
  useEffect(()=> {
    load(true)
  },[])

 function load(dataset) {
    let address = ""
    if(dataset) {
      address = "http://localhost:3000/data/data1.csv"
      setDataset(true)
    }
    else {
      address = "http://localhost:3000/data/data2.csv"
      setDataset(false)
    }
    fetch(address)
      .then( response => response.text())
      .then( responseText => {
          setCsv(CSVtoJson(responseText)) //parse the csv data to json object
          setLoading(false)
      })
  }

  return (
    <div className="App">
      {
        //if data is loading display nothing
        loading ?
        <div>...Loading</div>
        : 
        <ScatterPlot
          data={csv}
          width={500}
          height={300}
          minX={0}
          setCurrentPoint = {setCurrentPoint}
        />
      }
      <button style={{userSelect: "none"}} onClick={() => load(!dataset)}>Swap Dataset</button>
      <div style={{userSelect: "none"}}>{currentPoint ? `Clicked point ${currentPoint.index} : (${currentPoint.x}, ${currentPoint.y}) ` : ""}</div>
    </div>
  );
}

export default App;
