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

    addDropShadow(svg, radius) {
        svg
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(radius/1.4)
                .outerRadius(radius)
                .startAngle(0)
                .endAngle(Math.PI * 2))
            .attr("filter", "url(#dropshadow)")
            .attr("opacity", .5);
    }

    buildDonutSlices(svg, data_ready, arcObj, color) {

        svg
            .selectAll('.arc')
            .data(data_ready)
            .enter()
            .append('path')
            .attr('d', arcObj)
            .attr('fill', (d) => color(d.data.key));
    }

    addSliceText(svg, data_ready, arcObj) {
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
    }

    addDiffText(svg, diff_data_ready, color) {
        const diffSize = 30;
        const centerText = svg
            .append("g");

        centerText
            .selectAll("text")
            .data(diff_data_ready)
            .join("text")
            .attr("transform", (d, idx) => `translate(0,${(idx* diffSize)})`)
            .call(text => text.append("tspan")
                .text(d => (d.data.value > 0) ? "▲" : "▼"))
                .style('fill', d => color(d.data.key));

        centerText
            .attr("font-family", "sans-serif")
            .attr("font-size", diffSize)
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .selectAll("text")
            .data(diff_data_ready)
            .join("text")
            .attr("transform", (d, idx) => `translate(0,${(idx* diffSize)})`)
            .call(text => text.append("tspan")
                .text(d => d.data.value + "%"));

        centerText
            .attr("transform", `translate(0, ${-((diff_data_ready.length - 1)  * diffSize) /    2})`)
    }

    floatToPercent(floatInput) {
        return Math.round(100 * floatInput)
    }

    getPercentage(weekData) {
        // We could iterate over the keys here, but I think it makes more sense to assume we only care about these
        // keys, other data is likely not relevant
        const sum = weekData.new + weekData.screened + weekData.interviewed + weekData.assignment;
        return {
            "new": this.floatToPercent(weekData.new / sum),
            "screened": this.floatToPercent(weekData.screened / sum),
            "interviewed": this.floatToPercent(weekData.interviewed / sum),
            "assignment": this.floatToPercent(weekData.assignment / sum)
        };
    }

    getDiff(thisWeek, lastWeek) {
        const diffs = {
            "new": this.floatToPercent((thisWeek.new - lastWeek.new)/lastWeek.new),
            "screened": this.floatToPercent((thisWeek.screened - lastWeek.screened)/lastWeek.screened),
            "interviewed": this.floatToPercent((thisWeek.interviewed - lastWeek.interviewed)/lastWeek.interviewed),
            "assignment": this.floatToPercent((thisWeek.assignment - lastWeek.assignment)/lastWeek.assignment)
        };

        // TODO: Check this doesn't die
        Object.keys(diffs).forEach(function(elem, idx) {
            if (diffs[elem] === 0) {
                delete diffs[elem];
            }
        });

        return diffs;
    }

    createDonutChart() {
        const node = this.node;
        // Dimensional constants
        const width = 700;
        const height = 450;
        const margin = 40;

        // Create dummy data
        // const data = {a: 9, b: 20, c:30, d:8, e:12};
        const data = [
            {"new":400, "screened": 150, "interviewed": 25, "assignment": 100},
            {"new":450, "screened": 100, "interviewed": 30, "assignment": 100},
        ];

        const latestWeek = data.length - 1;

        // Half the smaller of the width/height, minus some margin
        const radius = Math.min(width, height) / 2 - margin;

        // append the svg object to the div we've referenced as node
        const svg = d3.select(node)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        // set the color scale
        const color = d3.scaleOrdinal()
            .domain([0,100])
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"]);

        // Object which defines our base arc structure
        const arcObj = d3.arc()
            .innerRadius(radius/1.4)
            .outerRadius(radius);

        // Compute the position of each group on the pie:
        const pie = d3.pie()
            .value(function(d) {return d.value; });
        const data_ready = pie(d3.entries(this.getPercentage(data[latestWeek]))); // Percentages for latest week
        const diff_data_ready = pie(d3.entries(this.getDiff(data[latestWeek], data[latestWeek-1]))); // Diffs

        // Initialize the filter for the drop shadow
        this.createFilter(svg);

        // Create the drop shadow
        this.addDropShadow(svg, radius);

        // Build the donut base
        this.buildDonutSlices(svg, data_ready, arcObj, color);

        // Add percentages to the donut
        this.addSliceText(svg, data_ready, arcObj);

        // Add the diffs
        this.addDiffText(svg, diff_data_ready, color);

        // Add one dot in the legend for each name.
        const size = 20;
        const xOffset = 200;
        const yOffset = -180;
        svg.selectAll("legend_dots")
            .data(data_ready)
            .enter()
            .append("rect")
            .attr("x", xOffset)
            .attr("y", function(d,i){ return yOffset + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return color(d.data.key)})

        // Add one dot in the legend for each name.
        svg.selectAll("DataLabels")
            .data(data_ready)
            .enter()
            .append("text")
            .attr("x", xOffset + size*1.2)
            .attr("y", function(d,i){ return yOffset + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", "black")
            .text(function(d){ return d.data.key})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
    render() {
        return <div ref={node => this.node = node}>
        </div>
    }
}
export default CandidatesChart