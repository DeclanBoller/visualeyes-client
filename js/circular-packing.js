let population_width = $('#ds1').innerWidth();
let population_height = $('#ds1').innerHeight();

let population_margin = {
  left: 150,
  right: 150,
  top: 200,
  bottom: 150
}

const population_svg = d3.select('#ds1')
  .append("svg")
  .attr('class', 'svg-graph1')
  .attr('width', population_width)
  .attr('height', population_height)

population_svg.append("html")
          .attr("x", (population_width / 2))
          .attr("y", 0 - (population_margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style('color', 'black')
          .style('padding', '25px')
          .style("text-decoration", "underline")
          .text("World Population 2017");

d3.csv("https://visualeyes-server.herokuapp.com/statistics.csv").then(function(data) {
  data.forEach(function(d) {
    d.population = +d.population
  })

  // nesting to allow usage of year as key

  let years = d3.nest()
    .key(function(d) {
      if (d.year === '2017') {
        return d.year;
      }
    })
    .entries(data);

  console.log(years);
  console.log(years[1]);
  console.log(years[1].values[0].country_name);
  console.log(years[1].values[0].population);

  const year2017 = years[1].values;

  console.log(year2017);


  // color-coding countries
  var color = d3.scaleOrdinal()
    .domain(year2017.map(function(d) {
      return d.country_name;
    }))
    // .range(['#ffba49', '#20a39e', '#ef5b5b', '#912f56', '#FFFFE0', '#ff8552', '#f76f8e', '#14cc60', '#4682B4', '#b33951', '#40434e', '#d1f5ff', '#7d53de', '#00FA9A', 'deepskyblue']);

    .range(['#447c69', '#8e8c6d','#e4bf80','#e9d78e',    '#f19670','#e16552','#be5168','#a34974','#993767','#4e2472','#9163b6','#e279a3','#7c9fb0','#5698c4','#9abf88'])
  // scale for countries
  let size = d3.scaleLog()
    .domain([4793900, 1400000000])
    .range([15, 120])
    .base(2)

// Tooltips

  const tooltip = d3.select('#ds1')
    .append('div')
    .data(year2017)
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
console.log(year2017);

// http://bl.ocks.org/biovisualize/1016860

// mouseover tooltips
const tooltip_mouseover = function(e, year2017) {
  tooltip.style('visibility', 'visible')
    .text(function() {
      return `${ e.country_name }: ${e.population}`
    })
}

const tooltip_mouseout = function(year2017) {
  tooltip.style('visibility', 'hidden')
}

const tooltip_mousemove = function(year2017) {
  tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
}


// checking data
console.log('////////');
console.log(years[1].values[0]['Country']);
console.log(years[1].values[0]['Year']);
console.log(years[1].values[0].population);
console.log('//////////');

console.log(((year2017[0].population) / 10000000) * 2);


// initializing the circle

  const node = population_svg.append('g')
    .selectAll('circle')
    .data(year2017)
    .enter()
    .append('circle')
    .attr('class', 'node')
    .attr("r", function(year2017){ return size(year2017.population)})
    .attr('cx', population_width / 2)
    .attr('cy', population_height / 2)
    .style('fill', function(d){ return color(d.country_name)}) //come back to for colours
    .style('fill-opacity', 0.8)
    .attr('stroke', 'black')
    .style("stroke-width", 1)
    .on("mouseover", tooltip_mouseover) // when hovering
    .on('mousemove', tooltip_mousemove)
    .on('mouseout', tooltip_mouseout)
    .call(d3.drag() // when circle is dragged
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  // features of the force

  const simulation = d3.forceSimulation()
    // .force("x", d3.forceX().strength(0.5).x(width/2))
    // .force("y", d3.forceY().strength(0.1).y( height/2 ))
    .force('center', d3.forceCenter().x(population_width / 2).y(population_height / 2)) //attracts to centre of svg
    .force('charge', d3.forceManyBody().strength(.1)) //Nodes are attracted to each other
    .force("collide", d3.forceCollide().strength(.2).radius(function(year2017){ return size((year2017.population)+3) }).iterations(1)) //force avoids circle collision

  simulation
    .nodes(year2017)
    .on('tick', function(year2017) {
      node
        .attr('cx', function(year2017) {
          return year2017.x;
        })
        .attr('cy', function(year2017) {
          return year2017.y;
        })
    })

  function dragstarted(year2017) {
    if (!d3.event.active) simulation.alphaTarget(.03).restart();
    year2017.fx = year2017.x;
    year2017.fy = year2017.y;
  }

  function dragged(year2017) {
    year2017.fx = d3.event.x;
    year2017.fy = d3.event.y;
  }

  function dragended(year2017) {
    if (!d3.event.active) simulation.alphaTarget(.03);
    year2017.fx = null;
    year2017.fy = null;
  }

});
