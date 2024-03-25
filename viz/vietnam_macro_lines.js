createMacroLinesGraphic = function () {
  var graphicEl = d3.select("#macro_lines");
  var graphicVisEl = graphicEl.select(".graphic__vis");
  var graphicProseEl = graphicEl.select(".graphic__prose");

  var lineColors = {
    populationLine: population_color,
    motorcycleLine: "red",
    gdpLine: "orange",
    co2Line: "green",
  };

  d3.csv("data/VietnamVehicles_1991-2022.csv", d3.autoType).then(
    function (vehicleData) {
      d3.csv("data/VietnamGDPpcap_1991-2022.csv", d3.autoType).then(
        function (gdpData) {
          d3.csv("data/VietnamCO2_1991-2022.csv", d3.autoType).then(
            function (carbonData) {
              initLines(vehicleData, gdpData, carbonData);
            },
          );
        },
      );
    },
  );

  function initLines(vehicleData, gdpData, carbonData) {
    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    let svgWidth = width + margin.left + margin.right;
    let svgHeight = height + margin.top + margin.bottom;

    const svg = graphicVisEl
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);

    const g = svg.append("g");

    let xScale = d3
      .scaleLinear()
      .domain(d3.extent(vehicleData, (d) => d["Year"]))
      .range([margin.left, width + margin.left]);

    let yScale1 = d3
      .scaleLinear()
      .domain([0, d3.max(vehicleData, (d) => d["Population"])])
      .range([height, 0]);

    let yScale2 = d3
      .scaleLinear()
      .domain([0, d3.max(gdpData, (d) => d["GDPperCapita"])])
      .range([height, 0]);

    let yScale3 = d3
      .scaleLinear()
      .domain([0, d3.max(carbonData, (d) => d["CO2_emissions"])])
      .range([height, 0]);

    drawLineChart(
      vehicleData,
      g,
      xScale,
      yScale1,
      "Year",
      "Population",
      lineColors["populationLine"],
      "populationLine",
    );

    drawLineChart(
      vehicleData,
      g,
      xScale,
      yScale1,
      "Year",
      "Total number of registered motorcycles",
      lineColors["motorcycleLine"],
      "motorcycleLine",
    );

    drawLineChart(
      gdpData,
      g,
      xScale,
      yScale2,
      "Year",
      "GDPperCapita",
      lineColors["gdpLine"],
      "gdpLine",
    );

    drawLineChart(
      carbonData,
      g,
      xScale,
      yScale3,
      "Year",
      "CO2_emissions",
      lineColors["gdpLine"],
      "co2Line",
    );
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues([1991, 2022])
      .tickFormat(d3.format("d"));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + margin.left + ", 0)")
      .call(d3.axisLeft(yScale1).ticks(4).tickFormat(d3.format(".2s")))
      .attr("opacity", 0)
      .attr("id", "populationLine-y-axis");

    svg
      .append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top)
      .attr("id", "populationLine-title")
      .style("font-size", "15px")
      .attr("opacity", 0)
      .text("Population");

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + margin.left + ", 0)")
      .call(d3.axisLeft(yScale1).ticks(4).tickFormat(d3.format(".2s")))
      .attr("opacity", 0)
      .attr("id", "motorcycleLine-y-axis");
    svg
      .append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top)
      .attr("id", "motorcycleLine-title")
      .style("font-size", "15px")
      .attr("opacity", 0)
      .text("Number of Registered Motorbikes");

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + margin.left + ", 0)")
      .call(d3.axisLeft(yScale2).ticks(4).tickFormat(d3.format(".1s")))
      .attr("opacity", 0)
      .attr("id", "gdpLine-y-axis");
    svg
      .append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top)
      .attr("id", "gdpLine-title")
      .style("font-size", "15px")
      .attr("opacity", 0)
      .text("GDP per capita (2022 US$)");

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + margin.left + ", 0)")
      .call(d3.axisLeft(yScale3).ticks(4).tickFormat(d3.format(".2s")))
      .attr("opacity", 0)
      .attr("id", "co2Line-y-axis");

    svg
      .append("text")
      .attr("x", margin.left + 10)
      .attr("y", margin.top)
      .attr("id", "co2Line-title")
      .style("font-size", "15px")
      .attr("opacity", 0)
      .text("Annual CO2 emissions (kilotons)");
  }

  function highlightLine(lineID) {
    for (const [key, value] of Object.entries(lineColors)) {
      graphicVisEl.select("#" + key).style("stroke", "grey");
      graphicVisEl.select("#" + key + "-y-axis").attr("opacity", 0);
      graphicVisEl.select("#" + key + "-title").attr("opacity", 0);
    }
    graphicVisEl.select("#" + lineID).style("stroke", lineColors[lineID]);
    graphicVisEl.select("#" + lineID + "-y-axis").attr("opacity", 1);
    graphicVisEl.select("#" + lineID + "-title").attr("opacity", 1);
  }

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      highlightLine("populationLine");
      graphicVisEl
        .select("#populationLine")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);
    },
    function step1() {
      highlightLine("gdpLine");

      graphicVisEl
        .select("#gdpLine")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);
    },
    function step2() {
      highlightLine("motorcycleLine");

      graphicVisEl
        .select("#motorcycleLine")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);
    },
    function step3() {
      highlightLine("co2Line");

      graphicVisEl
        .select("#co2Line")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);
    },
  ];

  return {
    update: update,
  };
};

function drawLineChart(
  dataset,
  groupElement,
  xScale,
  yScale,
  xVariable,
  yVariable,
  color,
  elementID,
) {
  let graph = groupElement
    .append("path")
    .datum(dataset)
    .attr(
      "d",
      d3
        .line()
        .x((d) => xScale(d[xVariable]))
        .y((d) => yScale(d[yVariable])),
    )
    .attr("stroke", color)
    .attr("stroke-width", 0.5)
    .attr("fill", "none")
    .attr("id", elementID);

  // console.log(
  //   "Node length for " + elementID + " : " + graph.node().getTotalLength(),
  // );

  graph
    .attr("stroke-dashoffset", graph.node().getTotalLength()) // Animation trick from https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61
    .attr("stroke-dasharray", graph.node().getTotalLength());

  return graph;
}
