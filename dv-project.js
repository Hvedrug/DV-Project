// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60};
const width = 800;
const height = 400;
const widthReduced = width - margin.left - margin.right;
const heightReduced = height - margin.top - margin.bottom;
const countriesEurope = ['Albania', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerlandh', 'Ukraine', 'United Kingdom']
var parameter = {country: 1, policy: 1, factor: 1};
var DebugData;
var DictData={};

// append the svg object to the body of the page
const svg = d3.select("#third-graph")
.append("svg")
.attr("viewBox", `0 0 `+width +` `+height)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);


// load the first set of data when load page
window.onload = function() {
  initSelect(countriesEurope, "selectCountry");
  //d3.csv('data/new_cases_per_million.csv').then(function (data) { console.log(data.columns); console.log(parseFloat(data[450]["France"])); });
  initPage('data/new_cases_per_million.csv');
};


function initPage(src){
  for (i=0; i<countriesEurope.length; i++){
    DictData[countriesEurope[i]] = [];
  }
  DictData["date"] = [];
  getData(src).then(
    function(data) {
    // Add X axis 
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`); 
    // Add Y axis
    svg.append("g")
    .attr("class", "y axis");
    // Add the line
    svg.append("path")
    .attr("class", "dataLine");
    svg.append("circle")
    .attr("class", "dot");
  });
  updateSelect();
  updateGraph(DictData);
}

// function that get the data and parse it
function getData(src){
  return d3.csv(src,
    // When reading the csv, I must format variables:
    function(d){
      var temp;
      for (var j = 0; j < countriesEurope.length; j++){
        temp = parseFloat(d[countriesEurope[j]]);
        DictData[countriesEurope[j]].push(temp);
        temp=0;
      }
      temp = new Date(d["date"]);
      DictData['date'].push(temp);
    }
  );  
}

// initialize the select elements with a list of names/texts and the id of the select element
function initSelect(data, selectId){
  var str = "";
  var i = 1;
  for (var item of data) {
    str += "<option value=\"" + i + "\">" + item + "</option>";
    i+=1;
  }
  document.getElementById(selectId).innerHTML = str;
}

// change values of the parameters when select value changes
function selectOnChange(selectID){
  if (selectID=="selectCountry"){
    parameter['country'] = document.getElementById(selectID).value;
  }if (selectID=="selectPolicy"){
    parameter['policy'] = document.getElementById(selectID).value;
  }if (selectID=="selectFactor"){
    parameter['factor'] = document.getElementById(selectID).value;
  }console.log(parameter['country'] +' '+ parameter['policy'] +' '+ parameter['factor'])
  updateSelect();
  updateGraph(DictData);
}




function updateSelect() {
  //clear svg
  d3.select("path").remove();
  d3.select("dot").remove();

  // maj X axis 
  var x = d3.scaleTime()
  .domain(d3.extent(DictData['date']))
  .range([ 0, widthReduced ]);
  svg.selectAll("g.x.axis")
  .attr("transform", `translate(0, ${heightReduced})`)
  .call(d3.axisBottom(x));

  // maj Y axis
  var y = d3.scaleLinear()
  .domain([0,d3.max( DictData[countriesEurope[parameter['country']]] )])
  .range([ heightReduced, 0 ]);
  svg.selectAll("g.y.axis")
  .call(d3.axisLeft(y));
}

function updateGraph(data){
  console.log("ma grosse bite");
  console.log(data);
  var selection = svg.selectAll("new_path")
  .data([data])
  .attr('bite', function(d){console.log(d)})
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
    .x(function(d) { return xScale(new Date(d['date'])) })
    .y(function(d) { return yScale(d['France']) })
  )
  .attr("transform", `translate(${margin.left}, 0)`)
  .lower();
}












































/**

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
width1 = 800 - margin.left - margin.right,
width2 = 800,
height1 = 400 - margin.top - margin.bottom;
height2 = 400;

// create tooltip and circle for tooltip
var ttip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("position", 'absolute')
.style("text-align", 'center')
.style("width", '110px')
.style("height", '40px')
.style("padding", '2px')
.style("border-radius", '8px')
.style("font", '12px sans-serif')
.style("background", 'lightsteelblue')
.style("border", '0px')
.style("pointer-events", 'none')
.style("opacity", 0);
var crcl = d3.select("body").append("div")
.attr("class", "circle")
.style("opacity", 0);

// append the svg object to the body of the page
const svg = d3.select("#third-graph")
.append("svg")
.attr("viewBox", `0 0 `+width2 +` `+height2)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);
//.attr("width", width + margin.left + margin.right)
//.attr("height", height + margin.top + margin.bottom)




// load the first set of data when load page
window.onload = function() {
  initPage("data/new_cases_per_million.csv");
  updateSelect("data/new_cases_per_million.csv");
};




// function that get the data and parse it
function getData(val){
  return d3.csv(val,
    // When reading the csv, I must format variables:
    function(d){
      //console.log(d);
      return { 
        date : d3.timeParse("%Y-%m-%d")(d.date), 
        valueTmed : parseFloat(d.France) }
      }
      );
}

// function that create the X Axix
function getXAxis(theData, width){
  var x = d3.scaleTime()
  .domain(d3.extent(theData, function(d) { return d.date; }))
  .range([ 0, width1 ]);
  return x;
}
function getYAxis(theData, height){
  var y = d3.scaleLinear()
  .domain([0, d3.max(theData, function(d) { return +d.valueTmed; })])
  .range([ height1, 0 ]);
}

function initPage(val){
  var theData = getData(val);
  theData.then(
    function(data) {
    // Add X axis 
    svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height1})`);
    // Add Y axis
    svg.append("g")
    .attr("class", "y axis");
    // Add the line
    svg.append("path")
    .attr("class", "dataLine");
    // Add the line
    svg.append("circle")
    .attr("class", "dot");
    // Add the line
    svg.append("rect")
    .attr("class", "hitbox");
  })
}

