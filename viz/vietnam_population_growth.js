createPopulationChangeGraphic = function () {
  var endValues = {};
  var beginValues = {};
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const svgHeight = 500;
  const svgWidth = 500;
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#population_growth")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  d3.csv("data/VietnamVehicles_1991-2022.csv", d3.autoType).then(
    function (vehicleData) {
      // Specify the chart’s dimensions.

      const x = d3
        .scaleLinear()
        .domain([0, Math.sqrt(d3.max(vehicleData, (d) => d["Population"]))])
        .range([margin.left, width - margin.right]);

      const y = d3
        .scaleLinear()
        .domain([Math.sqrt(d3.max(vehicleData, (d) => d["Population"])), 0])
        .range([height - margin.bottom, margin.top]);

      let beginning_data = vehicleData.filter((d) => d["Year"] == 1991)[0];
      let ending_data = vehicleData.filter((d) => d["Year"] == 2022)[0];

      endValues["totalPop_width"] = x(Math.sqrt(ending_data["Population"]));
      endValues["totalPop_height"] = y(Math.sqrt(ending_data["Population"]));
      endValues["urbanPop_width"] = x(
        Math.sqrt(
          (ending_data["Population"] * ending_data["Urbanization Rate"]) / 100,
        ),
      );
      endValues["urbanPop_height"] = y(
        Math.sqrt(
          (ending_data["Population"] * ending_data["Urbanization Rate"]) / 100,
        ),
      );

      endValues["totalPop_textx"] = x(
        (Math.sqrt(ending_data["Population"]) * 3) / 4,
      );
      endValues["totalPop_texty"] = y(
        (Math.sqrt(ending_data["Population"]) * 3) / 4,
      );
      endValues["urbanPop_textx"] = x(
        Math.sqrt(
          (ending_data["Population"] * ending_data["Urbanization Rate"]) / 100,
        ) / 2,
      );
      endValues["urbanPop_texty"] = y(
        Math.sqrt(
          (ending_data["Population"] * ending_data["Urbanization Rate"]) / 100,
        ) / 2,
      );
      endValues["urbanPop"] =
        (ending_data["Population"] * ending_data["Urbanization Rate"]) / 100;
      endValues["totalPop"] = ending_data["Population"];

      svg
        .append("rect")
        .attr("fill", "grey")
        .attr("opacity", 0.3)
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
        .attr("id", "overallPopulation")
        .attr("y", margin.top)
        .attr("height", y(Math.sqrt(beginning_data["Population"])))
        .attr("x", margin.left)
        .attr("width", x(Math.sqrt(beginning_data["Population"])));

      svg
        .append("rect")
        .attr("fill", "blue")
        .attr("opacity", 0.3)
        .attr("stroke", "black")
        .attr("stroke-width", 0.3)
        .attr("id", "urbanPopulation")
        .attr("y", margin.top)
        .attr(
          "height",
          y(
            Math.sqrt(
              (beginning_data["Population"] *
                beginning_data["Urbanization Rate"]) /
                100,
            ),
          ),
        )
        .attr("x", margin.left)
        .attr(
          "width",
          x(
            Math.sqrt(
              (beginning_data["Population"] *
                beginning_data["Urbanization Rate"]) /
                100,
            ),
          ),
        );

      svg
        .append("text")
        .attr("transform", "translate(" + width / 2 + "," + margin.top + ")")
        .attr("id", "population_rects_title")
        .style("font-size", "15px")
        .attr("opacity", 1)
        .text("1991");

      svg
        .append("text")
        .attr(
          "x",
          x(
            Math.sqrt(
              (beginning_data["Population"] *
                beginning_data["Urbanization Rate"]) /
                100,
            ) / 2,
          ) + 10,
        )
        .attr(
          "y",
          y(
            Math.sqrt(
              (beginning_data["Population"] *
                beginning_data["Urbanization Rate"]) /
                100,
            ) / 2,
          ),
        )
        .style("text-anchor", "middle")
        .attr("id", "urban_pop_title")
        .style("font-size", "15px")
        .attr("opacity", 1)
        .text(
          "Urban Population: " +
            d3.format(".2s")(
              (beginning_data["Population"] *
                beginning_data["Urbanization Rate"]) /
                100,
            ),
        );

      svg
        .append("text")
        .attr("x", x((Math.sqrt(beginning_data["Population"]) * 3) / 4))
        .attr("y", y((Math.sqrt(beginning_data["Population"]) * 3) / 4))
        .style("text-anchor", "middle")
        .attr("id", "pop_title")
        .style("font-size", "15px")
        .attr("opacity", 1)
        .text(
          "National Population: " +
            d3.format(".2s")(beginning_data["Population"]),
        );

      // animate in population numbers - https://www.geeksforgeeks.org/how-to-make-animated-counter-using-javascript/
    },
  );
  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {},
    function step1() {
      d3.select("#overallPopulation")
        .transition()
        .duration(500)
        .attr("width", endValues["totalPop_width"])
        .attr("height", endValues["totalPop_height"]);

      d3.select("#urbanPopulation")
        .transition()
        .duration(500)
        .attr("width", endValues["urbanPop_width"])
        .attr("height", endValues["urbanPop_height"]);

      d3.select("#urban_pop_title")
        .transition()
        .duration(500)
        .attr("x", endValues["urbanPop_textx"])
        .attr("y", endValues["urbanPop_texty"])
        .text("Urban Population: " + d3.format(".2s")(endValues["urbanPop"]));

      d3.select("#pop_title")
        .transition()
        .duration(500)
        .attr("x", endValues["totalPop_textx"] + 10)
        .attr("y", endValues["totalPop_texty"] + 50)
        .text(
          "National Population: " + d3.format(".2s")(endValues["totalPop"]),
        );

      d3.select("#population_rects_title")
        .transition()
        .duration(500)
        .text("2022");
    },
  ];

  return {
    update: update,
  };
};
