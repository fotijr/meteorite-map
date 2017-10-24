import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function (mapElementSelector) {

    var margin = { top: 0, right: 0, bottom: 0, left: 0 },
        width = 576 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        meteoriteLandings, meteorTimer;

    var color = d3.scaleThreshold()
        .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
        .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr('class', 'map');

    //geoOrthographic()
    //geoMercator()
    var projection = d3.geoEquirectangular()
        .scale(80)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    d3.queue()
        .defer(d3.json, "data/world_countries.json")
        .defer(d3.json, "https://data.nasa.gov/resource/y77d-th95.json")
        .await(ready);

    function setProjection(option) {
        var projectionType = option.currentTarget.value;

        projection = d3[projectionType]()
            .scale(80)
            .translate([width / 2, height / 2]);

        path = d3.geoPath().projection(projection);

        svg.selectAll("path").transition()
            .duration(1000)
            .attr("d", path);
    }

    function ready(error, data, landings) {
        meteoriteLandings = landings;

        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", path)
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity", 0.8)
            // tooltips
            .style("stroke", "white")
            .style('stroke-width', 0.3);

        svg.append("path")
            .datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id; }))
            .attr("class", "names")
            .attr("d", path);
    }

    function start() {
        var mapPoints = [],
            landingIndex = 0;

        function drawPoints() {
            svg.selectAll("circle")
                .data(mapPoints).enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection(d)[0];
                })
                .attr("cy", function (d) { return projection(d)[1]; })
                .attr("r", "1.7px")
                .attr("fill", "red");
        }

        meteorTimer = setInterval(function () {
            if (meteoriteLandings[landingIndex].geolocation) {
                mapPoints.push(meteoriteLandings[landingIndex].geolocation.coordinates);
                drawPoints();
            }
            landingIndex++;
            if (landingIndex >= meteoriteLandings.length) {
                clearInterval(meteorTimer);
                // all done
            }
        }, 100);
    }

    function stop(){
        clearInterval(meteorTimer);
    }

    return {
        setProjection: setProjection,
        start: start,
        stop: stop
    };
}