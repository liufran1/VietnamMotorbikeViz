createPollutantPie = function () {
  const width = 500;
  const height = Math.min(width, 500);
  const radius = Math.min(width, height) / 2;

  var pollutantArray = [];
  function createButtons() {
    pollutantArray.forEach((pollutant) => {
      document.getElementById("pollutant_select").innerHTML +=
        `<button value="${pollutant}">${pollutant}</button>`;
    });
  }

  var arc = d3
    .arc()
    .innerRadius(radius * 0.67)
    .outerRadius(radius - 1);

  var svg = d3
    .select("#vehicle_pie")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  buttonsArray = document
    .querySelector("#pollutant_select")
    .querySelectorAll("button");
  buttonsArray.forEach(function (button) {
    button.addEventListener("click", (e) => {
      d3.csv("./data/hcmc_vehicle_air_pollutants.csv", d3.autoType).then(
        function (pollutionBreakdown) {
          plotPie(pollutionBreakdown, button.value);
          // change(pollutionBreakdown.filter((d) => d["Pollutant"] == "PM2.5"));
        },
      );
    });
  });

  var g = svg.append("g");
  // .attr("style", "max-width: 100%; height: auto;");

  let plotPie = function (pollutionBreakdown, pollutant) {
    const pie = d3
      .pie()
      // .padAngle(1 / radius)
      .sort(null)
      .value((d) => d["Pollutant_percent"]);

    const color = d3
      .scaleOrdinal()
      .domain(pollutionBreakdown.map((d) => d["Vehicle_Type"]))
      .range(d3.schemeAccent);
    // TO DO: update colors

    // Pie component
    let pieGroup = svg
      .append("g")
      .selectAll("path")
      .data(pie(pollutionBreakdown.filter((d) => d["Pollutant"] == pollutant)));

    pieGroup
      .join("path")
      .attr("fill", (d) => color(d.data["Vehicle_Type"]))
      .attr("d", arc);

    // .append("title")
    // .text(
    //   (d) =>
    //     `${d.data["Vehicle_Type"]}: ${d.data[
    //       "Pollutant_percent"
    //     ].toLocaleString()}`,
    // );

    // text component
    let textGroup = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "middle")
      .selectAll()
      .data(pie(pollutionBreakdown.filter((d) => d["Pollutant"] == pollutant)));

    textGroup.exit().transition().duration(1000).remove();

    textGroup
      // .enter()
      // .append("text")
      // .merge(textGroup)
      // .transition()
      .join("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .call((text) =>
        text
          .append("tspan")
          .attr("y", "-0.4em")
          .attr("font-weight", "bold")
          .text((d) => d.data.name),
      )
      .call(
        (text) =>
          text
            .filter((d) => d.endAngle - d.startAngle > 0.25)
            .append("tspan")
            .attr("x", 0)
            .attr("y", "0.7em")
            .attr("fill-opacity", 0.7)
            .text(
              (d) =>
                `${d.data["Vehicle_Type"]}: ${d3
                  .format(".0%")(d.data["Pollutant_percent"])
                  .toLocaleString()}`,
            ),
        // .text(d => d.data['Pollutant_percent'].toLocaleString("en-US"))
      );
    d3.selectAll("#pollutantpie_title").remove();

    svg
      .append("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .append("text")
      .attr("id", "pollutantpie_title")
      .style("font-size", "15px")
      .attr("opacity", 1)
      .text(pollutant);
  };

  // TO DO: Fix animation
  let initPie = function (pollutionBreakdown, pollutant) {
    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d["Pollutant_percent"]);

    const color = d3
      .scaleOrdinal()
      .domain(pollutionBreakdown.map((d) => d["Vehicle_Type"]))
      .range(d3.schemeAccent);
    // TO DO: update colors

    var path = g
      .selectAll("path")
      .data(pie(pollutionBreakdown.filter((d) => d["Pollutant"] == pollutant)))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data["Vehicle_Type"]))
      .attr("transform", "translate(0, 0)");
  };
  // https://medium.com/@kj_schmidt/making-an-animated-donut-chart-with-d3-js-17751fde4679
  function change(data) {
    let pie = d3
      .pie()
      .value((d) => d["Pollutant_percent"])
      .sort(null)(data);

    var arc = d3
      .arc()
      .innerRadius(radius * 0.67)
      .outerRadius(radius - 1);

    let path = d3.select("#vehicle_pie").selectAll("path").data(pie); // Compute the new angles

    path.transition().duration(500).attr("d", arc); // redrawing the path with a smooth transition
  }

  d3.csv("./data/hcmc_vehicle_air_pollutants.csv", d3.autoType).then(
    function (pollutionBreakdown) {
      pollutantArray = [
        ...new Set(pollutionBreakdown.map((d) => d["Pollutant"])),
      ];
      // createButtons();

      plotPie(pollutionBreakdown, "CH4");
      // initPie(pollutionBreakdown, "CO");
    },
  );
  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      d3.csv("./data/hcmc_vehicle_air_pollutants.csv", d3.autoType).then(
        function (pollutionBreakdown) {
          plotPie(pollutionBreakdown, "CH4");
          // initPie(pollutionBreakdown, "CO");
        },
      );
    },
    function step1() {
      d3.csv("./data/hcmc_vehicle_air_pollutants.csv", d3.autoType).then(
        function (pollutionBreakdown) {
          plotPie(pollutionBreakdown, "PM2.5");
          // change(pollutionBreakdown.filter((d) => d["Pollutant"] == "PM2.5"));
        },
      );
    },
    function step2() {
      // console.log(document.getElementById("pollutant_select"));
    },
    function step3() {
      // console.log(document.getElementById("pollutant_select"));
    },
  ];
  return {
    update: update, // make the update function callable as var graphic = createGraphic(".graphic"); graphic.update
  };
};
