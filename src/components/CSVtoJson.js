const CSVtoJson = (csv) => {
    
    const lines = csv.split("\n")
    let result = [];
    let headers = ["x", "y", "label"]
    let foundLabels = []
    for(let i = 0; i < lines.length; ++i) {
        let obj = {}
        const currentLine = lines[i].split(",")
        //Skip empty rows
        if(currentLine === "") continue
        
        for(let j=0; j < headers.length; ++j) {
            obj[headers[j]] = currentLine[j].trim()
        }
        if(!foundLabels.includes(currentLine[2])) {
            foundLabels.push(currentLine[2])
        }
        //Adding some stuff that will help identify each point
        obj["labelIndex"] = foundLabels.indexOf(currentLine[2])
        obj["index"] = i
        result.push(obj)
    }
    return result
}

export default CSVtoJson