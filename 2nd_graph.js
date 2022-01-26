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
var g2_countryHighlightedDateBegin;
var g2_graphPeriod = [0, 30];  // period of the values 
const g2_fomatTimeTooltip = d3.timeFormat("%A %d %b %Y");
const g2_graphColors = ["#FF6D00", "#FF6E40", "#64FFDA", "#448AFF", "#E040FB"];



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
var countriesDisplayed = ["France", "Germany", "United Kingdom", "Italy", "Spain"]; //JSON.parse(JSON.stringify(europeanCountries)); // deep copy
var countryHighlighted = "France";

var policySelected = "stay-at-home-covid.csv";
var policyLevelSelected = 2;
var nbDays = 723; //TODO: de-hardcode it



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


// Set the dimensions and margins of the graph
const g2_svg_size = {width:1300, height:600};
const margin = {top: 120, right: 50, bottom: 0, left: 40},
width = g2_svg_size.width - margin.left - margin.right,
height = g2_svg_size.height - margin.top - margin.bottom;


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
	.text("Application of policy \""+ policySelected + "\" lvl "+ policyLevelSelected + " in " + countryHighlighted);



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
const g2_svg = graph.append("svg")
	.attr("width", g2_svg_size.width+margin.left)
	.attr("height", g2_svg_size.height+margin.top)
	.on("pointerenter pointermove", pointermoved)
	.on("pointerleave", pointerleft);


g2_svg.append("g")
	.attr("transform", `translate(${margin.left}, ${g2_svg_size.height})`)
	.attr("class", "xaxis")
	.call(g2_Xaxis);


g2_svg.append("g")
	.attr("transform", `translate(${margin.left},0)`)
	.attr("class", "yaxis")
	.call(g2_Yaxis);

const g2_tooltip = g2_svg.append("g")
	.style("pointer-events", "none");


// FUNCTIONS


function update_2nd_graph(){

	var selectionMaxY = [];

	var dataY = [];
	var isDone = false;

	var tempY;
	var dateLevel = -1;

	[countryHighlighted].concat(countriesDisplayed).forEach(function(country_name){

		tempY = [];
		listIndexes = dictCountriesPolicies[country_name][policySelected].list_idx;
		listDates = dictCountriesPolicies[country_name][policySelected].list_dates;
		
		
		for(var j = listIndexes.length -1; j>= 0; j--){
			if(listIndexes[j] === policyLevelSelected){
				dateLevel = listDates[j];
			}
		}
		
		if(dateLevel != -1){

			idx_day1 = dictDeathPerCountry["Date"].findIndex(function(elt){
				return elt.getTime() === dateLevel.getTime();
			})


			if( (country_name === countryHighlighted && !isDone) || country_name !== countryHighlighted){
				for(var j=idx_day1; j<idx_day1+31; j++){
					tempY.push(dictDeathPerCountry[country_name][j]);
					selectionMaxY.push(dictDeathPerCountry[country_name][j]);
					if(country_name === countryHighlighted && !isDone){
						g2_countryHighlightedDateBegin = idx_day1;
					}
				}
				dataY.push(tempY);
			}
		}else{
			alert(country_name + " does not have a level " + policyLevelSelected + " for the selected policy !");
		}

		if(country_name === countryHighlighted) isDone = true;


		

	});

	var datay = [0, Math.max(...selectionMaxY)];

	updateAxis([], datay);
	update2ndGraph(dataY);

}



function update2ndGraph(dataY){


	console.log(dataY);


	var selection = g2_svg.selectAll(".g2_new_path")
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
	.attr("class", "g2_new_path")
	.attr("stroke-width", function(_, i){if(i==0) return 2; return 1})
	.attr("stroke", function(_, i){ return g2_graphColors[i] })
	.attr("d", d3.line()
		.curve(d3.curveLinear)
		.x(function(_, i) { return g2_xScale(i) })
		.y(function(d, _) { return g2_yScale(d) })
	)
	.attr("transform", `translate(${margin.left}, 0)`);

}

function updateAxis(dataX, dataY){

	if (dataX.length != 0){
		g2_xScale.domain(dataX);
		g2_svg.selectAll("g.xaxis")
			.call(d3.axisBottom(g2_xScale));
		console.log("g2_Xaxis updated with values : ", dataX);
	}

	if (dataY.length != 0){
		//dataY[0] = 0;
		g2_yScale.domain(dataY);
		g2_svg.selectAll("g.yaxis")
			.call(d3.axisLeft(g2_yScale));
		console.log("g2_Yaxis updated with values : ", dataY);
	}
}


function pointermoved(event){

	var coords = d3.pointer(event);  // coords of the mouse
	var mouseX = coords[0];
	var mouseY = coords[1];

	var xVal = mouseX - margin.left;
	var index = parseInt((mouseX-margin.left) * 30/g2_svg_size.width);
	var xDataValue = dictDeathPerCountry["Date"][g2_countryHighlightedDateBegin+index];
	var yDataValue = dictDeathPerCountry[countryHighlighted][g2_countryHighlightedDateBegin+index];
	var yVal = g2_yScale(yDataValue) - 20;
	var textContent = [];


	textContent.push(`Deaths : ${yDataValue}`);
	textContent.push(g2_fomatTimeTooltip(xDataValue));

	g2_tooltip.style("display", null);

	const path = g2_tooltip.selectAll("path")
		.data([,])
		.join("path")
			.attr("fill", "#e2e2e2")
			.attr("stroke", "black");

	if(yVal === yVal){  // if yVal is not NaN

		const text = g2_tooltip.selectAll("text")
			.data([,]) //textContent)
			.join("text")
			.call(text => text
				.selectAll("tspan")
				.data(textContent)
				.join("tspan")
					//.attr("x", mouseX)
					.attr("y", (_, i) => `${yVal - i * 20}`)
					.text(d => d));

		g2_tooltip.raise();
		const {x, y, width: w, height: h} = text.node().getBBox();

		text.selectAll("tspan").attr("x", mouseX - w / 2)

		path.attr("d", createPath(mouseX, yVal, w, h));
	}
	
}

function createPath(x, y, w, h, lim){
	// TODO add boundaries parameter to prevent the tooltip to be too far left or too far right
	/**
	xmax = Math.min(x + w / 2 + 10, lim[0]);
	xmin = Math.max(x - w / 2 - 10, lim[1]);
	ymax = Math.min(y + 10, lim[2]);
	ymin = Math.max(y - h / 2 - 20, lim[3]);
	**/
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

function pointerleft(){
	g2_tooltip.style("display", "none");
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
	update_2nd_graph();
}


initSelect(europeanCountries, "selectCountryFirstGraph");


setTimeout(()=>{computeDeath()}, 0)
setTimeout(()=>{computePolicies()}, 0)
setTimeout(()=>{update_2nd_graph()}, 1000)
