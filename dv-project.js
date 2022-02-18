// ALL VARIABLES

// variable global for the all page theme
var themeAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
var themeSecondaryAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
var themeTertiaryAccentColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
var themeAccentRangeColor = ["#FFF3E0", "#FFCC80", "#FFA726", "#FB8C00", "#EF6C00"];
var darkModeValue = 0; //on page load: changed to 1 and light mode

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// variable for global selects
const europeanCountries = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'United Kingdom'];
const governmentPolicies = ["testing_policy","vaccination_policy","facial_coverings","income_support","public_information_campaigns","cancel_public_events","close_public_transport","school_closures","stay_home_requirements"];
const policiesFilenameList = ["covid-19-testing-policy.csv", "covid-vaccination-policy.csv", "face-covering-policies-covid.csv", "income-support-covid.csv", "public-campaigns-covid.csv", "public-events-covid.csv", "public-transport-covid.csv", "school-closures-covid.csv", "stay-at-home-covid.csv"];
const covidFactors = ["Number of people in public transport", "Number of people in work places", "Number of people in grocery stores", "Number of people in non essential stores", "Number of people in public spaces", "Number of people in residential areas"];
const policiesMaxLevel = {"covid-19-testing-policy.csv" : 3, "covid-vaccination-policy.csv" : 5, "face-covering-policies-covid.csv" : 4, "income-support-covid.csv" : 2, "public-campaigns-covid.csv" : 2, "public-events-covid.csv" : 2, "public-transport-covid.csv" : 2, "school-closures-covid.csv" : 3, "stay-at-home-covid.csv" : 3};
var selectParameter = {country: 8, policy: 6, factor: 0};
var g1_dictCountriesPolicies = {};
const dataFolderPrefix = "data/"; 
const dictFilenameToColumn = {
	"covid-19-testing-policy.csv":"testing_policy",
	"covid-vaccination-policy.csv":"vaccination_policy",
	"face-covering-policies-covid.csv":"facial_coverings",
	"income-support-covid.csv":"income_support",
	"public-campaigns-covid.csv":"public_information_campaigns",
	"public-events-covid.csv":"cancel_public_events",
	"public-transport-covid.csv":"close_public_transport",
	"school-closures-covid.csv":"school_closures", 
	"stay-at-home-covid.csv":"stay_home_requirements"
};
const factorsColumnNames = ["transit_stations", "workplaces", "grocery_and_pharmacy", "retail_and_recreation", "parks", "residential"];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// data for the first graph
var g1_dictDeathPerCountry = {"Date":[]};
g1_dictFactorPerCountry = {"Date":[]};
var g1_nbDays = 0;  // number of days studied
var g1_listMinY = {};  // list of the minimum value for each country
var g1_listMaxY = {};  // idem for max
var g1_graphPeriod = [new Date('2020-01-01'), new Date('2021-01-01')];  // period of the values 
const g1_fomatTimetooltip = d3.timeFormat("%A %d %b %Y");
var g1_countryCompared = "Italy";
const g1_death_filename = "new_deaths_per_million.csv";
var g1_factor_filename = "changes-visitors-covid.csv";
var g1_countryHighlighted = "France";

// Set the dimensions and g1_margins of the g1_graph
const g1_svg_size = {width:800, height:400};
const g1_margin = {top: 20, right: 30, bottom: 20, left: 40},
g1_width = g1_svg_size.width - g1_margin.left - g1_margin.right,
g1_height = g1_svg_size.height - g1_margin.top - g1_margin.bottom;

// create the grap area
const g1_graph = d3.select("#graph_area");

// construct scales and axes
const g1_xScale = d3.scaleTime()
	.domain(g1_graphPeriod)
	.range([ 0, g1_svg_size.width]);

const g1_yScale = d3.scaleLinear()
	.domain([-100, 100])
	.range([g1_svg_size.height, 0]);

const g1_Xaxis = d3.axisBottom(g1_xScale);
const g1_Yaxis = d3.axisLeft(g1_yScale);

// construct g1_svg
const g1_svg = g1_graph.append("svg")
	.attr("viewBox", `0 0 ${g1_svg_size.width+g1_margin.left+g1_margin.right} ${g1_svg_size.height+g1_margin.top+g1_margin.bottom}`)
	.on("pointerenter pointermove", g1_pointermoved)
	.on("pointerleave", g1_pointerleft);


// append graph 1 legend svg
const g1_legend = d3.select("#g1_legend")
.append("svg")
.attr("viewBox", "0 0 200 16")
.append("g");

g1_svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", g1_margin.left + g1_margin.right + g1_width/2 )
    .attr("y", g1_height + g1_margin.top + g1_margin.bottom + 35 )
    .text("Time (days)");
g1_svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", - g1_height / 4)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .text("Deaths per million");


const g1_axis_bottom = g1_svg.append("g")
	.attr("transform", `translate(${g1_margin.left}, ${g1_svg_size.height})`)
	.attr("class", "g1_Xaxis")
	.call(g1_Xaxis);

g1_svg.append("g")
	.attr("transform", `translate(${g1_margin.left},0)`)
	.attr("class", "g1_Yaxis")
	.call(g1_Yaxis);

const g1_tooltip = g1_svg.append("g")
	.style("pointer-events", "none");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var g2_countryHighlightedDateBegin;
var g2_graphPeriod = [0, 30];  // period of the values 
const g2_fomatTimeTooltip = d3.timeFormat("%A %d %b %Y");
const g2_graphColors = ["#FF6D00",  "#E040FB"]; // "#FF6E40"]; //, "#64FFDA", "#448AFF", "#E040FB"];
var g2_countryCompared = "Italy";
var g2_policySelected =  "public-transport-covid.csv"; //policiesFilenameList[selectParameter['policy']];
var g2_policyLevelSelected = 0;
var g2_idxFactorSelected = 0;
var g2_factorSelected = factorsColumnNames[g2_idxFactorSelected];


