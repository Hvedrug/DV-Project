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



// FUNCTIONS


europeanCountries.forEach(function(country){
	dictCountriesPolicies[country] = {};
	dictDeathPerCountry[country] = [];

	policiesFilenameList.forEach(function(policy){
		dictCountriesPolicies[country][policy] = {last_idx:-1, list_dates:[], list_idx:[]};
	})
})


// DEBUG VARIABLES (USEFUL FOR NOW)
const data_filename = "new_deaths_per_million.csv"
var countriesDisplayed = ["France", "United Kingdom"]; // "Germany", "United Kingdom", "Italy", "Spain"]; //JSON.parse(JSON.stringify(europeanCountries)); // deep copy
var countryHighlighted = "France";


// COMPUTING POLICY CHANGES IN EACH COUNTRY SELECTED FOR EACH POLICY SELECTED
async function computePolicies(){
	await policiesFilenameList.forEach(function(policy_filename){  // for each policy filename
		d3.dsv(",", dataFolderPrefix+policy_filename).then(function(data){

			data.map(function(line){  // for each line

				europeanCountries.forEach(function(country_name){  // for each country
				
					if(line["Entity"] == country_name){
						policy_idx = parseInt(line[dictFilenameToColumn[policy_filename]]);
						date = line["Day"];

						if (new Date(date) > new Date("2020-01-21")){
							dictCountry = dictCountriesPolicies[country_name][policy_filename];
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
function computeDeath(){
	

	d3.csv(dataFolderPrefix+data_filename).then(function(data) {

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
					dictDeathPerCountry[country].push(value);

			});
		});
	});
	return;
}


// COMPUTE THE MIN AND MAX FOR EACH COUNTRY
function computeMinMax(){
	console.log("computeMinMax IN at ", new Date().getTime());
	nbDays = dictDeathPerCountry["Date"].length;

	europeanCountries.forEach(function(country){
		listMaxY[country] = Math.max(...dictDeathPerCountry[country]);

	});

	graphPeriod[0] = dictDeathPerCountry["Date"][0];
	graphPeriod[1] = dictDeathPerCountry["Date"][nbDays - 1];

	updateAxis(graphPeriod, []);

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
	.text(data_filename+" in "+ countryHighlighted);



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


// FUNCTIONS


function update_1st_graph(){

	selectionMaxY = [listMaxY[countryHighlighted]];
	countriesDisplayed.forEach(function(country){
		selectionMaxY.push(listMaxY[country]);
	});

	maxy = Math.max(...selectionMaxY);
	miny = - 0.1 * maxy
	datay = [miny, maxy];
	console.log(datay);

	updateAxis([], datay);
	updateGraph(countriesDisplayed);
	updateRect(miny);
	updateCircles();

}

function updateCircles(){

	dataX = [];
	dataY = [];
	policiesFilenameList.forEach(function(policy_name){
		dataX = dataX.concat(dictCountriesPolicies[countryHighlighted][policy_name].list_dates);
	});

	temp = d3.scaleLinear()
	.domain(graphPeriod)
	.range([0, nbDays]);

	dataX.forEach(function(date){
		dataY.push(dictDeathPerCountry[countryHighlighted][parseInt(temp(date))]);
	});

	
	var selection = svg.selectAll(".new_circles")
	.data(dataX)
	.join(
		function(enter){
			return enter.append("circle");
		}
		,
		function(update){
			return update;
		},
		function(exit){
			return exit.remove();
		}

	)
	.attr("fill", "blue")
	.attr("stroke", "black")
	.attr("class", "new_circles")
	.attr("cx", function(d) { return xScale(d) })
	.attr("cy", function(_, i) { return yScale(dataY[i]) })
	.attr("r", 3)
	.attr("transform", `translate(${margin.left}, 0)`);

}



function updateRect(size){
	selectedPolicy = "school-closures-covid.csv";

	listDates = dictCountriesPolicies[countryHighlighted][selectedPolicy].list_dates;
	listIdx = dictCountriesPolicies[countryHighlighted][selectedPolicy].list_idx;
	rect_color = d3.scaleQuantize()
		.domain([0,5])
		.range(["#FFF3E0", "#FFCC80", "#FFA726", "#FB8C00", "#EF6C00"]);


	dataX = listDates.concat(graphPeriod[1]);

	var selection = svg.selectAll(".new_rect")
	.data(listDates)
	.join(
		function(enter){
			return enter.append("rect");
		}
		,
		function(update){
			return update;
		},
		function(exit){
			return exit.remove();
		}

	)
	.attr("fill", function(_, i){ return rect_color(listIdx[i]) })
	.attr("stroke", "black")
	.attr("class", "new_rect")
	.attr("x", function(_, i) { return xScale(dataX[i]) })
	.attr("y", function(d, _) { return yScale(0) })
	.attr("width", function(_, i){ return xScale(dataX[i+1]) - xScale(dataX[i])})
	.attr("height", yScale(size) - yScale(0))
	.attr("transform", `translate(${margin.left}, 0)`)
	.lower();

}

function updateGraph(){

	var dataX = dictDeathPerCountry["Date"];
	var dataY = [dictDeathPerCountry[countryHighlighted]];
	var colors = ["#ff0000"];

	countriesDisplayed.forEach(function(country){ 
		if (country != countryHighlighted) {
			dataY.push(dictDeathPerCountry[country]);
			colors.push(["#B9B9B9"]);
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
	.attr("transform", `translate(${margin.left}, 0)`);
	//.raise();  // draw the graph after other things


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
	var yDataValue = dictDeathPerCountry[countryHighlighted][index];
	var yVal = yScale(yDataValue) - 20;
	var textContent = [];

	policiesFilenameList.forEach(function(policy_name){
		idx = 0;
		ldates = dictCountriesPolicies[countryHighlighted][policy_name].list_dates.concat(graphPeriod[1]);
		lidx = dictCountriesPolicies[countryHighlighted][policy_name].list_idx;
		for(var j=0; j< ldates.length; j++){
			if (xDataValue >= ldates[j] && xDataValue <= ldates[j+1]){
				idx = lidx[j];
			}
		}
		if(idx != 0) textContent.push(`${policy_name.split(".")[0]}:${idx}`);
	});

	textContent.push(`Deaths : ${yDataValue}`);
	textContent.push(fomatTimeTooltip(xDataValue));

	dataX = xScale(xDataValue);
	if (dataX == undefined) dataX = xScale(0);
	
	dataY = yScale.range();

	var selection = svg.selectAll(".new_line")
	.data([dataY])
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
	.attr("class", "new_line")
	.attr("stroke", "black")
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return dataX })
		.y(function(d, i) { return dataY[i] })
	)
	.attr("transform", `translate(${margin.left}, 0)`);
	
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
	countryHighlighted = europeanCountries[document.getElementById("selectCountryFirstGraph").value];
	console.log("newCountrySelected DONE");
	update_1st_graph();
}


initSelect(europeanCountries, "selectCountryFirstGraph");


setTimeout(()=>{computePolicies()}, 0)
setTimeout(()=>{computeDeath()}, 0)
setTimeout(()=>{computeMinMax()}, 500)
setTimeout(()=>{update_1st_graph()}, 1000)
