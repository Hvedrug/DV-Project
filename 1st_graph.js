// Useful constants
const europeanCountries = ["Albania", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Moldova", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom"];
const policiesFilenameList = ["covid-19-testing-policy.csv", "covid-vaccination-policy.csv", "face-covering-policies-covid.csv", "income-support-covid.csv", "public-campaigns-covid.csv", "public-events-covid.csv", "public-transport-covid.csv", "school-closures-covid.csv", "stay-at-home-covid.csv"];
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
var dictCountriesPolicies = {};
var dictDeathPerCountry = {"Date":[]};
var nbDays = 0;  // number of days studied
var listMinY = {};  // list of the minimum value for each country
var listMaxY = {};  // idem for max
var graphPeriod = [new Date('2020-01-01'), new Date('2021-01-01')];  // period of the values 
const fomatTimeTooltip = d3.timeFormat("%A %d %b %Y");

europeanCountries.forEach(function(country){
	dictCountriesPolicies[country] = {};
	dictDeathPerCountry[country] = [];

	policiesFilenameList.forEach(function(policy){
		dictCountriesPolicies[country][policy] = {last_idx:-1, list_dates:[], list_idx:[]};
	})
})


// DEBUG VARIABLES (USEFUL FOR NOW)
const data_filename = "new_deaths_per_million.csv"
var countriesDisplayed = JSON.parse(JSON.stringify(europeanCountries)); // deep copy
var countryHighligthed = "France";


// COMPUTING POLICY CHANGES IN EACH COUNTRY SELECTED FOR EACH POLICY SELECTED
function computePolicies(){

	policiesFilenameList.forEach(function(policy_filename){  // for each policy filename

		d3.csv(dataFolderPrefix+policy_filename).then(function(data) {

			data.map(function(line){  // for each line

				europeanCountries.forEach(function(country_name){  // for each country
				
					if(line["Entity"] == country_name){
						policy_idx = parseInt(line[dictFilenameToColumn[policy_filename]]);
						date = line["Day"];

						dictCountry = dictCountriesPolicies[country_name][policy_filename];
						if (dictCountry.last_idx != policy_idx){
							dictCountry.last_idx = policy_idx;
							dictCountry.list_dates.push(date);
							dictCountry.list_idx.push(policy_idx);
						}
					}
				});
			});
		});
	});
	computeDeath();
}


// COMPUTE DEATHS PER MILLION PER DAY FOR EACH COUNTRY SELECTED
function computeDeath(){
	
	d3.csv(dataFolderPrefix+data_filename).then(function(data) {

		data.map(function(line){

			europeanCountries.concat("Date").forEach(function(country){

				value = 0;
				if(country != "Date"){
					if(line[country] != ""){
						value = parseFloat(line[country]);  // parse to Float
					}
				}else{
					value = new Date(line["date"]);  // parse to Date
				}
					dictDeathPerCountry[country].push(value);

			});
		});
		computeMinMax();
	});
}


// COMPUTE THE MIN AND MAX FOR EACH COUNTRY
function computeMinMax(){
	nbDays = dictDeathPerCountry["Date"].length;

	europeanCountries.forEach(function(country){
		listMinY[country] = Math.min(...dictDeathPerCountry[country]);
		listMaxY[country] = Math.max(...dictDeathPerCountry[country]);

	});

	graphPeriod[0] = dictDeathPerCountry["Date"][0];
	graphPeriod[1] = dictDeathPerCountry["Date"][nbDays - 1];

	updateAxis(graphPeriod, []);
	newCountrySelected();
}



// Set the dimensions and margins of the graph
const svg_size = {width:1300, height:600};
const margin = {top: 120, right: 50, bottom: 0, left: 40},
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
	.text(data_filename+" in "+ countryHighligthed);



// construct scales and axes
const xScale = d3.scaleTime()
	.domain(graphPeriod)
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


var selectionMinY;
var selectionMaxY;
var dataY;

function update_1st_graph(){

	listX = [];
	listY = [];

	listX = dictDeathPerCountry["Date"];
	//listY = dictDeathPerCountry[countriesDisplayed];

	selectionMinY = [];
	selectionMaxY = [];
	countriesDisplayed.forEach(function(country){
		selectionMinY.push(listMinY[country]);
		selectionMaxY.push(listMaxY[country]);
	});

	datay = [Math.min(...selectionMinY),Math.max(...selectionMaxY)];
	console.log(datay);

	updateAxis([], datay);

	updateGraph(countriesDisplayed);

}


