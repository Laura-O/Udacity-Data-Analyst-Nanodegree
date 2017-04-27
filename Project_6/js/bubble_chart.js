function bubbleChart() {
    var width = 960,
        height = 960,
        columnForColors = "countryId",
        ncomps = "value";

    function chart(selection) {
        var data = selection.enter().data();
        var div = selection,
            svg = div.selectAll('svg');
        svg.attr('width', width).attr('height', height);

        var colour = d3.scaleOrdinal(d3.schemeCategory20b);

        var tooltip = selection
            .append("div")
            .attr("class","tooltip")

            .text("");

        var simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(480).strength(0.05))
            .force("y", d3.forceY(480).strength(0.05))
            .force("charge", d3.forceManyBody().strength(10))
            .force("collide",
                d3.forceCollide()
                .radius(function(d) {
                    return d.r + 20;
                })
                .iterations(2));

        var scaleRadius = d3.scaleLinear().domain([d3.min(data, function(d) {
            return +d[ncomps];
        }), d3.max(data, function(d) {
            return +d[ncomps];
        })]).range([10, 50])

        var node = svg.selectAll(".circles")
            .data(data)
            .enter()
            .append("circle")
            .attr('r', function(d) {
                return scaleRadius(d[ncomps])
            })
            .attr("fill", (d, i) => colour(d[columnForColors]))
            .on("mouseover", function(d) {
                tooltip.html(d[columnForColors] + "<br>" + d.name + "<br>" + d[ncomps] + " competitions");
                return tooltip.style("visibility", "visible");
            })
            .on("mousemove", function() {
                return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                return tooltip.style("visibility", "hidden");
            })
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

        node.transition().duration(400).attr('r', function(d) {
            return scaleRadius(d[ncomps])
        })

        //    simulation.alpha(0.8).restart();

        simulation.nodes(data)
            .on("tick", d => {
                node.attr("cx", d => d.x).attr("cy", d => d.y);
            });
    }
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