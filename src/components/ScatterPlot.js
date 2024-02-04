import React, { useEffect, useState } from "react";
import Legend from "./Legend";

const ScatterPlot = ({
    data, 
    width, 
    height, 
    maxX, 
    maxY, 
    minX, 
    minY, 
    horizontalGuides: numberOfYAxisGuides = 10,
    verticalGuides: numberOfXAxisGuides = 10,
    setCurrentPoint
}) => {

    const FONT_SIZE = width / 80
    const dataMaxX = maxX ? maxX : Math.max(...data.map((e)=> e.x))
    const dataMaxY = maxY ? maxY : Math.max(...data.map((e)=> e.y))
    const dataMinX = minX ? minX : Math.min(...data.map((e)=> e.x))
    const dataMinY = minY ? minY : Math.min(...data.map((e)=> e.y))

    //Interger versions of the data min and max values 
    const xMinPoint = Math.floor(dataMinX)
    const yMinPoint = Math.floor(dataMinY)
    const xMaxPoint = Math.ceil(dataMaxX)
    const yMaxPoint = Math.ceil(dataMaxY)

    const digits = parseFloat(dataMaxY.toString()).toFixed(0).length + 1

    //Padding around the plot
    const padding = (FONT_SIZE + digits) * 3 + 5
    //Chart width and height to calculate the points
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)

    //Constants for the axes
    /*
     (0,0)                                          (width, 0)
        +------------------------------------------------+
        |                                                |
        |   (pad,pad)              (width-pad, pad)      |
        |        +-----------------------------+         |
        |        |                             |         |
        |        |                             |         |
        |        |                             |         |
        |        +-----------------------------+         |
        |   (pad, height-pad)    (width-pad, height-pad) |
        |                                                |   
        +------------------------------------------------+
     (0, height)                                   (height, width)
    */
    const LEFT_X = padding
    const RIGHT_X = width - padding
    const BOTTOM_Y = height - padding 
    const TOP_Y = padding
    //Starting point for origin
    const ORIGIN_POINT = [LEFT_X, BOTTOM_Y]

    //State keeping track of the position of the origin
    const [origin, setOrigin] = useState(ORIGIN_POINT)

    //State keeping track of hovered point
    const [hovered, setHovered] = useState(null)

    //State keeping track of which point has been clicked
    const [clickedPoint, setClickedPoint] = useState(null)
    const [rightClickedPoint, setRightClickedPoint] = useState(null)

    //Euclidean variables keeping track if euclidean should be drawn and which points should be colored
    const [euclideanPoints, setEuclideanPoints] = useState([])
    
    // Reseting variables on data update
    useEffect(()=>{
        setClickedPoint(null)
        setRightClickedPoint(null)
        setHovered(null)
        setCurrentPoint(null)
        setOrigin(ORIGIN_POINT)
        setEuclideanPoints([])
    },[data])

    // Mapping data
    const points = data.map( element => {
        //Normalizing the data points so that they are in range of the plot
        const x = ((element.x - xMinPoint) / (xMaxPoint - xMinPoint)) * chartWidth + padding
        const y = chartHeight - ((element.y - yMinPoint) / (yMaxPoint - yMinPoint)) * chartHeight + padding
        return {
            index: element.index,           //Unique index for each data point
            x: x,
            y: y,
            label: element.label,           //Label from csv data
            labelIndex: element.labelIndex  //Label index based on the number of unique labels
        }
    })

    //General function for drawing axes
    const Axis = ({ points }) => (
        <polyline fill="none" stroke="#999" strokeWidth="0.5" points={points} />
    )

    const XAxis = () => {
        return <Axis
            points={`${LEFT_X},${origin[1]} ${RIGHT_X}, ${origin[1]}`}
        />
    }

    const YAxis = () => {
        return <Axis
            points={`${origin[0]},${TOP_Y} ${origin[0]}, ${BOTTOM_Y}`}
        />
    }

    // These two extra axes only show when the origin isn't in the original position
    const ExtraXAxis = () => {
        return <Axis
            points={`${LEFT_X},${BOTTOM_Y} ${RIGHT_X}, ${BOTTOM_Y}`}
        />
    }

    const ExtraYAxis = () => {
        return <Axis
            points={`${LEFT_X},${TOP_Y} ${LEFT_X}, ${BOTTOM_Y}`}
        />
    }

    const XAxisGuides = () => {
        const guideCount = numberOfXAxisGuides || data.length - 1

        const xAxis = height - padding //origin

        return new Array(guideCount).fill(0).map((_, index) => {
            const ratio = (index + 1) / guideCount

            const xCoordinate = padding + ratio * (width - (padding * 2)) // start of graph + ratio * width of chart

            return (
                <React.Fragment key={index}>
                    <polyline
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1.0"
                        points={`${xCoordinate},${xAxis-3} ${xCoordinate},${xAxis+3}`}
                    />
                </React.Fragment>
            )
        }) 
    }

    const YAxisGuides = () => {
        const guideCount = numberOfYAxisGuides || data.length - 1

        const yAxis = padding // top left corner

        return new Array(guideCount).fill(0).map((_, index) => {
            const ratio = (index + 1) / guideCount

            const yCoordinate = chartHeight - chartHeight * ratio + padding // start of graph + ratio * width of chart

            return (
                <React.Fragment key={index}>
                    <polyline
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1.0"
                        points={`${yAxis-3},${yCoordinate} ${yAxis+3},${yCoordinate}`}
                    />
                </React.Fragment>
            )
        }) 
    }

    const LabelsXAxis = () => {
        const PARTS = numberOfXAxisGuides || data.length - 1;
        const y = height - padding + FONT_SIZE * 2
        return new Array(PARTS + 1).fill(0).map((_, index) => {  
            const ratio = index / (numberOfXAxisGuides || data.length - 1);
            const x = padding + ratio * (width - (padding * 2)) 
            return (
            <text
                key={index}
                x={x}
                y={y}
                textAnchor="middle"
                style={{
                fill: "#808080",
                fontSize: FONT_SIZE,
                userSelect: "none"
                }}
            >
                {scale(index / PARTS, 0.0, 1.0, xMinPoint, xMaxPoint).toFixed(1)}
            </text>
            );
        });
    };

    //Rescales a number from one range to another
    const scale = (number, inMin, inMax, outMin, outMax) => {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
    }

    const LabelsYAxis = () => {
        const PARTS = numberOfYAxisGuides || data.length - 1;
        return new Array(PARTS + 1).fill(0).map((_, index) => {
            const x = FONT_SIZE + 5;
            const ratio = index / (numberOfYAxisGuides || data.length - 1);

            const yCoordinate = chartHeight - (chartHeight * ratio) + padding;
            return (
            <text
                key={index}
                x={x}
                y={yCoordinate}
                alignmentBaseline="middle"
                style={{
                fill: "#808080",
                fontSize: FONT_SIZE,
                userSelect: "none"
                }}
            >
                {scale(index / PARTS, 0.0, 1.0, yMinPoint, yMaxPoint).toFixed(1)}
            </text>
            );
        });
    };

    const POIStartHover = (p, e) => {
        e.target.style.fill = "gray"
        e.target.style.cursor = "pointer"
        setHovered(p.index)
    }

    const POIEndHover = (p, e, color) => {
        e.target.style.fill = color
        e.target.style.r = "3"
        setHovered(null)
    }

    const POIClick = (point,e) => {
        //console.log(point.x === origin[0] && point.y === origin[1]);
        if (e.type === 'click') {
            if(clickedPoint !== point.index) {
                const tempX = point.x
                const tempY = point.y
                setOrigin([tempX, tempY])
                setClickedPoint(point.index)
                setCurrentPoint(data[point.index])
            }
            else {
                setOrigin(ORIGIN_POINT)
                setClickedPoint(null)
                setCurrentPoint(null)
            }
        }
        else if (e.type === 'contextmenu') {
            if(rightClickedPoint !== point.index) {
                setRightClickedPoint(point.index)
                const temps = findEuclidean(points[point.index])
                setEuclideanPoints([...temps.map(x=>x.index)])
            }
            else {
                setRightClickedPoint(null)
                setEuclideanPoints([])
            }
        }
        
    }

    const pointIcon = (p, size, color, interactable) => {
        //console.log(p);
        const tempColor = euclideanPoints.includes(p.index) ? "black" : color
        const rhombusRadius = (Math.sqrt(size**2 + size**2))/2
        switch (p.labelIndex) {
            //Square
            case 1:
            return (
                <rect
                    key={p.x+""+p.y} 
                    x={p.x-(size/2)} 
                    y={p.y-(size/2)}  
                    width={size} 
                    height={size}
                    fill={tempColor}
                    stroke={(p.index === clickedPoint || p.index === rightClickedPoint) ? "black" : ""}
                    strokeWidth="1"
                    onClick={interactable ? (e) => POIClick(p, e) : null} 
                    onContextMenu={interactable ? (e) => POIClick(p, e) : null}
                    onMouseEnter={interactable ? (e) => POIStartHover(p, e) : null} 
                    onMouseLeave={interactable ? (e) => POIEndHover(p, e, tempColor) : null}
                />
            )
            //Rhombus
            case 2:   
            return (
                <rect 
                    key={p.x+""+p.y} 
                    width={size} 
                    height={size}
                    fill={tempColor}
                    stroke={(p.index === clickedPoint || p.index === rightClickedPoint) ? "black" : ""}
                    strokeWidth="1"
                    onClick={interactable ? (e) => POIClick(p,e) : null}
                    onContextMenu={interactable ? (e) => POIClick(p,e) : null} 
                    onMouseEnter={interactable ? (e) => POIStartHover(p, e) : null} 
                    onMouseLeave={interactable ? (e) => POIEndHover(p, e, tempColor) : null}
                    transform={`translate(${p.x}, ${p.y-rhombusRadius}) rotate(45, 0, 0)`}
                />
            )
            //Circle
            default:
            return (
                <circle 
                    key={p.x+""+p.y} 
                    cx={p.x}
                    cy={p.y} 
                    r={size / 2 + 0.2} 
                    fill={tempColor} 
                    stroke={(p.index === clickedPoint || p.index === rightClickedPoint) ? "black" : ""}
                    strokeWidth="1"
                    onClick={interactable ? (e) => POIClick(p,e) : null} 
                    onContextMenu={interactable ? (e) => POIClick(p,e) : null}
                    onMouseEnter={interactable ? (e) => POIStartHover(p, e) : null} 
                    onMouseLeave={interactable ? (e) => POIEndHover(p, e, tempColor) : null}
                />
            )
        }
    }

    /* 
                |
        p < x && p > y  |   p > x && p > y
                        |
                --------+--------
                        |
        p < x && p < y  |   p > x && p < y
                |
    */

    const POIs = () => {
        if(data) {
            return points.map( (p) => {
                //calculate which color the point should be
                let color = "red"
                if(p.x < origin[0] && p.y >= origin[1]) {
                    color = "orange"
                }
                else if(p.x < origin[0] && p.y < origin[1]) {
                    color = "blue"
                }
                else if (p.x >= origin[0] && p.y > origin[1]) {
                    color = "green"
                }
                return (
                    pointIcon(p, p.index === hovered ? 5 : 4, color, true)
                )
            })
        }
    }

    // Find the 5 closest points to the clicked point
    const findEuclidean = (point) => {
        //Array to store the found points
        const pointPairs = [];
        const p1 = point;
        for (let i = 0; i < points.length; ++i) {
            const p2 = points[i];
            if(p1.index === p2.index) continue //Don't compare to self
            const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2); //Euclidean distance
            //Store the index of the point and the distance to it
            pointPairs.push({ index: p2.index, x:p2.x, y:p2.y, distance:distance});
        }
        pointPairs.sort((a, b) => a.distance - b.distance);
        //console.log("pp", pointPairs.slice(0, 5));
        return (pointPairs.slice(0, 5)) //Return the first 5 points in the sorted array
    }

    //Draw lines to the closest 5 points
    const Euclidean = () => {
        //Find the point that has been clicked
        if(rightClickedPoint){
            const tempPoint = points.find(o => o.index === rightClickedPoint)
            console.log(tempPoint);
            if(tempPoint) {
                const tempArray = findEuclidean(tempPoint)
                return tempArray.map((point,i)=> {
                    return (
                        <polyline
                            key={i}
                            fill="none"
                            stroke="#ccc"
                            strokeWidth="1.0"
                            points={`${tempPoint.x},${tempPoint.y} ${point.x},${point.y}`}
                        />
                    )
                })
            }
        }
    }

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ border: "1.5px solid #000" }}
            onContextMenu={(e)=> e.preventDefault()}
        >
            <XAxis/>
            <YAxis/>
            {clickedPoint ? <><ExtraXAxis/> <ExtraYAxis/></>: <></>}
            <XAxisGuides/>
            <YAxisGuides/>
            <LabelsXAxis/>
            <LabelsYAxis/>
            <Euclidean/>
            <POIs/>
            <Legend data={data} pointIcon={pointIcon} padding={padding} height={height} FONT_SIZE={FONT_SIZE}/>
            
        </svg>
    )
}

export default ScatterPlot