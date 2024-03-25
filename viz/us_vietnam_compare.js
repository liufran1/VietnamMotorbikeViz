createCarbonCompareBars = function () {
  // Set up margins and dimensions
  const margin = { top: 20, right: 200, bottom: 30, left: 30 };
  const barWidth = 400;
  const centerWidth = 200;
  const height = 400 - margin.top - margin.bottom;
  const svgWidth = barWidth * 2 + margin.left + margin.right + centerWidth;

  var carbonScales = {};
  // Create SVG element
  const svg = d3
    .select("#us_vietnam_compare")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  drawAxes = function (svg, carbonScales, emissionsOrder) {
    // US side
    const yAxisUS = d3.axisLeft(carbonScales[emissionsOrder]);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("id", "y-axis-us")
      .attr(
        "transform",
        "translate(" + carbonScales["USScale"](0) + "," + 0 + ")",
      )
      .call(yAxisUS)
      .call((g) =>
        g
          .selectAll(".tick text")
          .attr("text-anchor", "middle")
          .attr("x", -centerWidth / 2),
      );

    // // VN side
    // const yAxis2 = d3.axisRight(carbonScales[emissionsOrder]);
    // svg
    //   .append("g")
    //   .attr("class", "y-axis")
    //   .attr(
    //     "transform",
    //     "translate(" + carbonScales["VNScale"](0) + "," + 0 + ")",
    //   )
    //   .attr("class", "y-axis")
    //   .attr("id", "y-axis-vn")
    //   .call(yAxis2.tickFormat(""));
  };

  d3.csv("./data/USACarbonSources_1990-2020.csv", d3.autoType).then(
    function (USAcarbonSources) {
      d3.csv("./data/VietnamCarbonSources_1990-2020.csv", d3.autoType).then(
        function (VietnamcarbonSources) {
          const filteredUSData = USAcarbonSources.filter(
            (d) => d["Year"] == 2020,
          )
            .filter((d) => d["value"] > 0)
            .sort((a, b) => d3.descending(a.value, b.value));
          const filteredVNData = VietnamcarbonSources.filter(
            (d) => d["Year"] == 2020,
          )
            .filter((d) => d["value"] > 0)
            .sort((a, b) => d3.descending(a.value, b.value));

          // TO DO: Fix scales
          // US scale
          const xScaleUS = d3
            .scaleLinear()
            .domain([0, d3.max(filteredUSData, (d) => d.value)])
            .range([
              margin.left + barWidth + centerWidth,
              margin.left + barWidth + centerWidth + barWidth,
            ]);

          // VN scale
          const xScaleVN = d3
            .scaleLinear()
            .domain([0, d3.max(filteredVNData, (d) => d.value)])
            .range([margin.left + barWidth, margin.left]);
          carbonScales["USScale"] = xScaleUS;
          carbonScales["VNScale"] = xScaleVN;

          const yScaleUS = d3
            .scaleBand()
            .domain(filteredUSData.map((d) => d.variable))
            .range([0, height])
            .padding(0.1);

          const yScaleVN = d3
            .scaleBand()
            .domain(filteredVNData.map((d) => d.variable))
            .range([0, height])
            .padding(0.1);

          carbonScales["USScale-y"] = yScaleUS;
          carbonScales["VNScale-y"] = yScaleVN;

          // console.log(filteredUSData.map((d) => d.variable));
          // console.log(filteredVNData.map((d) => d.variable));

          let emissionsRatio =
            d3.sum(filteredVNData, (d) => d.value) /
            d3.sum(filteredUSData, (d) => d.value);

          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                (carbonScales["VNScale"](0) + centerWidth / 2) +
                "," +
                0 +
                ")",
            )
            .attr("text-anchor", "middle")
            .text("Tonnes CO2 equivalent");

          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                (barWidth + carbonScales["USScale"](0)) +
                "," +
                0 +
                ")",
            )
            .attr("text-anchor", "middle")
            .text("United States");

          svg
            .append("text")
            .attr(
              "transform",
              "translate(" +
                (-barWidth + carbonScales["VNScale"](0)) +
                "," +
                0 +
                ")",
            )
            .attr("id", "vn-emissions-label")
            .attr("opacity", 0)
            .attr("text-anchor", "middle")
            .text("Vietnam");

          svg
            .selectAll(".barUS")
            .data(filteredUSData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", (d) => carbonScales["USScale-y"](d.variable))
            .attr("height", carbonScales["USScale-y"].bandwidth())
            .attr("x", carbonScales["USScale"](0))
            .attr("id", "usBars")
            .style("fill", (d) =>
              d.variable == "transport" ? "blue" : "black",
            )
            .attr("width", 0);

          svg
            .selectAll(".barVN")
            .data(filteredVNData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr(
              "y",
              (d) =>
                carbonScales["USScale-y"](d.variable) +
                carbonScales["USScale-y"].bandwidth() / 2 -
                3,
            )
            .attr(
              "height",
              carbonScales["USScale-y"].bandwidth() * emissionsRatio * 2,
            )
            .attr("id", "vnBars")
            .style("fill", (d) =>
              d.variable == "transport" ? "blue" : "black",
            )
            .attr("x", carbonScales["VNScale"](0))
            .attr("width", 0);

          // Add axes
          const xAxis1 = d3.axisBottom(carbonScales["USScale"]);
          svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .call(xAxis1.tickFormat(d3.format(".2s")));

          const xAxis2 = d3.axisBottom(carbonScales["VNScale"]);
          svg
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + 0 + "," + height + ")")
            .attr("id", "x-axis-vn")
            .attr("opacity", 0)
            .call(xAxis2.tickFormat(d3.format(".2s")));

          // Add y-axis
          drawAxes(svg, carbonScales, "USScale-y");
          // VN side
          const yAxis2 = d3.axisRight(carbonScales["USScale-y"]);
          svg
            .append("g")
            .attr("class", "y-axis")
            .attr(
              "transform",
              "translate(" + carbonScales["VNScale"](0) + "," + 0 + ")",
            )
            .attr("class", "y-axis")
            .attr("id", "y-axis-vn")
            .call(yAxis2.tickFormat(""));
          svg.select("#y-axis-vn").attr("opacity", 0);
        },
      );
    },
  );

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      svg
        .selectAll("#usBars")
        .transition()
        .duration(500)
        .attr(
          "width",
          (d) => carbonScales["USScale"](d.value) - carbonScales["USScale"](0),
        )
        .attr("y", (d) => carbonScales["USScale-y"](d.variable));

      svg
        .selectAll("#vnBars")
        .transition()
        .duration(500)
        .attr(
          "y",
          (d) =>
            carbonScales["USScale-y"](d.variable) +
            carbonScales["USScale-y"].bandwidth() / 2 -
            3,
        );

      svg.selectAll("#y-axis-us").remove().transition().duration(500);
      drawAxes(svg, carbonScales, "USScale-y");
    },
    function step1() {
      svg.selectAll("#x-axis-vn").transition().duration(500).attr("opacity", 1);
      svg.selectAll("#y-axis-vn").transition().duration(500).attr("opacity", 1);
      svg
        .selectAll("#vn-emissions-label")
        .transition()
        .duration(500)
        .attr("opacity", 1);

      svg
        .selectAll("#vnBars")
        .transition()
        .duration(500)
        .attr("x", (d) => carbonScales["VNScale"](d.value))
        .attr(
          "width",
          (d) => carbonScales["VNScale"](0) - carbonScales["VNScale"](d.value),
        );
    },
    function step2() {
      svg
        .selectAll("#vnBars")
        .transition()
        .duration(500)
        .attr(
          "y",
          (d) =>
            carbonScales["VNScale-y"](d.variable) +
            carbonScales["VNScale-y"].bandwidth() / 2 -
            3,
        );
      svg
        .selectAll("#usBars")
        .transition()
        .duration(500)
        .attr("y", (d) => carbonScales["VNScale-y"](d.variable));

      svg.selectAll("#y-axis-us").remove().transition().duration(500);
      drawAxes(svg, carbonScales, "VNScale-y");
    },
  ];
  return {
    update: update,
  };
};