// Set the dimensions and g2_margins of the g2_graph
const g2_svg_size = {width:800, height:400};
const g2_margin = {top: 20, right: 30, bottom: 20, left: 40},
g2_width = g2_svg_size.width - g2_margin.left - g2_margin.right,
g2_height = g2_svg_size.height - g2_margin.top - g2_margin.bottom;

// create the grap area
const g2_graph = d3.select("#g2_graph_area");

// construct scales and axes
const g2_xScale = d3.scaleLinear()
	.domain(g2_graphPeriod)
	.range([ 0, g2_svg_size.width]);

const g2_yScale = d3.scaleLinear()
	.domain([-100, 100])
	.range([g2_svg_size.height, 0]);

const g2_Xaxis = d3.axisBottom(g2_xScale);
const g2_Yaxis = d3.axisLeft(g2_yScale);

// construct SVG
const g2_svg = g2_graph.append("svg")
	.attr("viewBox", `0 0 ${g2_svg_size.width+g2_margin.left+g2_margin.right} ${g2_svg_size.height+g2_margin.top+g2_margin.bottom}`)
	.on("pointerenter pointermove", g2_pointermoved)
	.on("pointerleave", g2_pointerleft);


// append graph 2 legend svg
const g2_legend = d3.select("#g2_legend")
.append("svg")
.attr("viewBox", "0 0 200 16")
.append("g");

g2_svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", g2_margin.left + g2_width/2 + 163 )
    .attr("y", g2_height + g2_margin.top + g2_margin.bottom + 35 )
    .text("Time since the beginning of the policy (days)")
    .attr("text-align", "center");
g2_svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", - g2_height / 4)
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .text("Number of person");


g2_svg.append("g")
	.attr("transform", `translate(${g2_margin.left}, ${g2_svg_size.height})`)
	.attr("class", "xaxis")
	.call(g2_Xaxis);

g2_svg.append("g")
	.attr("transform", `translate(${g2_margin.left},0)`)
	.attr("class", "yaxis")
	.call(g2_Yaxis);

const g2_tooltip = g2_svg.append("g")
	.style("pointer-events", "none");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// variable for third graph g3_svg dimensions
const g3_margin = {top: 10, right: 30, bottom: 50, left: 60};
const g3_width = 800;
const g3_height = 500;
const g3_widthReduced = g3_width - g3_margin.left - g3_margin.right;
const g3_heightReduced = g3_height - g3_margin.top - g3_margin.bottom;
var g3_XScale;
var g3_YScale;
var g3_legend_content = []; //contains element [color, text], max 2 of them

// data for the third graph
var g3_dictData=[];
var g3_extractedData = [];
var startDate = [];

// append the third graph g3_svg object to the body of the page
const g3_svg = d3.select("#third-graph")
.append("svg")
.attr("viewBox", `0 0 ${g3_width} ${g3_height}`)
.append("g")
.attr("transform", `translate(${g3_margin.left},${g3_margin.top})`);

// append graph 3 legend svg
const g3_legend = d3.select("#g3_legend")
.append("svg")
.attr("viewBox", "0 0 200 50")
.append("g");
g3_svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", g3_width/2 +20)
    .attr("y", g3_height - 20)
    .text("Time (box: 30 days, tick: policy level)");
g3_svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", -45)
    .attr("x", -80)
    .attr("transform", "rotate(-90)")
    .text("evolution of death (% of day 1 death)");

const g3_format = d3.timeFormat("%Y-%m-%d");






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ALL FUNCTIONS

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR THE ALL PAGE 

// load the first set of data when load page and init the selects
window.onload = function() {
  initSelect(europeanCountries, "selectCountry", selectParameter["country"]);
  initSelect(governmentPolicies, "selectPolicy", selectParameter["policy"]);
  initSelect(covidFactors, "selectFactor", selectParameter["factor"]);
  initSelect(europeanCountries, "selectGraph1", 13);
  initSelect(europeanCountries, "selectGraph2", 13);
  initSelect(Array.from({length: policiesMaxLevel[policiesFilenameList[selectParameter["policy"]]] }, (v, i) => i), "selectPolicyLevelGraph2", 1);
  initSelect(europeanCountries, "selectGraph3", 1);


  g1_initPage();
  setTimeout(()=>{g1_computePolicies()}, 0);
  setTimeout(()=>{g1_computeDeath()}, 0);
  setTimeout(()=>{g1_computeFactors()}, 0);
  setTimeout(()=>{g1_computeMinMax()}, 500);
  setTimeout(()=>{g1_update()}, 1500);
  setTimeout(()=>{g2_update()}, 1500);
  setTimeout(()=>{g3_initPage('data/new_deaths_per_million.csv')}, 1500);
  darkMode();  
}; 

