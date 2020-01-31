import React, { Component } from 'react'
import './App.css'
import * as d3 from "d3";

class CandidatesChart extends Component {
    constructor(props){
        super(props);
        this.createDonutChart = this.createDonutChart.bind(this)
    }
    componentDidMount() {
        this.createDonutChart()
    }
    componentDidUpdate() {
        this.createDonutChart()
    }

    createFilter(svg) {
        /* For the drop shadow filter... */
        const defs = svg.append("defs");

        const filter = defs.append("filter")
            .attr("id", "dropshadow");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 10)
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 3)
            .attr("dy", 3)
            .attr("result", "offsetBlur");

        const feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur");
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }

    createDonutChart() {
        const node = this.node;
        // set the dimensions and margins of the graph
        const width = 450;
        const height = 450;
        const margin = 40;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        const radius = Math.min(width, height) / 2 - margin;

        // append the svg object to the div we've referenced as node
        const svg = d3.select(node)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // Create dummy data
        const data = {a: 9, b: 20, c:30, d:8, e:12};

        // set the color scale
        const color = d3.scaleOrdinal()
            .domain(data)
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .value(function(d) {return d.value; });
        const data_ready = pie(d3.entries(data));

        const arcObj = d3.arc()
            .innerRadius(100)
            .outerRadius(radius);


        svg
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(100)
                .outerRadius(radius)
                .startAngle(0)
                .endAngle(Math.PI * 2))
            .attr("filter", "url(#dropshadow)")
            .attr("opacity", .5);

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
            .selectAll('.arc')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arcObj)
            .attr('fill', function(d){ return(color(d.data.key)) });

        // Add the percentages
        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 20)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data(data_ready)
            .join("text")
            .attr("transform", d => `translate(${arcObj.centroid(d)})`)
            .call(text => text.append("tspan")
                .text(d => d.data.value + "%")
                .style('fill', 'white'));

        this.createFilter(svg)
    }
    render() {
        return <div ref={node => this.node = node}>
        </div>
    }
}
export default CandidatesChart