function updateSelect(val) {
  //clear svg
  d3.select("path").remove();
  svg.selectAll("circle").remove();
  svg.selectAll("rect").remove();

  //Read the data
  var theData = getData(val);
  console.log(theData);

  theData.then(
  // Now I can use this dataset:
  function(data) {
    // maj X axis 
    var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, width1 ]);
    svg.selectAll("g.x.axis")
    .attr("transform", `translate(0, ${height1})`)
    .call(d3.axisBottom(x));

    // maj Y axis
    var y = d3.scaleLinear()
    .domain([0,d3.max(data, function(d) { return +d.valueTmed; })])
    .range([ height1, 0 ]);
    svg.selectAll("g.y.axis")
    .call(d3.axisLeft(y));

    // maj of the line
    svg.selectAll("path.dataLine")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(d.valueTmed) })
      )
    // add the hitbox with tooltips
    svg.selectAll("rect.hitbox")
    .data(data)
    .enter()
    .append("rect")
    .attr('x', function(d) { return x(d.date); })
    .attr('y', 0)
    .attr('height', function(d) { return height1; })
    .attr('width', function(d) { return width1/364; })
    .attr('fill', "#0000")
    .attr('stroke', "none")
    .on("mouseover", function(event,d) {
      svg.append('circle')
      .attr('cx', x(d.date))
      .attr('cy', y(d.valueTmed))
      .attr('r', 5)
      .attr('stroke', 'black')
      .attr('fill', 'black');
      ttip.transition()
      .duration(0)
      .style("opacity", .9);
      ttip.html(
        "Date: " + 
        d.date.toLocaleString('default', { month: 'long' })  + 
        " " + 
        d.date.getUTCDate() + 
        "<br/>Tmin: " + 
        d.valueTmin + 
        "<br/>Tmax: " + 
        d.valueTmax
        )
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
     svg.selectAll("circle").remove();
     ttip.transition()
     .duration(0)
     .style("opacity", 0);
   });
  })
}

**/