function updateGraph(){

	var dataX = dictDeathPerCountry["Date"];
	var dataY = [];

	idx = countriesDisplayed.findIndex(element => element === countryHighligthed );
	countriesDisplayed.splice(idx, 1); // remove the countryHighlighted
	countriesDisplayed.unshift(countryHighligthed); // add it at the bottom of the array

	countriesDisplayed.forEach(function(country){ 
			dataY.push(dictDeathPerCountry[country]);
		});

	colors = [];
	countriesDisplayed.forEach(function(country){
		if (country  != countryHighligthed){
			colors.push(["#B9B9B9"]);
		}else{
			colors.push(["#ff0000"]);
		}
	});


	var selection = svg.selectAll(".new_path")
	.data(dataY)
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
	.attr("class", "new_path")
	.attr("stroke", function(_, i){ return colors[i] })
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return xScale(dataX[i]) })
		.y(function(d, _) { return yScale(d) })
	)
	.attr("transform", `translate(${margin.left}, 0)`)
	.lower();  // draw the graph after other things

}

function updateAxis(dataX, dataY){

	if (dataX.length != 0){
		xScale.domain(dataX);
		svg.selectAll("g.xaxis")
			.call(d3.axisBottom(xScale));
		console.log("Xaxis updated with values : ", dataX);
	}

	if (dataY.length != 0){
		//dataY[0] = 0;
		yScale.domain(dataY);
		svg.selectAll("g.yaxis")
			.call(d3.axisLeft(yScale));
		console.log("Yaxis updated with values : ", dataY);
	}
}


function pointermoved(event){

	var coords = d3.pointer(event);  // coords of the mouse
	var mouseX = coords[0];
	var mouseY = coords[1];

	var xVal = mouseX - margin.left;
	var index = parseInt((mouseX-margin.left) * nbDays/svg_size.width);
	var xDataValue = dictDeathPerCountry["Date"][index];
	var yDataValue = dictDeathPerCountry[countryHighligthed][index];
	var yVal = yScale(yDataValue) - 20;
	var textContent = [yDataValue, fomatTimeTooltip(xDataValue)];

	tooltip.style("display", null);

	const path = tooltip.selectAll("path")
		.data([,])
		.join("path")
			.attr("fill", "white")
			.attr("stroke", "black");

	if(yVal === yVal){  // if yVal is not NaN

		const text = tooltip.selectAll("text")
			.data([,]) //textContent)
			.join("text")
			.call(text => text
				.selectAll("tspan")
				.data(textContent)
				.join("tspan")
					//.attr("x", mouseX)
					.attr("y", (_, i) => `${yVal - i * 20}`)
					.text(d => d));

		const {x, y, width: w, height: h} = text.node().getBBox();
		//console.log(x,y, w, h);

		text.selectAll("tspan").attr("x", mouseX - w / 2)

		path.attr("d", createPath(mouseX, yVal, w, h));
	}
	
}

function createPath(x, y, w, h){
	// TODO add max-like parameter to prevent the tooltip to be too far left or too far right
	var path = d3.path();
	path.moveTo(x - w / 2 - 10, y - h / 2 - 20);
	path.lineTo(x + w / 2 + 10, y - h / 2 - 20);
	path.lineTo(x + w / 2 + 10, y + 10);
	path.lineTo(x + 3,          y + 10);
	path.lineTo(x,              y + 15);
	path.lineTo(x - 3,          y + 10);
	path.lineTo(x - w / 2 - 10, y + 10);
	path.closePath();

	return path.toString();
}

function pointerleft(){
	tooltip.style("display", "none");
}




// initialize the select elements with a list of names/texts 
//and the id of the select element
function initSelect(data, selectId){
  var str = "";
  var i = 0;
  for (var item of data) {
    str += "<option value=\"" + i + "\">" + item + "</option>";
    i+=1;
  }
  document.getElementById(selectId).innerHTML = str;
  document.getElementById(selectId).selectedIndex = 11;
}

function newCountrySelected(){
	countryHighligthed = europeanCountries[document.getElementById("selectCountryFirstGraph").value];
	console.log("hererere", value);
	update_1st_graph();
}


initSelect(europeanCountries, "selectCountryFirstGraph");
computePolicies();
