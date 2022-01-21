// Useful constants
const european_countries = ['Albania', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom'];
const country_chosen = 'France';
const data_filename = "data/new_cases_per_million.csv"


// Set the dimensions and margins of the graph
const svg_size = {width:800, height:600};
const margin = {top: 120, right: 50, bottom: 20, left: 40},
width = svg_size.width - margin.left - margin.right,
height = svg_size.height - margin.top - margin.bottom;


// create the grap area
const graph = d3.select("#graph_area");

// Title
var title = graph.append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 4)
  .attr("text-anchor", "middle")
  .style("font-size", "20px") 
  .style("font-weight", "bold")
  .style("font-family", "sans-serif")
  .text("CHANGE THIS TITLE");



// compute default domains
xDomain = null;
yDomain = null;

// construct scales and axes
const xScale = d3.scaleTime()
  .domain([new Date('2020-01-22'), new Date('2022-01-13')])
  .range([ 0, svg_size.width]);

const yScale = d3.scaleLinear()
  .domain([-100, 100])
  .range([svg_size.height, 0]);

const Xaxis = d3.axisBottom(xScale);
const Yaxis = d3.axisLeft(yScale);

// construct SVG
const svg = graph.append("svg")
  .attr("width", svg_size.width+margin.left)
  .attr("height", svg_size.height+margin.top)
  .on("pointerenter pointermove", pointermoved)
  .on("pointerleave", pointerleft);


const axis_bottom = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${svg_size.height})`)
  .attr("class", "xaxis")
  .call(Xaxis);


svg.append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .attr("class", "yaxis")
  .call(Yaxis);

const tooltip = svg.append("g")
  .style("pointer-events", "none");


var listX;
var listY;
var key, color;
var tab = [];

function maj(){

  listX = [];
  listY = [];
  var allDataDict = [];
  data_filtered = [];

  d3.csv(data_filename).then(function(data) {

    data_filtered = data.map(function(d){
      value = 0;
      if(d[country_chosen] != ""){
      	value = parseFloat(d[country_chosen]);
      }else{
      	value = 0;
      }
      return [d["date"], value];
    });  // values only from the country of interest


  data_filtered.forEach(
    function(curr){
      allDataDict.push(curr);
      listX.push(curr[0]);
      listY.push(curr[1]);
      tab.push(curr[1]);
    }
  );

  
  console.log("min, max =", Math.min(...tab), Math.max(...tab));

  datay = [Math.min(...listY),Math.max(...listY)];
  console.log(datay);

  updateAxis([], datay);
  updateGraph(allDataDict);

  });

}

function updateAxis(dataX, dataY){

  yScale.domain(dataY);
  svg.selectAll("g.yaxis")
    .call(d3.axisLeft(yScale));
}

function updateGraph(data){

  var selection = svg.selectAll("new_path")
  .data([data])
  .join(
    function(enter){
      return enter.append("path");
    }
    ,
    function(update){
      return update;
    },
    function(exit){
      return exit.remove();
    }

  )
  .attr("fill", "none")
  .attr("stroke", "blue")
  .attr("d", d3.line()
    .curve(d3.curveLinear)
    .x(function(d) { return xScale(new Date(d[0])) })
    .y(function(d) { return yScale(d[1]) })
  )
  .attr("transform", `translate(${margin.left}, 0)`)
  .lower();

}


function pointermoved(event){
  var coords = d3.pointer(event);
  var xCor = coords[0];
  var yCor = coords[1];

  var xVal = xCor - margin.left;
  var value = listY[parseInt((xCor-margin.left) * listY.length/svg_size.width)];
  var yVal = yScale(value) - 20;

  tooltip.style("display", null);

  const path = tooltip.selectAll("path")
    .data([,])
    .join("path")
      .attr("fill", "white")
      .attr("stroke", "black");

  if(yVal === yVal){ // if yVal is not NaN

    const text = tooltip.selectAll("text")
      .data([,])
      .join("text")
        .attr("y", yVal)
        .text(`${value}`);

    const {x, y, width: w, height: h} = text.node().getBBox();

    text.attr("x", xCor - w / 2)

    path.attr("d", createPath(xCor, yVal, w));
  }
  
}

function createPath(x, y, w){
  var path = d3.path();
  path.moveTo(x - w / 2 - 10, y - 20);
  path.lineTo(x + w / 2 + 10, y - 20);
  path.lineTo(x + w / 2 + 10, y + 10);
  path.lineTo(x + 3, y + 10);
  path.lineTo(x, y + 15);
  path.lineTo(x - 3, y + 10);
  path.lineTo(x - w / 2 - 10, y + 10);
  path.closePath();

  return path.toString();
}

function pointerleft(){
  console.log("LEFT !");
  tooltip.style("display", "none");
}

maj();