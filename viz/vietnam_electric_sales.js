d3.csv("data/Vietnam Motorbike Sales.csv", d3.autoType).then(
  function (vehicleSalesData) {
    // Specify the chart’s dimensions.
    const width = 500;
    const height = 500;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 40;

    const yScale = d3
      .scaleLinear()
      .domain([
        vehicleSalesData.filter((d) => d["Year"] == 2020)[0]["Sales"],
        0,
      ])
      .range([height - marginBottom, marginTop]);

    const svg = d3
      .select("#electrification_bar")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let g = svg.append("g");

    g.append("rect")
      .attr("fill", "grey")
      .attr("opacity", 0.3)
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .attr("y", yScale(0))
      .attr(
        "height",
        yScale(vehicleSalesData.filter((d) => d["Year"] == 2020)[0]["Sales"]),
      )
      .attr("x", width / 2)
      .attr("width", width / 2);

    g.append("rect")
      .attr("fill", "black")
      .attr("stroke", "black")
      .attr("stroke-width", 0.3)
      .attr("y", yScale(0))
      .attr(
        "height",
        yScale(
          vehicleSalesData.filter((d) => d["Year"] == 2020)[0]["Electric"],
        ),
      )
      .attr("x", width / 2)
      .attr("width", width / 2)
      .attr("opacity", 0)
      .transition()
      .ease(d3.easeSin)
      .duration(6000)
      .attr("opacity", 1);
  },
);
