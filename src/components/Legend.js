import React from "react";

const Legend = ({data, pointIcon, padding, height, FONT_SIZE}) => {
    const unique = [... new Set(data.map(x=>x.label))]
    
    return unique.map((label, i) => {
        const tempPoint = {
            x: padding + 50*i,
            y: height - 8,
            labelIndex: i
        }
        return (
            <React.Fragment key={label}>
                {pointIcon(tempPoint, 4, "red", false)}
                <text
                    key={i+"f"}
                    x={padding + 50*i + 10}
                    y={height - 8}
                    alignmentBaseline="middle"
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

export default Legend