// Creating canvas to hold chart

// Setting width and height
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 3.9;

// Setting margin
var margin = 20;

// Setting space for text
var labelArea = 110;

// Setting left and bottom padding for the text and Y axes
var bottomPadding = 40;
var leftPadding = 40;

// Creating the canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Setting the radius for circles that contain state abbreviations.

// Creating a functon to create circles
var circleRadius;
function createCircle() {
  if (width <= 530) {
    circleRadius = 5;
  }
  else {
    circleRadius = 10;
  }
}
createCircle();

// Creating labels for axes

// X Axis
// --------

// Creating a group element that contains X axes labels.
svg.append("g").attr("class", "xText");

// By setting xText we can easily reference the group.
var xText = d3.select(".xText");

function xTextRefresh() {
  xText.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - bottomPadding) +
      ")"
  );
}
xTextRefresh();

// Using xText we can append SVG files with the desired data

// Poverty
xText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// Age
xText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

// Income
xText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Y Axis
// --------

// Specifying the variables like this allows us to make our transform attributes more readable.
var yLabelX = margin + leftPadding;
var yLabelY = (height + labelArea) / 2 - labelArea;

// Creating a group element that contains Y axes labels.
svg.append("g").attr("class", "yText");

// By setting yText we can easily reference the group.
var yText = d3.select(".yText");

function yTextRefresh() {
  yText.attr(
    "transform",
    "translate(" + yLabelX + ", " + yLabelY + ")rotate(-90)"
  );
}
yTextRefresh();

// Using xText we can append SVG files with the desired data

// Obesity
yText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");

// Smokes
yText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

// Lacks Healthcare
yText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");


// Importing csv file.
// --------------------

d3.csv("assets/data/data.csv").then(function(data) {
  // Visualize the data
  visualize(data);
});

function visualize(theData) {
 
  // currentX and currentY determines what data is represented in each axis.
  var currentX = "poverty";
  var currentY = "obesity";

  // We can create variables for the min and max values of x and y to allow us to change the values in functions
  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Function to add tooltip
  var toolTip = d3
    .tip()
    .attr("class", "tooltip fade")
    .offset([40, -60])
    .html(function(d) {
    //   console.log(d)
      
      var xValue;
      
      var stateAbbrev = "<div>" + d.state + "</div>";
      // Setting variable to add to value of interest
      var yValue = "<div>" + currentY + ": " + d[currentY] + "%</div>";
      // If the x key is poverty
      if (currentX === "poverty") {
        // Grab the x key and a version of the value formatted to show percentage
        xValue = "<div>" + currentX + ": " + d[currentX] + "%</div>";
      }
      else {
        // Grab the x key and new value
        xValue = "<div>" +
          currentX +
          ": " +
          parseFloat(d[currentX]).toLocaleString("en") +
          "</div>";
      }
      return stateAbbrev + xValue + yValue;
    });

  svg.call(toolTip);

  // PART 2: Adjustable labels
  // --------------------------

  // Changing the min and max for x
  function xMinMax() {
    // min will grab the smallest data from the selected column.
    xMin = d3.min(theData, function(d) {
      return parseFloat(d[currentX]) * 0.90;
    });

    // max will grab the largest data from the selected column.
    xMax = d3.max(theData, function(d) {
      return parseFloat(d[currentX]) * 1.10;
    });
  }

  // b. change the min and max for y
  function yMinMax() {
    // min will grab the smallest data from the selected column.
    yMin = d3.min(theData, function(d) {
      return parseFloat(d[currentY]) * 0.90;
    });

    // max will grab the largest data from the selected column.
    yMax = d3.max(theData, function(d) {
      return parseFloat(d[currentY]) * 1.10;
    });
  }

  // Changing the label text when clicked.
  function labelChange(axis, clickedText) {
    // Switch the currently active to inactive.
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    // Switch the clicked text to show
    clickedText.classed("inactive", false).classed("active", true);
  }

  // Part 3: Creating the Scatter Plot
  // ------------------------------------

  // First grab the min and max values of x and y.
  xMinMax();
  yMinMax();

  // We can use min and max values to create our scales.

  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);
  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    // Height is inverted for y-axis placement
    .range([height - margin - labelArea, margin]);

//  Setting scales
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Setting x and y ticks
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    }
    else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  // Appending the axes in groups
  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  // We can now create a group for cicles and the state abbreviations.
  var dataCircles = svg.selectAll("g dataCircles").data(theData).enter();

  // Appending the circles for each state
  dataCircles
    .append("circle")
    .attr("cx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("cy", function(d) {
      return yScale(d[currentY]);
    })
    .attr("r", circleRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    // On mouseover
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d, this);
      d3.select(this).style("stroke");
    })
    .on("mouseout", function(d) {
      // Remove the tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select(this).style("stroke");
    });

    // Placing the state abbreviation in the circle
    dataCircles
    .append("text")
    .text(function(d) {
      return d.abbr;
    })
    .attr("dx", function(d) {
      return xScale(d[currentX]);
    })
    .attr("dy", function(d) {
      return yScale(d[currentY]) + circleRadius / 2.5;
    })
    .attr("font-size", circleRadius)
    .attr("class", "stateText")
    // Hover Rules
    .on("mouseover", function(d) {
      // Show the tooltip
      toolTip.show(d);
      // Highlight the state circle's border
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      // Remove tooltip
      toolTip.hide(d);
      // Remove highlight
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Part 4: Make the Graph Dynamic
  // --------------------------------

  // Selecting all axes and adding a click event.
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);

    // We only want to run this on inactive labels.
    if (self.classed("inactive")) {
      var axis = self.attr("data-axis");
      var name = self.attr("data-name");

      // When x is the saved axis, execute this:
      if (axis === "x") {
        // Make currentX the same as the data name.
        currentX = name;

        // Change the min and max of the x-axis
        xMinMax();

        // Update the domain of x.
        xScale.domain([xMin, xMax]);

        // Now use a transition when we update the xAxis.
        svg.select(".xAxis").transition().duration(200).call(xAxis);

        // When the axis changes, we want to update the location of circles and state abbreviations
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[currentX]);
            })
            .duration(200);
        });

        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[currentX]);
            })
            .duration(200);
        });

        // Also hange the classes of the last active label and the clicked label.
        labelChange(axis, self);
      }
      else {
        // When y is the selected axis, execute this:
        currentY = name;

        // Change the min and max of the y-axis.
        yMinMax();

        // Update the domain of y.
        yScale.domain([yMin, yMax]);

        // Update Y Axis
        svg.select(".yAxis").transition().duration(200).call(yAxis);

        // When the axis changes, we want to update the location of circles and state abbreviations as above
        d3.selectAll("circle").each(function() {

          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return yScale(d[currentY]);
            })
            .duration(200);
        });

        d3.selectAll(".stateText").each(function() {

          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return yScale(d[currentY]) + circleRadius / 3;
            })
            .duration(200);
        });

        labelChange(axis, self);
      }
    }
  });
}
