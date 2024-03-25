createPollutionLines = function () {
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const svgHeight = 600;
  const svgWidth = 800;
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;
  const colorDict = {
    hanoi: "blue",
    nyc: "orange",
  };

  let svgPM = d3
    .select("#pmline")
    .append("svg")
    .attr("height", svgHeight) // TO DO - Make adaptive
    .attr("width", svgWidth);

  let groupPM25 = svgPM.append("g");

  d3.csv("data/VietnamVsNYCpmpollution_2023.csv", d3.autoType).then(
    function (pollutionData) {
      let xScale = d3
        .scaleTime()
        .domain(d3.extent(pollutionData, (d) => d["date"]))
        .range([margin.left, width + margin.left]);

      let yScale = d3
        .scaleLinear()
        .domain([0, d3.max(pollutionData, (d) => d["pm25"])])
        .range([height + margin.top, margin.top]);

      groupPM25
        .append("text")
        .attr("x", width - 150)
        .attr("y", yScale(15))
        .attr("class", "who-level-title")
        .style("font-size", "15px")
        .attr("opacity", 0)
        .text("WHO recommended");
      groupPM25
        .append("text")
        .attr("x", width - 150)
        .attr("y", yScale(5))
        .attr("class", "who-level-title")
        .style("font-size", "15px")
        .attr("opacity", 0)
        .text("safe PM 2.5 concentration");

      // TO DO: consider inverting, so that the safe range is below the bar instead of above
      groupPM25
        .append("rect")
        // .attr("y", yScale(50))
        // .attr("height", yScale(50))
        .attr("y", margin.top)
        .attr("height", yScale(50) - margin.top)
        .attr("fill", "grey")
        .attr("opacity", 0.3)
        .attr("opacity", 0)
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
        .attr("x", margin.left)
        .attr("width", width)
        .attr("id", "who-pm25-rect");

      groupPM25
        .append("text")
        .attr("x", width - 50)
        .attr("y", yScale(200))
        .attr("id", "hanoi-level-title")
        .style("font-size", "15px")
        .attr("opacity", 0)
        .attr("fill", colorDict["hanoi"])
        .text("Hanoi");

      drawLineChart(
        pollutionData.filter((d) => d["city"] === "Hanoi"),
        groupPM25,
        xScale,
        yScale,
        "date",
        "pm25",
        colorDict["hanoi"],
        "hanoiPMline",
      );

      groupPM25
        .append("text")
        .attr("x", margin.left + 30)
        .attr("y", yScale(20))
        .attr("id", "nyc-level-title")
        .style("font-size", "15px")
        .attr("opacity", 0)
        .attr("fill", colorDict["nyc"])
        .text("NYC");

      drawLineChart(
        pollutionData.filter((d) => d["city"] === "New York"),
        groupPM25,
        xScale,
        yScale,
        "date",
        "pm25",
        colorDict["nyc"],
        "nycPMline",
      );

      const xAxis = d3
        .axisBottom(xScale)
        .ticks(4)
        .tickFormat(d3.timeFormat("%B"));

      svgPM
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, " + (height + margin.top) + ")")
        .call(xAxis);

      const yAxis = d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".2s"));

      svgPM
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ", -" + 0 + ")")
        .call(yAxis);
      svgPM
        .append("text")
        .attr("x", margin.left + 10)
        .attr("y", margin.top * 2)
        .style("font-size", "15px")
        .text("PM 2.5 individual AQI");
    },
  );

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      groupPM25
        .selectAll("#hanoiPMline")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);

      groupPM25
        .selectAll("#hanoi-level-title")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("opacity", 1);
    },
    function step1() {
      groupPM25
        .selectAll("#who-pm25-rect")
        .transition()
        .duration(500)
        .attr("opacity", 0.3);

      groupPM25
        .selectAll(".who-level-title")
        .transition()
        .duration(500)
        .attr("opacity", 1);
    },
    function step2() {
      groupPM25
        .selectAll("#nycPMline")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);

      groupPM25
        .selectAll("#nyc-level-title")
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("opacity", 1);
    },
  ];
  return {
    update: update,
  };
};
