import React, { useEffect, useState } from "react";

const ScatterPlot = ({
    data, 
    width, 
    height, 
    maxX, 
    maxY, 
    minX, 
    minY, 
    padX = 0, 
    padY = 0,
    horizontalGuides: numberOfHorizontalGuides = 10,
    verticalGuides: numberOfVerticalGuides = 10
}) => {

    const FONT_SIZE = width / 80
    const dataMaxX = maxX ? maxX : Math.max(...data.map((e)=> e.x)) + padX
    const dataMaxY = maxY ? maxY : Math.max(...data.map((e)=> e.y)) + padY
    const dataMinX = minX ? minX : Math.min(...data.map((e)=> e.x)) - padX
    const dataMinY = minY ? minY : Math.min(...data.map((e)=> e.y)) - padY

    const digits = parseFloat(dataMaxY.toString()).toFixed(0).length + 1

    //Padding around the plot
    const padding = (FONT_SIZE + digits) * 3 + 5
    //Chart width and height to calculate the points
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)

    useEffect(()=>{
        setClickedPoint(-1)
        setOrigin(ORIGIN_POINT)
        setDrawEuclidean(false)
        setColorEuclidean([])
    },[data])

    const [drawEuclidean, setDrawEuclidean] = useState(false)
    const [colorEuclidean, setColorEuclidean] = useState([])
    
    
    const points = data.map( element => {
        //Normalizing the data points so that they are in range of the plot
        const x = ((element.x - dataMinX) / (dataMaxX - dataMinX)) * chartWidth + padding
        const y = chartHeight - ((element.y - dataMinY) / (dataMaxY - dataMinY)) * chartHeight + padding
        return {
            index: element.index,
            x: x,
            y: y,
            label: element.label,
            labelIndex: element.labelIndex
        }
    })

    //General function for drawing axes
    const Axis = ({ points }) => (
        <polyline fill="none" stroke="#999" strokeWidth="0.5" points={points} />
    )

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
    
    let leftX = padding
    let rightX = width - padding
    let bottomY = height - padding
    let topY = padding

    const ORIGIN_POINT = [height - padding, padding]

    const [origin, setOrigin] = useState(ORIGIN_POINT)

    const XAxis = () => {
        return <Axis
            points={`${leftX},${origin[0]} ${rightX}, ${origin[0]}`}
        />
    }

    const YAxis = () => {
        return <Axis
            points={`${origin[1]},${topY} ${origin[1]}, ${bottomY}`}
        />
    }

    const VerticalGuides = () => {
        const guideCount = numberOfVerticalGuides || data.length - 1

        const startY = padding // top left corner
        const endY = height - padding //origin

        return new Array(guideCount).fill(0).map((_, index) => {
            const ratio = (index + 1) / guideCount

            const xCoordinate = padding + ratio * (width - (padding * 2)) // start of graph + ratio * width of chart

            return (
                <React.Fragment key={index}>
                    <polyline
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1.0"
                        points={`${xCoordinate},${endY-3} ${xCoordinate},${endY+3}`}
                    />
                </React.Fragment>
            )
        }) 
    }

   
    const HorizontalGuides = () => {
        const guideCount = numberOfHorizontalGuides || data.length - 1

        const startX = padding // top left corner
        const endX = width - padding //origin

        return new Array(guideCount).fill(0).map((_, index) => {
            const ratio = (index + 1) / guideCount

            const yCoordinate = chartHeight - chartHeight * ratio + padding // start of graph + ratio * width of chart

            return (
                <React.Fragment key={index}>
                    <polyline
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="1.0"
                        points={`${startX-3},${yCoordinate} ${startX+3},${yCoordinate}`}
                    />
                </React.Fragment>
            )
        }) 
    }

    const LabelsXAxis = () => {
        const PARTS = numberOfVerticalGuides || data.length - 1;
        const y = height - padding + FONT_SIZE * 2
        return new Array(PARTS + 1).fill(0).map((_, index) => {  
            const ratio = index / (numberOfVerticalGuides || data.length - 1);
            const x = padding + ratio * (width - (padding * 2) - (FONT_SIZE / 2)) 
            return (
            <text
                key={index}
                x={x}
                y={y}
                style={{
                fill: "#808080",
                fontSize: FONT_SIZE,
                userSelect: "none"
                }}
            >
                {parseFloat(dataMaxY * (index / PARTS)).toFixed(0)}
            </text>
            );
        });
    };

    const LabelsYAxis = () => {
        const PARTS = numberOfHorizontalGuides || data.length - 1;
        return new Array(PARTS + 1).fill(0).map((_, index) => {
            const x = FONT_SIZE + 5;
            const ratio = index / (numberOfHorizontalGuides || data.length - 1);

            const yCoordinate = chartHeight - (chartHeight * ratio) + padding + FONT_SIZE / 2;
            return (
            <text
                key={index}
                x={x}
                y={yCoordinate}
                style={{
                fill: "#808080",
                fontSize: FONT_SIZE,
                userSelect: "none"
                }}
            >
                {parseFloat(dataMaxY * (index / PARTS)).toFixed(0)}
            </text>
            );
        });
    };

    const POIStartHover = (e) => {
        e.target.style.fill = "gray"
        //e.target.style.r = "4"
        e.target.style.cursor = "pointer"
    }

    const POIEndHover = (p,e, color) => {
        // let color = "red"
        // if(p.x <= origin[1] && p.y >= origin[0]) {
        //     color = "orange"
        // }
        // else if(p.x < origin[1] && p.y < origin[0]) {
        //     color = "blue"
        // }
        // else if (p.x >= origin[1] && p.y <= origin[0]) {
        //     color = "green"
        // }
        //console.log(e);
        e.target.style.fill = color
        e.target.style.r = "3"
    }

    const [clickedPoint, setClickedPoint] = useState(-1)
    const POIClick = (point,e) => {
        //console.log(point.x === origin[0] && point.y === origin[1]);
        if (e.type === 'click') {
            if(clickedPoint != point.index) {
                const tempX = point.x
                const tempY = point.y
                setOrigin([tempY, tempX])
                setClickedPoint(point.index)
                setDrawEuclidean(false)
                setColorEuclidean([])
            }
            else {
                setOrigin(ORIGIN_POINT)
                setClickedPoint(-1)
                setDrawEuclidean(false)
                setColorEuclidean([])
            }
        }
        else if (e.type === 'contextmenu') {
            if(clickedPoint != point.index) {
                setClickedPoint(point.index)
                setOrigin(ORIGIN_POINT)
                setDrawEuclidean(true)
            }
            else {
                setOrigin(ORIGIN_POINT)
                setClickedPoint(-1)
                setDrawEuclidean(false)
                setColorEuclidean([])
            }
        }
        
    }

    const pointIcon = (p,color,index) => {
        //console.log(p);
        const tempColor = colorEuclidean.includes(p.index) ? "black" : color
        switch (p.labelIndex) {
            case 1:
            return (
                <rect
                    key={p.x+""+p.y} 
                    x={p.x-2.5} 
                    y={p.y-2.5}  
                    width="5" 
                    height="5"
                    fill={tempColor}
                    stroke={p.index === clickedPoint ? "black" : ""}
                    strokeWidth="1"
                    onClick={(e) => POIClick(p,e)} 
                    onContextMenu={(e) => POIClick(p,e)}
                    onMouseEnter={POIStartHover} 
                    onMouseLeave={(e) => POIEndHover(p,e,tempColor)}
                />
            )
        case 2:
            return (
                <rect 
                    key={p.x+""+p.y} 
                    width="5" 
                    height="5"
                    fill={tempColor}
                    stroke={p.index === clickedPoint ? "black" : ""}
                    strokeWidth="1"
                    onClick={(e) => POIClick(p,e)}
                    onContextMenu={(e) => POIClick(p,e)} 
                    onMouseEnter={POIStartHover} 
                    onMouseLeave={(e) => POIEndHover(p,e,tempColor)}
                    transform={`translate(${p.x}, ${p.y-3.5}) rotate(45, 0, 0)`}
                />
            )
        default:
            return (
                <circle 
                    key={p.x+""+p.y} 
                    cx={p.x}
                    cy={p.y} 
                    r="3" 
                    fill={tempColor} 
                    stroke={p.index == clickedPoint ? "black" : ""}
                    strokeWidth="1"
                    onClick={(e) => POIClick(p,e)} 
                    onContextMenu={(e) => POIClick(p,e)}
                    onMouseEnter={POIStartHover} 
                    onMouseLeave={(e) => POIEndHover(p,e,tempColor)}
                />
            )
        }
    }

    const Legend = () => {
        const unique = [... new Set(data.map(x=>x.label))]
        
        return unique.map((label, i) => {
            const tempPoint = {
                x: padding + 50*i,
                y: height - 8,
                labelIndex: i
            }
            return (
                <React.Fragment key={label}>
                    {pointIcon(tempPoint, "red", i)}
                    <text
                        key={i+"f"}
                        x={padding + 50*i + 10}
                        y={height - 5}
                        style={{
                            fill: "#808080",
                            fontSize: FONT_SIZE + 5,
                            userSelect: "none"
                        }}
                    >
                        {label}
                    </text>
                </React.Fragment>
                

            )
        })
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
            return points.map( (p, index) => {
                //calculate which color the point should be
                let color = "red"
                if(p.x <= origin[1] && p.y >= origin[0]) {
                    color = "orange"
                }
                else if(p.x < origin[1] && p.y < origin[0]) {
                    color = "blue"
                }
                else if (p.x >= origin[1] && p.y <= origin[0]) {
                    color = "green"
                }
                return (
                    pointIcon(p, color, index)
                )
            })
        }
    }

    useEffect(()=> {
        console.log("clicked", clickedPoint);
        const temps = clickedPoint >= 0 ? findEuclidean(points[clickedPoint]) : [];
        
        console.log("temps",temps);
        drawEuclidean ? setColorEuclidean([...temps.map(x=>x.index)]) : <></>
    },[clickedPoint])

    const findEuclidean = (point) => {
        if(clickedPoint > 0) {
            const pointPairs = [];
            const p1 = point;
            for (let i = 0; i < points.length; ++i) {
                const p2 = points[i];
                if(p1.index == p2.index) continue //Don't compare to self
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                pointPairs.push({ index: p2.index, x: p2.x, y: p2.y, distance:distance});
            }
            pointPairs.sort((a, b) => a.distance - b.distance);
            console.log("pp", pointPairs.slice(0, 5));
            return (pointPairs.slice(0, 5))
        }
    }

    const Euclidean = () => {
        const tempPoint = points.find(o => o.index === clickedPoint)
        //console.log("tempPoint",tempPoint);
        const tempArray = findEuclidean(tempPoint)
        //console.log("temparray",tempArray);
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

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ border: "1.5px solid #000" }}
            onContextMenu={(e)=> e.preventDefault()}
        >
            <XAxis/>
            <YAxis/>
            <VerticalGuides/>
            <HorizontalGuides/>
            <LabelsXAxis/>
            <LabelsYAxis/>
            {drawEuclidean && clickedPoint > 0 ? <Euclidean/> : <></>}
            <POIs/>
            <Legend/>
            
        </svg>
    )
}

export default ScatterPlot