// function to change the page theme
function darkMode(){
  if (darkModeValue==1){
    darkModeValue=0;
    document.documentElement.style.setProperty('--body-bg-color', '#F5F5F5');
    document.documentElement.style.setProperty('--card-bg-color', '#E5E5E5');
    document.documentElement.style.setProperty('--select-bg-color', '#D5D5D5');
    document.documentElement.style.setProperty('--divider-color', '#C5C5C5');
    document.documentElement.style.setProperty('--text-color', '#424242');
    document.documentElement.style.setProperty('--title-color-bright', '#01579B');
    document.documentElement.style.setProperty('--title-color-muted', '#039BE5');
    themeAccentColor = '#757575';
    themeSecondaryAccentColor = '#E65100';
    themeTertiaryAccentColor = '#0091EA';
  }else{
    darkModeValue=1;
    document.documentElement.style.setProperty('--body-bg-color', '#121212');
    document.documentElement.style.setProperty('--card-bg-color', '#202020');
    document.documentElement.style.setProperty('--select-bg-color', '#323232');
    document.documentElement.style.setProperty('--divider-color', '#484848');
    document.documentElement.style.setProperty('--text-color', '#E1F5FE');
    document.documentElement.style.setProperty('--title-color-bright', '#039BE5'); 
    document.documentElement.style.setProperty('--title-color-muted', '#4FC3F7');
    themeAccentColor = '#E1F5FE';
    themeSecondaryAccentColor = '#FF6D00';
    themeTertiaryAccentColor = '#0091EA';
  }
  g3_update(g3_extractedData);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR THE SELECTS ELEMENTS IN HTML

// initialize the select elements with a list of names/texts 
//and the id of the select element
function initSelect(data, selectId, value){
  var str = "";
  var i = 0;
  for (var item of data) {
    str += "<option value=\"" + i + "\">" + item + "</option>";
    i+=1;
  }
  document.getElementById(selectId).innerHTML = str;
  document.getElementById(selectId).selectedIndex = value;
}

// change values of the selectParameters when select value changes
function selectOnChange(selectID){
  if (selectID=="selectCountry"){
    selectParameter['country'] = document.getElementById(selectID).value;
    g1_countryHighlighted = europeanCountries[selectParameter['country']];
  }if (selectID=="selectPolicy"){
    selectParameter['policy'] = document.getElementById(selectID).value;
    g2_policySelected = policiesFilenameList[selectParameter['policy']];
    initSelect(Array.from({length: policiesMaxLevel[g2_policySelected] }, (v, i) => i), "selectPolicyLevelGraph2", 0);
    g2_policyLevelSelected = 0;
  }if (selectID=="selectFactor"){
    selectParameter['factor'] = document.getElementById(selectID).value;
    g2_idxFactorSelected = selectParameter["factor"];
    g2_factorSelected = factorsColumnNames[g2_idxFactorSelected];
  }

  g1_update();
  g2_update();

  startDate = [];
  startDate = g3_getPolicyChangesDates(selectParameter['country'], selectParameter['policy'], g1_dictCountriesPolicies);
  g3_extractedData = [];
  g3_extractedData = g3_extractData(startDate, g3_dictData[selectParameter['country']], themeSecondaryAccentColor, g3_extractedData);
  g3_legend_content = []
  g3_legend_content.push([themeSecondaryAccentColor, europeanCountries[selectParameter['country']]]);
  g3_update(g3_extractedData);
}

function g2_selectChange(selectID){
  if (selectID == "selectGraph2"){
    g2_countryCompared = europeanCountries[document.getElementById(selectID).value];
  }
  if (selectID == "selectPolicyLevelGraph2"){
    g2_policyLevelSelected = parseFloat(document.getElementById(selectID).value);
  }

  g2_update();
}

function g1_selectChange(selectID){
  g1_countryCompared = europeanCountries[document.getElementById(selectID).value];
  g1_update(); 
}


// Add a country to the Graph 3 to compare with the first one
function g3_selectChange(selectID){
  startDate = [];
  startDate = g3_getPolicyChangesDates(selectParameter['country'], selectParameter['policy'], g1_dictCountriesPolicies);
  g3_extractedData = [];
  g3_extractedData = g3_extractData(startDate, g3_dictData[selectParameter['country']], themeSecondaryAccentColor, g3_extractedData);
  var startDateTemp = [];
  startDateTemp = g3_getPolicyChangesDates(document.getElementById(selectID).value, selectParameter['policy'], g1_dictCountriesPolicies);
  while (startDateTemp.length > startDate.length) {startDateTemp.pop();}
  g3_extractedData = g3_extractData(startDateTemp, g3_dictData[document.getElementById(selectID).value], themeAccentColor, g3_extractedData);
  if (g3_legend_content.length == 1){
    g3_legend_content.push([themeAccentColor, europeanCountries[document.getElementById(selectID).value]]);
  }else if (g3_legend_content.length == 2){
    g3_legend_content[1] = [themeAccentColor, europeanCountries[document.getElementById(selectID).value]];
  }
  g3_update(g3_extractedData);
}

function g3_checkboxChange(labelID) {
  var x = document.getElementById(labelID).innerText;
  var src = "";
  if (x=="Deaths per million"){
    document.getElementById(labelID).innerText = "Cases per million";
    src = 'data/new_cases_per_million.csv';
  } else {
    document.getElementById(labelID).innerText = "Deaths per million";
    src = 'data/new_deaths_per_million.csv';
  }
  g3_dictData=[];
  g3_extractedData = [];
  for (i=0; i<europeanCountries.length; i++){
    g3_dictData[i] = [];
  }       
  g3_getData(src, g3_dictData).then(function(){
    startDate = [];
    startDate = g3_getPolicyChangesDates(selectParameter['country'], selectParameter['policy'], g1_dictCountriesPolicies);
    g3_extractedData = g3_extractData(startDate, g3_dictData[selectParameter['country']], themeSecondaryAccentColor, g3_extractedData);
    g3_legend_content=[];
    g3_legend_content.push([themeSecondaryAccentColor, europeanCountries[selectParameter['country']]]);
    g3_update(g3_extractedData);
  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//MATH FUNCTIONS 

// 2D matrix g3_transpose
function g3_transpose(array2D){
  return array2D[0].map((_, colIndex) => array2D.map(row => row[colIndex]));
}

// min of a 3D matrix only on the 2nd element the 3rd dim 
// ie : min for all row, for all col, for all 2nd elem
function g3_getMin(arrayData){
  var temp = [];
  for (i=0; i<arrayData.length; i++){
    temp.push(Math.min(...g3_transpose(arrayData[i])[1]));
  }
  return Math.min(...temp);
}

// max of a 3D matrix only on the 2nd element the 3rd dim 
// ie : max for all row, for all col, for all 2nd elem
function g3_getMax(arrayData){
  var temp = [];
  for (i=0; i<arrayData.length; i++){
    temp.push(Math.max(...g3_transpose(arrayData[i])[1]));
  }
  return Math.max(...temp);
}

// COMPUTE THE MIN AND MAX FOR EACH COUNTRY
function g1_computeMinMax(){
	g1_nbDays = g1_dictDeathPerCountry["Date"].length;
	europeanCountries.forEach(function(country){
		g1_listMaxY[country] = Math.max(...g1_dictDeathPerCountry[country]);
	});
	g1_graphPeriod[0] = g1_dictDeathPerCountry["Date"][0];
	g1_graphPeriod[1] = g1_dictDeathPerCountry["Date"][g1_nbDays - 1];
	g1_updateAxis(g1_graphPeriod, []);
}






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR GRAPH 1

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function g1_initPage(){
	europeanCountries.forEach(function(country){
		g1_dictCountriesPolicies[country] = {};
		g1_dictFactorPerCountry[country] = {};
    g1_dictDeathPerCountry[country] = [];

		policiesFilenameList.forEach(function(policy){
			g1_dictCountriesPolicies[country][policy] = {last_idx:-1, list_dates:[], list_idx:[]};
		})

		factorsColumnNames.forEach(function(factor){
			g1_dictFactorPerCountry[country][factor] = [];
		})
	})
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// UPDATE GRAPH 

function g1_update(){
	selectionMaxY = [g1_listMaxY[g1_countryHighlighted]];
  selectionMaxY.push(g1_listMaxY[g1_countryCompared]);


	maxy = Math.max(...selectionMaxY);
	miny = - 0.1 * maxy
	datay = [miny, maxy];

  // update lengend content
  g1_legend.selectAll(".legend_circle")
    .data([themeSecondaryAccentColor, themeAccentColor])
    .join(
      function(enter){ return enter.append("circle");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_circle')
    .attr("cx", function(d,i) { return i*(65)+5;})
    .attr("cy",8)
    .attr("r", 4)
    .style("fill", function(d) {return d;});
 
  g1_legend.selectAll(".legend_text")
    .data([g1_countryHighlighted, g1_countryCompared])
    .join(
      function(enter){ return enter.append("text");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_text')
    .attr("x", function(d,i) { return i*(65)+10;})
    .attr("y", 8)
    .text(function(d) {return d})
    .style('fill', themeAccentColor)
    .style("font-size", "10px")
    .attr("alignment-baseline","middle");

  g1_svg.selectAll('.x.label')
    .style('fill', themeAccentColor);
  g1_svg.selectAll('.y.label')
    .style('fill', themeAccentColor);


	g1_updateAxis([], datay);
	g1_updateg1_graph();
	g1_updateRect(miny);
	g1_updateCircles();
	document.getElementById("g1_title").innerHTML = "Implementation of "+governmentPolicies[selectParameter['policy']]+" policies in "+europeanCountries[selectParameter['country']];
	document.getElementById("g1_countryName1").innerHTML = ""+europeanCountries[selectParameter['country']];
	document.getElementById("g1_countryName2").innerHTML = ""+europeanCountries[selectParameter['country']];
	document.getElementById("g1_countryName3").innerHTML = ""+europeanCountries[selectParameter['country']];
	document.getElementById("g1_policyName1").innerHTML = ""+governmentPolicies[selectParameter['policy']];
}

function g1_updateCircles(){
	dataX = [];
	dataY = [];
	policiesFilenameList.forEach(function(policy_name){
		dataX = dataX.concat(g1_dictCountriesPolicies[g1_countryHighlighted][policy_name].list_dates);
	});
	temp = d3.scaleLinear()
	.domain(g1_graphPeriod)
	.range([0, g1_nbDays]);
	dataX.forEach(function(date){
		dataY.push(g1_dictDeathPerCountry[g1_countryHighlighted][parseInt(temp(date))]);
	});

	var selection = g1_svg.selectAll(".new_circles")
	.data(dataX)
	.join(
		function(enter){return enter.append("circle");},
		function(update){return update;},
		function(exit){return exit.remove();}
	)
	.attr("fill", themeTertiaryAccentColor)
	.attr("class", "new_circles")
	.attr("cx", function(d) { return g1_xScale(d) })
	.attr("cy", function(_, i) { return g1_yScale(dataY[i]) })
	.attr("r", 3)
	.attr("transform", `translate(${g1_margin.left}, 0)`);
}

function g1_updateRect(size){
	selectedPolicy = policiesFilenameList[selectParameter['policy']];
	listDates = g1_dictCountriesPolicies[g1_countryHighlighted][selectedPolicy].list_dates;
	listIdx = g1_dictCountriesPolicies[g1_countryHighlighted][selectedPolicy].list_idx;
	rect_color = d3.scaleQuantize()
		.domain([0,5])
		.range(themeAccentRangeColor);

	dataX = listDates.concat(g1_graphPeriod[1]);
	var selection = g1_svg.selectAll(".new_rect")
	.data(listDates)
	.join(
		function(enter){return enter.append("rect");},
		function(update){return update;},
		function(exit){return exit.remove();}
	)
	.attr("fill", function(_, i){ return rect_color(listIdx[i]) })
	.attr("class", "new_rect")
	.attr("x", function(_, i) { return g1_xScale(dataX[i]) })
	.attr("y", function(d, _) { return g1_yScale(0) })
	.attr("width", function(_, i){ return g1_xScale(dataX[i+1]) - g1_xScale(dataX[i])})
	.attr("height", g1_yScale(size) - g1_yScale(0))
	.attr("stroke-width", 1)
	.attr("transform", `translate(${g1_margin.left}, 0)`)
	.lower();
}

function g1_updateg1_graph(){

	var dataX = g1_dictDeathPerCountry["Date"];
	var dataY = [g1_dictDeathPerCountry[g1_countryHighlighted]];
	var colors = [themeSecondaryAccentColor];


  dataY.push(g1_dictDeathPerCountry[g1_countryCompared]);
  colors.push([themeAccentColor]);


	var selection = g1_svg.selectAll(".new_path")
	.data(dataY)
	.join(
		function(enter){return enter.append("path");},
		function(update){return update;},
		function(exit){return exit.remove();}
	)
	.attr("fill", "none")
	.attr("class", "new_path")
	.attr("stroke", function(_, i){ return ((colors[i]==themeAccentColor) ? ''+colors[i]+'80' : colors[i]) })
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return g1_xScale(dataX[i]) })
		.y(function(d, _) { return g1_yScale(d) })
	)
	.attr("transform", `translate(${g1_margin.left}, 0)`);
}

function g1_updateAxis(dataX, dataY){
	if (dataX.length != 0){
		g1_xScale.domain(dataX);
		g1_svg.selectAll("g.g1_Xaxis")
			.call(d3.axisBottom(g1_xScale));
	}
	if (dataY.length != 0){
		//dataY[0] = 0;
		g1_yScale.domain(dataY);
		g1_svg.selectAll("g.g1_Yaxis")
			.call(d3.axisLeft(g1_yScale));
	}
}

function g1_pointermoved(event){

	var coords = d3.pointer(event);  // coords of the mouse
	var mouseX = coords[0];
	var mouseY = coords[1];

	var xVal = mouseX - g1_margin.left;
	var index = parseInt((mouseX-g1_margin.left) * g1_nbDays/g1_svg_size.width);
	var xDataValue = g1_dictDeathPerCountry["Date"][index];
	var yDataValue = g1_dictDeathPerCountry[g1_countryHighlighted][index];
	var textContent = [];

	policiesFilenameList.forEach(function(policy_name){
		idx = 0;
		ldates = g1_dictCountriesPolicies[g1_countryHighlighted][policy_name].list_dates.concat(g1_graphPeriod[1]);
		lidx = g1_dictCountriesPolicies[g1_countryHighlighted][policy_name].list_idx;
		for(var j=0; j< ldates.length; j++){
			if (xDataValue >= ldates[j] && xDataValue <= ldates[j+1]){
				idx = lidx[j];
			}
		}
		if(idx != 0) textContent.push([policy_name.split(".")[0],idx]);
	});
	textContent.push(['Deaths',yDataValue]);
	textContent.push(g1_fomatTimetooltip(xDataValue));
	
	dataX = g1_xScale(xDataValue);
	if (dataX == undefined){ 
    dataX = g1_xScale(0);
  }else{
    addToLegend(textContent);
  }
	dataY = g1_yScale.range();

	var selection = g1_svg.selectAll(".new_line")
	.data([dataY])
	.join(
		function(enter){return enter.append("path");},
		function(update){return update;},
		function(exit){return exit.remove();}
	)
	.attr("fill", "none")
	.attr("class", "new_line")
	.attr("stroke", themeAccentColor)
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return dataX })
		.y(function(d, i) { return dataY[i] })
	)
	.attr("transform", `translate(${g1_margin.left}, 0)`);
	
}

function g1_pointerleft(){
	g1_tooltip.style("display", "none");
}

function addToLegend(textContent){
	var theDate = textContent.pop();
	var nbDeath = textContent.pop()[1];
	var res="";
	res+="<p class=\"text-justify\">Date : "+theDate+"</br>Number of deaths : "+nbDeath+"</br></br>";
	res+="<table><tr><th>Policy name</th><th>Policy level</th></tr>";
	for (i=0; i<textContent.length; i++){
		res+="<tr><td>"+textContent[i][0]+"</td><td>"+textContent[i][1]+"</td></tr>";
	}
	document.getElementById("g1_legendTable").innerHTML = res;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DATA TREATMENT 

// COMPUTING POLICY CHANGES IN EACH COUNTRY SELECTED FOR EACH POLICY SELECTED
async function g1_computePolicies(){
	await policiesFilenameList.forEach(function(policy_filename){  // for each policy filename
		d3.dsv(",", dataFolderPrefix+policy_filename).then(function(data){
			data.map(function(line){  // for each line
				europeanCountries.forEach(function(country_name){  // for each country
					if(line["Entity"] == country_name){
						policy_idx = parseInt(line[dictFilenameToColumn[policy_filename]]);
						date = line["Day"];
						if (new Date(date) > new Date("2020-01-21")){
							dictCountry = g1_dictCountriesPolicies[country_name][policy_filename];
							if (dictCountry.last_idx != policy_idx){
								dictCountry.last_idx = policy_idx;
								dictCountry.list_dates.push(new Date(date));
								dictCountry.list_idx.push(policy_idx);
							}
						}
					}
				});
			})
		})
	});
}

// COMPUTE DEATHS PER MILLION PER DAY FOR EACH COUNTRY SELECTED
function g1_computeDeath(){
	d3.csv(dataFolderPrefix+g1_death_filename).then(function(data) {
		data.map(function(line){
			europeanCountries.concat("Date").forEach(function(country){
				value = 0;
				if(country != "Date"){
					if(line[country] != ""){
						value = parseFloat(line[country]);  // parse to Float
						if(value < 0) value = 0;
					}
				}else{
					value = new Date(line["date"]);  // parse to Date
				}
					g1_dictDeathPerCountry[country].push(value);
			});
		});
	});
	return;
}


function g1_computeFactors(){
  dateIsDone = false;
  d3.csv(dataFolderPrefix+g1_factor_filename).then(function(data) {
    data.map(function(line){
      country = line["Entity"];
      date = line["Day"];
      if (new Date(date) > new Date("2020-01-21")){
        if (europeanCountries.includes(country)){  // the country being read is in Europe
          factorsColumnNames.forEach(function(factor){
            value = 0;
            if (line[factor] != ""){
              value = parseFloat(line[factor]);
            }
            g1_dictFactorPerCountry[country][factor].push(value);
          })
        }

        if (country === "France"){
          g1_dictFactorPerCountry["Date"].push(new Date(date));
        }
      }
    });
  });
  return;
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR GRAPH 2

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// UPDATE GRAPH

function g2_update(){
	var selectionMaxY = [];
	var dataY = [];
	var isDone = false;
	var tempY;
	var dateLevel = -1;


	[g1_countryHighlighted].concat(g2_countryCompared).forEach(function(country_name){
		tempY = [];
		listIndexes = g1_dictCountriesPolicies[country_name][g2_policySelected].list_idx;
		listDates = g1_dictCountriesPolicies[country_name][g2_policySelected].list_dates;
		for(var j = listIndexes.length -1; j>= 0; j--){
			if(listIndexes[j] === g2_policyLevelSelected){
				if(listDates[j] >= new Date("2020-02-17") ){
					dateLevel = listDates[j];  // get the date corresponding to the first application of this policy at this level
				}
			}
		}


		if(dateLevel != -1){
			idx_day1 = g1_dictFactorPerCountry["Date"].findIndex(function(elt){
				return elt.getTime() === dateLevel.getTime();
			})
			if( country_name === g1_countryHighlighted ){
        g2_countryHighlightedDateBegin = idx_day1;
      }

			for(var j=idx_day1; j<idx_day1+31; j++){
				tempY.push(g1_dictFactorPerCountry[country_name][g2_factorSelected][j]);
				selectionMaxY.push(g1_dictFactorPerCountry[country_name][g2_factorSelected][j]);
			}
			dataY.push(tempY);

		}else{
			alert(country_name + " does not have " + g2_policySelected + " level " + g2_policyLevelSelected );
		}
		
	});
	var dataAxisY = [Math.min(...selectionMaxY), Math.max(...selectionMaxY)];
  document.getElementById("g2_title").innerHTML = "Effects of implementation of " + governmentPolicies[selectParameter['policy']] + " level " + g2_policyLevelSelected + " policy on " + covidFactors[g2_idxFactorSelected]; // HERE


  // update lengend content
  g2_legend.selectAll(".legend_circle")
    .data(g2_graphColors)
    .join(
      function(enter){ return enter.append("circle");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_circle')
    .attr("cx", function(d,i) { return i*(65)+5;})
    .attr("cy",8)
    .attr("r", 4)
    .style("fill", function(d) {return d;});
 
  g2_legend.selectAll(".legend_text")
    .data([g1_countryHighlighted, g2_countryCompared])
    .join(
      function(enter){ return enter.append("text");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_text')
    .attr("x", function(d,i) { return i*(65)+10;})
    .attr("y", 8)
    .text(function(d) {return d})
    .style('fill', themeAccentColor)
    .style("font-size", "10px")
    .attr("alignment-baseline","middle");

  g2_svg.selectAll('.x.label')
    .style('fill', themeAccentColor);
  g2_svg.selectAll('.y.label')
    .style('fill', themeAccentColor);


	g2_updateAxis([], dataAxisY);
	g2_update_graph(dataY);
}

function g2_update_graph(dataY){

	var selection = g2_svg.selectAll(".g2_new_path")
	.data(dataY)
	.join(
		function(enter){return enter.append("path");},
		function(update){return update;},
		function(exit){return exit.remove();}
	)
	.attr("fill", "none")
	.attr("class", "g2_new_path")
	.attr("stroke-width", function(_, i){if(i==0) return 2; return 1})
	.attr("stroke", function(_, i){ return g2_graphColors[i] })
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return g2_xScale(i) })
		.y(function(d, _) { return g2_yScale(d) })
	)
	.attr("transform", `translate(${g2_margin.left}, 0)`);
}

function g2_updateAxis(dataX, dataY){
	if (dataX.length != 0){
		g2_xScale.domain(dataX);
		g2_svg.selectAll("g.xaxis")
			.call(d3.axisBottom(g2_xScale));
	}
	if (dataY.length != 0){
		g2_yScale.domain(dataY);
		g2_svg.selectAll("g.yaxis")
			.call(d3.axisLeft(g2_yScale));
	}
}

function g2_pointermoved(event){

	if (g2_countryHighlightedDateBegin === undefined){
		return;  // the country cannot be displayed
	}

	var coords = d3.pointer(event);  // coords of the mouse
	var mouseX = coords[0];
	var mouseY = coords[1];
	var xVal = mouseX - g2_margin.left;
	var index = parseInt((mouseX-g2_margin.left) * 30/g2_svg_size.width);
	var xDataValue = g1_dictFactorPerCountry["Date"][g2_countryHighlightedDateBegin+index];
	var yDataValue = g1_dictFactorPerCountry[g1_countryHighlighted][g2_factorSelected][g2_countryHighlightedDateBegin+index];
	var yVal = g2_yScale(yDataValue) - 20;
	var textContent = [];

	textContent.push(`Value : ${yDataValue}`);
	textContent.push(g2_fomatTimeTooltip(xDataValue));
	g2_tooltip.style("display", null);

	const path = g2_tooltip.selectAll("path")
		.data([,])
		.join("path")
			.attr("fill", "#e2e2e2")
			.attr("stroke", "black");
	if(yVal === yVal){  // if yVal is not NaN
		const text = g2_tooltip.selectAll("text")
			.data([,])
			.join("text")
			.call(text => text
				.selectAll("tspan")
				.data(textContent)
				.join("tspan")
					.attr("y", (_, i) => `${yVal - i * 20}`)
					.text(d => d));
		g2_tooltip.raise();
		const {x, y, width: w, height: h} = text.node().getBBox();
		text.selectAll("tspan").attr("x", mouseX - w / 2)
		path.attr("d", g2_createPath(mouseX, yVal, w, h));
	}
	
}

function g2_createPath(x, y, w, h, lim){

	xmax = x + w / 2 + 10;
	xmin = x - w / 2 - 10;
	ymax = y + 10;
	ymin = y - h; // / 2 - 20;
	var path = d3.path();
	path.moveTo(xmin, ymin);
	path.lineTo(xmax, ymin);
	path.lineTo(xmax, ymax);
	path.lineTo(x + 3, ymax);
	path.lineTo(x,     ymax + 5);
	path.lineTo(x - 3, ymax);
	path.lineTo(xmin, ymax);
	path.closePath();
	return path.toString();
}

function g2_pointerleft(){
	g2_tooltip.style("display", "none");
}





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR GRAPH 3

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// UPDATE GRAPH

// initialize the graph 3 on page load
function g3_initPage(src){
  for (i=0; i<europeanCountries.length; i++){
    g3_dictData[i] = [];
  }
  // Add X axis 
  g3_svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${g3_height})`)
  .attr('stroke', themeAccentColor);
  // Add Y axis
  g3_svg.append("g")
  .attr("class", "y axis")
  .attr('stroke', themeAccentColor);
  g3_svg.append("g")
  .attr("class", "rect");

  g3_getData(src, g3_dictData).then(function(){
    startDate = [];
    startDate = g3_getPolicyChangesDates(selectParameter['country'], selectParameter['policy'], g1_dictCountriesPolicies);
    g3_extractedData = g3_extractData(startDate, g3_dictData[selectParameter['country']], themeSecondaryAccentColor, g3_extractedData);
    g3_legend_content.push([themeSecondaryAccentColor, europeanCountries[selectParameter['country']]]);
    g3_update(g3_extractedData);
  });
}

// update the graph 3 when change on the value of a select
function g3_update(graphData) {
  
  // maj X axis 
  g3_XScale = d3.scaleLinear()
  .domain([0, startDate.length])
  .range([ 0, g3_widthReduced ]);
  g3_svg.selectAll("g.x.axis")
  .attr("transform", `translate(0, ${g3_heightReduced})`)
  .attr('stroke', themeAccentColor)
  .call(d3.axisBottom(g3_XScale).ticks(startDate.length));

  // maj Y axis
  g3_YScale = d3.scaleLinear()
  .domain([g3_getMin(graphData), g3_getMax(graphData)])
  .range([g3_heightReduced, 0 ]);
  g3_svg.selectAll("g.y.axis")
  .attr('stroke', themeAccentColor)
  .call(d3.axisLeft(g3_YScale));

  // maj graph lines
  var selection = g3_svg.selectAll(".new_path")
  .data(graphData)
  .join(
    function(enter){ return enter.append("path");},
    function(update){ return update;},
    function(exit){ return exit.remove();}
  )
  .attr("fill", "none")
  .attr("class", "new_path")
  .attr("stroke", function(d){ return ((d[0][3]==themeAccentColor) ? ''+d[0][3]+'80' : d[0][3]); })
  .attr("d", d3.line()
    .curve(d3.curveLinear)
    .x(function(d) { return g3_XScale(d[0]/30) })
    .y(function(d) { return g3_YScale(d[1]) })
  );

  // maj vertical lines
  var aList=[];
  for (i=0; i<graphData.length; i++){ aList.push(i); }
  g3_svg.selectAll(".vertical_line")
    .data(aList)
    .join(
      function(enter){ return enter.append("line");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'vertical_line')
    .attr('x1', function(d) {return g3_XScale((d+1))})
    .attr('y1', 0)
    .attr('x2', function(d) {return g3_XScale((d+1))})
    .attr('y2', g3_heightReduced)
    .attr('stroke', themeAccentColor)
    .style("stroke-width", 1)
    .lower();

  // maj horizontal lines
  g3_svg.selectAll(".horizontal_line")
    .data([0])
    .join(
      function(enter){ return enter.append("line");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'horizontal_line')
    .attr('x1', 0)
    .attr('y1', function(d) {return g3_YScale(d)})
    .attr('x2', g3_widthReduced)
    .attr('y2', function(d) {return g3_YScale(d)})
    .attr('stroke', themeAccentColor)
    .style("stroke-width", 1)
    .lower();

  // maj html text content
  var descriptContent ="<table><tr><th>Policy level</th><th>Date of day 1</th><th>Nb death/million (day1)</th></tr>";
  var test=1;
  var theDate = "";
  for (k=0; k<graphData.length; k++){
    if (test==1 && graphData[k][0][0]==0){
    	test=0;
    	if (graphData[k][0][5] != 'err' && typeof graphData[k][0][5] !== 'undefined') {
    		theDate = g3_format(graphData[k][0][5]);
    	}
    	descriptContent = descriptContent+"<tr><td>"+k+"</td><td>"+theDate+"</td><td>"+graphData[k][0][4]+"</td></tr>";
    }
    else if (test==0 && graphData[k][0][0]==0){break;}
    else {
    	if (graphData[k][0][5] != 'err' && typeof graphData[k][0][5] !== 'undefined') {
    		theDate = g3_format(graphData[k][0][5]);
    		
    	}
    	descriptContent = descriptContent+"<tr><td>"+k+"</td><td>"+theDate+"</td><td>"+graphData[k][0][4]+"</td></tr>";
    }
  }descriptContent = descriptContent+"</table>";
  document.getElementById("g3_table").innerHTML = descriptContent;
  document.getElementById("g3_country_name").innerHTML = ""+europeanCountries[selectParameter['country']];
  document.getElementById("g3_policy_name").innerHTML = ""+governmentPolicies[selectParameter['policy']];
  document.getElementById("g3_title").innerHTML = "The impact of "+governmentPolicies[selectParameter['policy']]+" in "+europeanCountries[selectParameter['country']];

  // maj lengend content
  g3_legend.selectAll(".legend_circle")
    .data(g3_legend_content)
    .join(
      function(enter){ return enter.append("circle");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_circle')
    .attr("cx", function(d,i) { return i*(65)+5;})
    .attr("cy",40)
    .attr("r", 4)
    .style("fill", function(d) {return d[0];});
  g3_legend.selectAll(".legend_text")
    .data(g3_legend_content)
    .join(
      function(enter){ return enter.append("text");},
      function(update){ return update;},
      function(exit){ return exit.remove();}
    )
    .attr('class', 'legend_text')
    .attr("x", function(d,i) { return i*(65)+10;})
    .attr("y", 40)
    .text(function(d) {return d[1].substring(0,10);})
    .style('fill', themeAccentColor)
    .style("font-size", "10px")
    .attr("alignment-baseline","middle");
  g3_svg.selectAll('.x.label')
    .style('fill', themeAccentColor);
  g3_svg.selectAll('.y.label')
    .style('fill', themeAccentColor);
}
 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DATA TREATMENT

// function that get the data from source file (mySRC)
// parse all data and put it in the output variable (myOUT)
function g3_getData(mySRC, myOUT){
  return d3.csv(mySRC,
    // When reading the csv, I must format variables:
    function(d){
      var temp;
      date = new Date(d["date"]);
      for (var j = 0; j < europeanCountries.length; j++){
        temp = parseFloat(d[europeanCountries[j]]);
        if (temp !== temp){
          temp = 0;
        }
        myOUT[j].push([date,temp]);
        temp=0;
      }});  
} 

// function that take a liste of string containing dates "listDate"
// an array of data contained in the file "countryData" probably a sub array of g3_dictData
// and retrun an output variable "out"
function g3_extractData(listDate, countryData, color, myOUT){
  var currentMyOUTlength = myOUT.length;
  for (q=0; q<listDate.length; q++){
    myOUT.push([]);
  }
  //for each date in the list
  for (d=0; d<listDate.length; d++){
    //get the indice in the data where we want to start plotting (date of implementatio of the policy)

    if (listDate[d] != 'err'){
      var  indice = 0;
      var begginingDate = new Date(listDate[d]);
      for (i=0; i<countryData.length; i++){
        if (begginingDate.getTime() === countryData[i][0].getTime()){
          indice = i;
        }
      }
      //get the 30 first element from the date of implementation of the policy
      //normalize then to have 0=number of cases the first day
      for (j=0; j<31; j++){
        if (indice+j >= countryData.length) { break; }
        if (j==0){
          myOUT[d+currentMyOUTlength].push(
            [
              30*d+j, 
              0, 
              countryData[indice+j][0],
              color,
              countryData[indice+j][1],
              listDate[d]
            ]);
        }
        else{
          myOUT[d+currentMyOUTlength].push(
            [
              30*d+j, 
              100*(countryData[indice+j][1]-countryData[indice][1])/(countryData[indice][1]+1), 
              countryData[indice+j][0],
              color
            ]);
        }
      }
    } 
    else {
      for (j=0; j<31; j++){
        if (j==0){ myOUT[d+currentMyOUTlength].push([30*d+j, 0, new Date('2016-01-01'), themeAccentColor, 0, listDate[d]]); }
        else{ myOUT[d+currentMyOUTlength].push([30*d+j, 0, new Date('2016-01-01'), themeAccentColor]); }
      }
    }
  }
  return myOUT;
}

// return list of dates coresponding to policy changes for g3
function g3_getPolicyChangesDates(countryIndice, PolicyIndice, dataSRC) {
  var listDate = [];
  var data_country = dataSRC[europeanCountries[countryIndice]];
  var data_policy = data_country[policiesFilenameList[PolicyIndice]];
  var data_idx = data_policy['list_idx'];
  var data_dates = data_policy['list_dates'];
  var indiceList = [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000];

  for (i=0; i<data_idx.length; i++) {
    indiceList[data_idx[i]] = Math.min(i, indiceList[data_idx[i]]);
  }
  for (j=0; j<data_idx.length; j++) {
    if (indiceList[j] == 1000) {
      listDate.push('err');
    }else{
      listDate.push(data_dates[indiceList[j]]);
    }
  }
  while (listDate[listDate.length-1] == 'err' || typeof(listDate[listDate.length-1]) == 'undefined') {listDate.pop();}
  return listDate; 
}

