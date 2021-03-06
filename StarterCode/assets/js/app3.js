// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(popData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(popData, d => d[chosenXAxis]) * 0.8,
      d3.max(popData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }
  // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
//function to update state abbr's
// function updateStateText(chartGroup, newXScale, chosenXaxis) {

//   chartGroup.transition()
//     .duration(1000)
//     .attr("x", d => newXScale(d[chosenXAxis]));

//   return chartGroup;
// }
function UpdateStateAbbr() {
    d3.selectAll(".stateabbr")
      .transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
    return chartGroup;
  }


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "obesity") {
      var label = "% of Obese Population:";
    }
    else {
      var label = "% of Population that Smokes";
    }
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
  // onmouseout event
  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

return circlesGroup;//how it redraws the circles
}

// Import Data
d3.csv("../data/data.csv", function(err, popData) {
    if (err) throw err;
// d3.csv("../data/data.csv")
//     .then(function(popData) {

    // Parse Data/Cast as numbers
    // ==============================
    popData.forEach(function(data) {
      data.obesity = +data.obesity;
      data.age = +data.age;
      data.smokes = +data.smokes;
    });
    // xLinearScale function above csv import
  var xLinearScale = xScale(popData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(popData, d => d.age)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
     
  

    // Create Circles, Center x, xenter y and radius
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
      .data(popData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.age))
      .attr("r", 15)
      .attr("fill", "blue")
      .attr("fill-opacity", ".5");

    //Append State labels to circles
    chartGroup.selectAll("text")
        .data(popData)
        .enter()
        .append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.age))
        .attr("class","stateabbr")
        .text(d => {
          return d.abbr;
        });

        // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

        // append y axis
    chartGroup.append("g")
        .call(leftAxis);




      // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var obesityLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("% of Obese Pop");
    var smokesLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("% of Pop that Smokes");
        // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Average Age of Pop");
        // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  
    //Below - labels group is label assoc w x axis

    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(popData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          

          
          // changes classes to change bold text
          if (chosenXAxis === "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
    });
    
});

// function UpdateStateAbbr() {
//   d3.selectAll(".stateabbr")
//     .transition()
//     .duration(1000)
//     .attr("x", d => newXScale(d[chosenXAxis]));
//   return chartGroup;
// }
// g tag inside 
//* <text x="50" y="50">NC</text> *//