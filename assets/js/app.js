// First creating canvas for scatter plot

// Width and Height parameters
var svgWidth = 900;
var svgHeight = 600;

// svg margins 
var margin = {
    top: 40,
    right: 40,
    bottom: 80,
    left: 90
};

// Setting the width and height based svg margins and parameters to fit chart
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Creating the canvas to append the SVG group that contains the states data
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Creating the chartGroup that contains the data
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Importing csv
var file = "assets/data/data.csv"

// Calling function and and passing csv data
d3.csv(file).then(successHandle, errorHandle);

// Error handling function to append data and SVG objects
// If error exist it will be only visible in console
function errorHandle(error) {
    throw err;
}

// Function takes in argument statesData
function successHandle(statesData) {

    // Loop through the data and pass argument data
    statesData.map(function (data) {
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
    });

    //  Create scale functions
    // Linear Scale takes the min to be displayed in axis, and the max of the data
    var xLinearScale = d3.scaleLinear()
        .domain([8.1, d3.max(statesData, d => d.poverty)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([20, d3.max(statesData, d => d.obesity)])
        .range([height, 0]);

    // Create axis functions by calling the scale functions

    var bottomAxis = d3.axisBottom(xLinearScale)
        // Adjust the number of ticks for the bottom axis  
        .ticks(7);
    var leftAxis = d3.axisLeft(yLinearScale);




    // Append the axes to the chart group 
    // Bottom axis moves using height 
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // Left axis is already at 0,0
    // Only append the left axis 
    chartGroup.append("g")
        .call(leftAxis);


    // Create Circles for scatter plot
    var circlesGroup = chartGroup.selectAll("circle")
        .data(statesData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.obesity))
        .attr("r", "13")
        .attr("fill", "#788dc2")
        .attr("opacity", ".75")


    // Append text to circles 

    var circlesGroup = chartGroup.selectAll()
        .data(statesData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.obesity))
        .style("font-size", "13px")
        .style("text-anchor", "middle")
        .style('fill', 'white')
        .text(d => (d.abbr));

    // Step 6: Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>Poverty: ${d.poverty}%<br>Obesity: ${d.obesity}% `);
        });

    // Step 7: Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data) {
            toolTip.hide(data);
        });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Obese (%)");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("In Poverty (%)");
}
