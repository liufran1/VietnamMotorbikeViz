// Detect which section is active, and update the nav bar accordingly
window.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");

      if (entry.intersectionRatio > 0) {
        document
          .querySelector(`nav li a[href="#${id}"]`)
          .parentElement.classList.add("active");
      } else {
        document
          .querySelector(`nav li a[href="#${id}"]`)
          .parentElement.classList.remove("active");
      }
    });
  });

  // Track all sections that have an `id` applied
  document.querySelectorAll("section[id]").forEach((section) => {
    observer.observe(section);
  });
});

// Waypoints scrollytelling
// https://pudding.cool/process/how-to-implement-scrollytelling/demo/waypoints/

// helper function so we can map over dom selection
function selectionToArray(selection) {
  var len = selection.length;
  var result = [];
  for (var i = 0; i < len; i++) {
    result.push(selection[i]);
  }
  return result;
}

function waypoints(graphicEl, graphic) {
  // select elements

  // console.log(graphicEl);
  var graphicVisEl = graphicEl.querySelector(".graphic__vis");
  var triggerEls = selectionToArray(graphicEl.querySelectorAll(".trigger"));

  // viewport height
  var viewportHeight = window.innerHeight;
  var halfViewportHeight = Math.floor(viewportHeight / 2);

  // handle the fixed/static position of grahpic
  var toggle = function (fixed, bottom) {
    if (fixed) graphicVisEl.classList.add("is-fixed");
    else graphicVisEl.classList.remove("is-fixed");

    if (bottom) graphicVisEl.classList.add("is-bottom");
    else graphicVisEl.classList.remove("is-bottom");
  };

  // setup a waypoint trigger for each trigger element
  var waypoints = triggerEls.map(function (el) {
    // get the step, cast as number
    var step = +el.getAttribute("data-step");

    return new Waypoint({
      element: el, // our trigger element
      handler: function (direction) {
        // if the direction is down then we use that number,
        // else, we want to trigger the previous one
        var nextStep = direction === "down" ? step : Math.max(0, step - 1);

        // tell our graphic to update with a specific step
        graphic.update(nextStep);
      },
      offset: "50%", // trigger halfway up the viewport
    });
  });

  // enter (top) / exit (bottom) graphic (toggle fixed position)
  var enterWaypoint = new Waypoint({
    element: graphicEl,
    handler: function (direction) {
      var fixed = direction === "down";
      var bottom = false;
      toggle(fixed, bottom);
    },
  });

  var exitWaypoint = new Waypoint({
    element: graphicEl,
    handler: function (direction) {
      var fixed = direction === "up";
      var bottom = !fixed;
      toggle(fixed, bottom);
    },
    offset: "bottom-in-view", // waypoints convenience instead of a calculation
  });
}

var graphicEl = document.querySelectorAll(".graphic");
var graphicsArray = [
  createMap1Graphic,
  createMacroLinesGraphic,
  createMotorbikeBarsGraphic,
  createCarbonCompareBars,
  createPollutantPie,
  createPollutionLines,
  createDeathBarGraphic,
  createPopulationChangeGraphic,
  createSalesGraphic,
  createPollutionMapGraphic,
];
// Surely there's a better way to organize the section - function mapping

for (let i = 0; i < graphicEl.length; i++) {
  waypoints(graphicEl[i], graphicsArray[i].call());
}

// TO DO: this will have to be updated for the adaptive sizing
function setupProse(graphicProseEl) {
  var height = window.innerHeight * 0.5;
  graphicProseEl.selectAll(".trigger").style("height", height + "px");
}
