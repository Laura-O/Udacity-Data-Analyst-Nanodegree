function bubbleChart() {
  var width = 1000,
    height = 800,
    columnForColors = "countryId",
    ncomps = "value";

  // Create the chart
  function chart(selection) {
    var data = selection.enter().data();
    var div = selection,
      svg = div.selectAll("svg");

    svg.attr("width", width).attr("height", height);

    // Set color by country
    var schemes = d3.schemeCategory20.concat(d3.schemeCategory20b);
    var colour = d3.scaleOrdinal(schemes);

    var tooltip = selection
      .append("div")
      .attr("class", "circletip")
      .text("");

    // Create new simulation with forces
    var simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(500).strength(0.10))
      .force("y", d3.forceY(400).strength(0.10))
      .force("charge", d3.forceManyBody().strength(10))
      .force("collide",
        d3.forceCollide()
        .radius(function(d) {
          return d.r + 15;
        })
        .iterations(2));

    // Set the radius of the bubbles according to ncomps
    var scaleRadius = d3.scaleLinear().domain([d3.min(data, function(d) {
      return +d[ncomps];
    }), d3.max(data, function(d) {
      return +d[ncomps];
    })]).range([10, 45])

    // Draw circles
    var node = svg.selectAll(".circles")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", function(d) {
        return scaleRadius(d[ncomps])
      })
      .attr("fill", (d, i) => colour(d[columnForColors]))
      .attr("fill-opacity", "0.8")
      // Show tooltip on mouseover
      .on("mouseover", function(d) {
        d3.select(this).attr("fill-opacity", "1"); // change opacity to 1
        tooltip.html(d[columnForColors] + "<br>" +
          d.name + "<br>" + d[ncomps] + " competitions");
        return tooltip.style("visibility", "visible");
      })
      // Move tooltip when mouse is moved over circle
      .on("mousemove", function() {
        return tooltip.style("top", (d3.event.pageY - 10) + "px")
          .style("left", (d3.event.pageX + 10) + "px");
      })
      // Remove tooltip
      .on("mouseout", function() {
        d3.select(this).attr("fill-opacity", "0.8");
        return tooltip.style("visibility", "hidden");
      })
      // Bind methods to drag events
      .call(d3.drag()
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    d3.selectAll("circle")
      .data()
      .forEach(d => d.r = Math.random() * 15);

    function dragsubject() {
      return simulation.find(d3.event.x, d3.event.y, d3.event.r);
    }

    function dragstarted() {
      if (!d3.event.active) simulation.alphaTarget(0.02).restart();
      d3.event.subject.fx = d3.event.subject.x;
      d3.event.subject.fy = d3.event.subject.y;
    }

    function dragged() {
      d3.event.subject.fx = d3.event.x;
      d3.event.subject.fy = d3.event.y;
    }

    function dragended() {
      if (!d3.event.active) simulation.alphaTarget(0);
      d3.event.subject.fx = null;
      d3.event.subject.fy = null;
    }

    // Listen for tick events to arrange nodes
    simulation.nodes(data)
      .on("tick", d => {
        node.attr("cx", d => d.x).attr("cy", d => d.y);
      });

    var legend = d3.legendColor()
      .scale(colour);

    svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(0,150)");

    svg.select(".legend")
      .call(legend);
  }

  // Getters/setters for width, height, color and number of competitions
  // Inspired by: https://bost.ocks.org/mike/chart/
  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return chart;
  };


  chart.columnForColors = function(value) {
    if (!arguments.columnForColors) {
      return columnForColors;
    }
    columnForColors = value;
    return chart;
  };

  chart.ncomps = function(value) {
    if (!arguments.ncomps) {
      return ncomps;
    }
    ncomps = value;
    return chart;
  };

  return chart;
}