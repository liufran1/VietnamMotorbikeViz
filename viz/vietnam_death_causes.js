createDeathBarGraphic = function () {
  var deathscales = {};
  // Set up margins and dimensions
  const margin = { top: 20, right: 200, bottom: 30, left: 250 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const legendHeight = 50;

  // Create SVG element
  const svg = d3
    .select("#health_bar_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function addLegend(color, y, text) {
    svg
      .append("rect")
      .attr("fill", color)
      .attr("opacity", 0.5)
      // .attr("stroke", "black")
      // .attr("stroke-width", 2)
      .attr("class", "deathbarlegend")
      .attr("y", y)
      .attr("height", legendHeight)
      .attr("x", width - legendHeight * 2)

      .attr("width", legendHeight * 2);

    svg
      .append("text")
      .attr(
        "transform",
        // "translate(" + 0 + "," + 0 + ")",
        "translate(" +
          (width - legendHeight) +
          "," +
          (y + legendHeight / 2) +
          ")",
      )
      .style("fill", "white")
      .attr("class", "deathbarlegend")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text(text);
    // .attr("text", text);
  }
  function initDeathBars() {
    d3.csv("./data/VietnamDeathCauses_1990-2019.csv", d3.autoType).then(
      function (deathData) {
        // Filter data for the year 2019
        const filteredData = deathData
          .filter((d) => d["Year"] == 2019)
          .sort((a, b) => d3.descending(a.value, b.value))
          .slice(0, 15);

        // Create scales
        const xScale = d3
          .scaleLinear()
          .domain([0, d3.max(filteredData, (d) => d.value)])
          .range([0, width]);

        deathscales["xScale"] = xScale;

        const yScale = d3
          .scaleBand()
          .domain(filteredData.map((d) => d.variable))
          .range([0, height])
          .padding(0.1);

        const colorScale = d3
          .scaleOrdinal()
          .domain(filteredData.map((d) => d["categories"]))
          .range([
            "#5E4FA2", // Health and diet
            "#66C2A5", // Drugs
            "#FF6666", // Environment
            // "#5E4FA2",
            // "#FEE08B",
            // "#FDAE61",
            // "#F46D43",
            // "#D53E4F",
            // "#9E0142",
          ]);
        // .range(d3.schemeCategory10);

        deathscales["colorScale"] = colorScale;

        // Create bars
        svg
          .selectAll(".DeathBar")
          .data(filteredData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", (d) => yScale(d.variable))
          .attr("height", yScale.bandwidth())
          .style("fill", (d) => colorScale(d.categories))
          // .attr("width", 0)
          .attr("id", "causes-of-death")
          // .transition()
          // .duration(500)
          .attr("width", (d) => xScale(d.value))
          .attr("opacity", 1);

        // Add axes
        const xAxis = d3.axisBottom(xScale);
        svg
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

        const yAxis = d3.axisLeft(yScale);
        svg.append("g").attr("class", "y-axis").call(yAxis);

        // "#5E4FA2", // Health and diet
        //   "#66C2A5", // Drugs
        //   "#FF6666", // Environment

        addLegend("#5E4FA2", height / 2, "Health and diet");
        addLegend("#66C2A5", height / 2 + legendHeight, "Drugs");
        addLegend("#FF6666", height / 2 + legendHeight * 2, "Environment");
      },
    );
  }
  initDeathBars();

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      svg.selectAll(".x-axis, .y-axis").remove();
      initDeathBars();
      svg
        .selectAll(".deathbarlegend")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      // d3.selectAll("#causes-of-death")
      //   .transition()
      //   .duration(500)
      //   .attr("width", (d) => deathscales["xScale"].call(d.value))
      //   .delay((d, i) => {
      //     return i * 100;
      //   });
      console.log("Death bars waypoint 0 triggered");
    },
    function step1() {
      d3.selectAll("#causes-of-death")
        .transition()
        .duration(500)
        .style("fill", (d) =>
          d.variable == "air pollution" ? "#FF6666" : "#bfbfbf",
        );
      svg
        .selectAll(".deathbarlegend")
        .transition()
        .duration(500)
        .attr("opacity", 0);
      // .attr("opacity", 0.5);
      // .style("fill", (d) =>
      //   d["categories"] == "Environmental Factors"
      //     ? deathscales["colorScale"].call(d["categories"])
      //     : "grey",
      // );
      console.log("Death bars waypoint 1 triggered");
    },
  ];

  return {
    update: update,
  };
};
