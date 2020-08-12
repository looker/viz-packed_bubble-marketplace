import React, { Component } from 'react';
import * as d3 from 'd3'
import styled from 'styled-components';
import styles from './bubble_chart_styles.css'

const BubbleChartWrapper = styled.div`
  font-family: 'Open Sans', 'Noto Sans JP', 'Noto Sans', 'Noto Sans CJK KR', Helvetica, Arial, sans-serif;
  text-align: center;
  overflow: hidden;
`;

class BubbleChart extends Component {
  componentDidMount() {
    this.drawChartWithParams();
    window.addEventListener('resize', this.drawChartWithParams);
  }

  componentDidUpdate() {
    this.drawChartWithParams();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.drawChartWithParams);
  }

  drawChartWithParams = () => {
    this.drawChart('#chart');
  }

  getWindowSize() {
    return Math.min(window.innerWidth, window.innerHeight);
  }

  getFontSize() {
    const windowSize = this.getWindowSize();
    const fontSize = Math.round(windowSize * 0.017);
    return fontSize > 13 ? 13 : fontSize;
  }

  drawChart(id) {

    function getDivWidth(div) {
      var width = d3.select(div)
        // get the width of div element
        .style('width')
        // take of 'px'
        .slice(0, -2)
      // return as an integer
      return Math.round(Number(width))
    }

    const { config, data } = this.props;

    // Catches edge case for unregistered config/options on dashboard-next
    if(config.toColor === undefined){
      config.font_size_value = 8;
      config.font_size_label = 10;
      config.toColor = ["#7FCDAE", "#ffed6f", "#EE7772"];
    }

    const windowSize = this.getWindowSize();
    const fontSize = this.getFontSize();

    var diameter = windowSize*.97,
        format = d3.format(",d"),
        color = d3.scaleOrdinal().range(config.value_colors || []);

    var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(.5);

    d3.select(id).select("svg").remove();

    var svg = d3.select(id).append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

    const d = {
      children: data
    }

    var maxColor = this.props.maxColor;

    var root = d3.hierarchy(d)
      .sum(function(d) { return d.value; })
      .sort(function(a, b) { return b.value - a.value; });

    bubble(root);

    this.tooltip = d3.select(id).append("div")
     .attr("id", "tooltip")
     .style("opacity", 1);

    var node = svg.selectAll("g")
      .data(root.children)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


    node.append("circle")
      .attr("class", "circle_node")
      .attr("r", function(d) { return d.r; })
      .style("z-index", 1)
      .style("opacity", function(d) {
        if (config.color_by_type == "fill") {
          return 1;
        } else if (config.color_by_type == "cat") {
          return 1;
        } else {
          return ((d.data.color / maxColor > .15) ? d.data.color / maxColor : .15)
        }
      })
      .style("fill", function(d) {
        if (config.color_by_type == "fill") {
          return config.toColor[0];
        } else if (config.color_by_type == "cat") {
          var index_color = Math.round((d.data.color / maxColor)*config.toColor.length) - 1;
          return config.toColor[index_color < 0 ? 0 : index_color];
        } else {
          return config.toColor[0];
        }
      })
      .on("mousemove", function(d) {
        d3.select(this)
          .style("stroke-width", 10)    // set the stroke width
          .style("stroke", function(d) {
            if (config.color_by_type == "fill") {
              return config.toColor[0];
            } else if (config.color_by_type == "cat") {
              var index_color = Math.round((d.data.color / maxColor)*config.toColor.length) - 1;
              return config.toColor[index_color < 0 ? 0 : index_color];
            } else {
              return config.toColor[0];
            }
          })
          .style("z-index", 10)
          .style("stroke-opacity", function(d) { return ((d.data.color / maxColor > .5) ? d.data.color / 2 / maxColor : d.data.color * 2 / maxColor) });
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .style("z-index", 1)
          .style("stroke-width", 0)
          .style("opacity", function(d) {
            if (config.color_by_type == "fill") {
              return 1;
            } else if (config.color_by_type == "cat") {
              return 1;
            } else {
              return ((d.data.color / maxColor > .15) ? d.data.color / maxColor : .15)
            }
          });
      });

    if (config['value_titles'] !== false) {
      node.append("text")
        .attr("class", "label")
        .attr("dy", config['value_labels'] === false ? ".3em" : ".1em")
        .style("text-anchor", "middle")
        .style("font-size", config['font_size_value'])
        .text(function(d) { return d.data.itemName.substring(0, d.r / 3); });
    }

    if (config['value_labels'] !== false) {
      node.append("text")
        .attr("class", "label")
        .attr("dy", config['value_titles'] === false ? ".3em" : "1.5em")
        .style("font-size", config['font_size_label'])
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.rendered });
    }

    node.on("mousemove", function(d) {
          d3.select('#chart').append('div')
            .attr('id', 'tooltip');

          let tooltip_html = ''
          tooltip_html += '<div><span>' + d.data.itemName + '<br/></span>';
          tooltip_html += '<span>   ' + d.data.rendered + '</span></div>';

          d3.select('#tooltip').html(tooltip_html);

          d3.select('#tooltip')
          .style("left", event.pageX-(Math.round(Number(d3.select('#tooltip').style('width').slice(0, -2)))/2)+"px")
          .style("top", event.pageY-60+"px")
          .style('opacity', 1)
          .style("position", "absolute")
          .style("font-family", "Open Sans")
          .style("font-size", ".8rem")
          .style("text-align", "center")
          .style("padding", ".5rem")
          .style('pointer-events', 'none')
          .style("color", "white")
          .style("background-color", "#313639")
          .style("background-opacity", ".85")
          .style("border-radius", "#8px");
        d3.select('#tooltip')
          .append('div')
            .style('border-right', 'solid 4px transparent')
            .style('border-left', 'solid 4px transparent')
            .style('border-top', 'solid 4px #313639')
            .style('transform', 'translateX(-50%)')
          .style('content', '')
          .style('top', '100%')
          .style('left', "50%")
          .style('height', 5)
          .style('width', 5)
          .style('position', 'absolute');
     })
      .on("mouseout", function(d) {
        d3.select('#tooltip').transition()
          .duration('50')
          .style("opacity", 0);
      });
    

    d3.select(self.frameElement).style("height", diameter + "px");
  }

  render() {
    const fontSize = this.getFontSize();
  
    return (
      <BubbleChartWrapper id='chart'
        style={{ fontSize }}
      />
    );
  }
}

BubbleChart.defaultProps = {
  config: {},
  data: []
}

export default BubbleChart;
