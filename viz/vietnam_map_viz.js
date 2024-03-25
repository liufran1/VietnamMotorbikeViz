// console.log("Map Script loaded");
// TO DO - update this to be responsive, and independent for each viz
let svgHeight = 600;
let svgWidth = 500;

createMap1Graphic = function () {
  var graphicEl = d3.select("#map1");
  var graphicVisEl = graphicEl.select(".graphic__vis");
  var graphicProseEl = graphicEl.select(".graphic__prose");

  var fillColor = "#FF6666"; // Light Orange-Red
  // "#d1ae54"
  d3.json("data/vietnam_boundary.geojson").then(function (vietnamBorders) {
    d3.json("data/vietnam_districts.geojson").then(function (vietnamDistricts) {
      initMap(vietnamDistricts, vietnamBorders, graphicVisEl);
      setupProse(graphicProseEl);
    });
  });

  function initMap(districtData, borderData, graphicVisEl) {
    const svg = graphicVisEl
      .append("svg")
      .attr("height", svgHeight)
      .attr("width", svgWidth);

    const g = svg.append("g");

    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitWidth(svgWidth, borderData);

    const mapPathGenerator = d3.geoPath(projection);

    g.selectAll("path")
      .data(borderData.features)
      .enter()
      .append("path")
      .attr("opacity", 0)
      .attr("d", mapPathGenerator)
      .attr("fill", fillColor)
      .attr("id", "introMapBorders")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    g.selectAll("path")
      .data(districtData.features)
      .enter()
      .append("path")
      .attr("opacity", 0)
      .attr("d", mapPathGenerator)
      .attr("fill", population_color)
      .attr("class", "map1_population_circles")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);
  }

  function update(step) {
    steps[step].call();
  }

  var steps = [
    function step0() {
      graphicVisEl
        .select("#introMapBorders")
        .transition()
        .duration(300)
        .attr("opacity", 0);

      graphicVisEl
        .selectAll(".map1_population_circles")
        .transition()
        .duration(300)
        .attr("opacity", 0);
    },
    function step1() {
      graphicVisEl
        .select("#introMapBorders")
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    },
    function step2() {
      graphicVisEl
        .selectAll(".map1_population_circles")
        .transition()
        .duration(1000)
        .attr("opacity", 1);
    },
    function step3() {},
  ];
  return {
    update: update, // make the update function callable as var graphic = createGraphic(".graphic"); graphic.update
  };
};
