
/* 
-12,20,a
-23,23,a
50,-12,b
1,54,c
2,2,c
19,-7,b
-52,19,a
-1,30,a
-13,21,a
30,-22,b
11,34,c
-9,17,a
11,-41,b
32,-4,b
-1,21,a
55,-55,b
15,-25,b
32,12,c
9,7,c
50,51,c
-23,13,a
-34,29,a
*/

const CSVtoJson = (csv) => {
    
    const lines = csv.split("\n")
    let result = [];
    var headers = ["x", "y", "label"]
    for(let i = 0; i < lines.length; ++i) {
        let obj = {}
        const currentLine = lines[i].split(",")
        //Skip empty rows
        if(currentLine == "") continue
        
        for(let j=0; j < headers.length; ++j) {
            obj[headers[j]] = currentLine[j]
        }
        obj["index"] = i
        result.push(obj)
    }
    return result
}

export default CSVtoJson