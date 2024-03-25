createSalesGraphic = function () {
  const margin = { top: 20, right: 40, bottom: 40, left: 30 };
  const width = (1000 * 2) / 3 - margin.left - margin.right;
  const height = (800 * 2) / 3 - margin.top - margin.bottom;
  const labelFontSize = "10px";
  const labelFontWeight = 400;
  var translatex = 3500;
  var translatey = 200;

  var scales = {};

  const svg = d3
    .select("#regulations_area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // .attr("viewBox", [0, 0, width, height]);
  // .attr("style", "max-width: 100%; height: auto;");

  // Append a path for each series.
  let g = svg.append("g");

  d3.csv("data/VietnamVehicles_1991-2022.csv", d3.autoType).then(
    function (vehicleData) {
      d3.csv("./data/VietnamMotorbikeFleet_1991-2020.csv", d3.autoType).then(
        function (rawfleetData) {
          const fleetData = rawfleetData.filter((d) => d["Year"] <= 2020);

          // Determine the series that need to be stacked.
          const series = d3
            .stack()
            .keys(d3.union(fleetData.map((d) => d["category"]))) // distinct series keys, in input order
            .value(([, D], key) => D.get(key)["count"])(
            // get value for each series key and stack
            d3.index(
              fleetData,
              (d) => d["Year"],
              (d) => d["category"],
            ),
          ); // group by stack then series key

          // Prepare the scales for positional and color encodings.
          const xScale = d3
            .scaleLinear()
            .domain(d3.extent(fleetData, (d) => d["Year"]))
            .range([margin.left, width - margin.right]);

          scales["x"] = xScale;

          const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1]))])
            .rangeRound([height - margin.bottom, margin.top]);

          const color = d3
            .scaleOrdinal()
            .domain(series.map((d) => d.key))
            .range(d3.schemeTableau10);

          // Construct an area shape.
          const area = d3
            .area()
            .x((d) => xScale(d.data[0]))
            .y0((d) => yScale(d[0]))
            .y1((d) => yScale(d[1]));

          // Add the y-axis, remove the domain line, add grid lines and a label.
          //
          g.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(
              d3
                .axisLeft(yScale)
                .ticks(height / 80)
                .tickFormat(d3.format(".2s")),
            )
            .call((g) => g.select(".domain").remove())
            .call((g) =>
              g
                .selectAll(".tick line")
                .clone()
                .attr("x2", width - margin.left - margin.right)
                .attr("stroke-opacity", 0.1),
            );
          // .call((g) =>
          //   g
          //     .append("text")
          //     .attr("x", -margin.left)
          //     .attr("y", 10)
          //     .attr("fill", "currentColor")
          //     .attr("text-anchor", "start"),
          // );
          // .text("↑ Unemployed persons"));

          g.selectAll()
            .data(series)
            .join("path")
            .attr("fill", (d) => color(d.key))
            .attr("d", area)
            .append("title")
            .text((d) => d.key);

          drawLineChart(
            vehicleData,
            g,
            xScale,
            yScale,
            "Year",
            "Total number of registered cars",
            "black",
            "carsLine",
          );

          // Append the horizontal axis atop the area.
          g.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
              d3.axisBottom(xScale).tickSizeOuter(0).tickFormat(d3.format("d")),
            );

          g.append("text")
            .attr("x", margin.left)
            .attr("y", yScale(15000000))
            .style("font-size", labelFontSize)
            .style("font-weight", 800)
            .style("fill", color("pre_2007_motorbikes"))
            .text("Motorbikes not covered");
          g.append("text")
            .attr("x", margin.left)
            .attr("y", yScale(12000000))
            .style("font-size", labelFontSize)
            .style("font-weight", 800)
            .style("fill", color("pre_2007_motorbikes"))
            .text("by any emissions regulations");

          g.append("text")
            .attr("x", margin.left + 200 / 2)
            .attr("y", yScale(35000000))
            .style("font-size", labelFontSize)
            .style("font-weight", 800)
            .style("fill", color("cumsum_sales_2007"))
            .text("Motorbikes covered by the 2007 regulations");

          g.append("text")
            .attr("x", margin.left + 300 / 2)
            .attr("y", yScale(55000000))
            .style("font-size", labelFontSize)
            .style("font-weight", 800)
            .style("fill", color("cumsum_sales_2017"))
            .text("Motorbikes covered by the 2017 regulations");

          g.append("text")
            .attr("x", 550)
            .attr("y", yScale(72500000))
            .style("font-size", "2px")
            .style("font-weight", 800)
            .style("fill", color("cumsum_sales_ebikes"))
            .text("Electric motorbikes");

          g.append("text")
            .attr("x", width - margin.right - 200 / 2)
            .attr("y", yScale(5000000))
            .style("font-size", labelFontSize)
            .style("font-weight", 800)
            .attr("id", "car-ownership-text")
            .attr("opacity", 0)
            .text("Cars");

          // Return the chart with the color scale as a property (for the legend).
          // return Object.assign(svg.node(), { scales: { color } });
        },
      );
    },
  );

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      // svg
      g.transition()
        .duration(500)
        .ease(d3.easeSin)
        .attr("transform", "translate(-" + 0 + "," + 0 + ")scale(" + 1 + ")");
    },
    function step1() {
      // svg
      g.transition()
        .duration(500)
        .ease(d3.easeSin)
        .attr(
          "transform",
          "translate(-" + translatex + "," + translatey + ")scale(" + 7 + ")",
        );
    },
    function step2() {

      g.transition()
        .duration(500)
        .ease(d3.easeSin)
        .attr("transform", "translate(-" + 0 + "," + 0 + ")scale(" + 1 + ")");

    },
    function step3() {
      svg
        .select("#carsLine")
        .attr("stroke-witdh", 4)
        .transition()
        .ease(d3.easeSin)
        .duration(500)
        .attr("stroke-dashoffset", 0);

      svg
        .select("#car-ownership-text")
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
