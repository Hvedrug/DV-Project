var color1 = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
var darkModeValue = 1; //used for true
const margin = {top: 10, right: 30, bottom: 30, left: 60};
const width = 800;
const height = 400;
const widthReduced = width - margin.left - margin.right;
const heightReduced = height - margin.top - margin.bottom;
const countriesEurope = ['Albania', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom']
const governmentPolicies = ["testing_policy","vaccination_policy","facial_coverings","income_support","public_information_campaigns","cancel_public_events","close_public_transport","school_closures","stay_home_requirements"];
const covidFactors = ["Daily new Covid cases", "Daily number of death", "Number of people in public spaces", "Number of people in public transport", "Number of people in work places", "Number of people in grocery stores", "Number of people in non essential stores"]
var parameter = {country: 11, policy: 2, factor: 0};
var dictData=[];
var XScale;
var YScale;
var startDate = ["2020-06-22","2020-05-11","2020-03-17", "2020-10-17"];
var extractedData = [];

// append the svg object to the body of the page
const svg = d3.select("#third-graph")
.append("svg")
.attr("viewBox", `0 0 `+width +` `+height)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);


function darkMode(){
  if (darkModeValue==1){
    darkModeValue=0;
    document.documentElement.style.setProperty('--body-bg-color', '#F5F5F5');
    document.documentElement.style.setProperty('--card-bg-color', '#E5E5E5');
    document.documentElement.style.setProperty('--select-bg-color', '#D5D5D5');
    document.documentElement.style.setProperty('--divider-color', '#C5C5C5');
    document.documentElement.style.setProperty('--text-color', '#212121');
    document.documentElement.style.setProperty('--title-color-bright', '#01579B');
    document.documentElement.style.setProperty('--title-color-muted', '#039BE5');
    color1 = '#212121';
  }else{
    darkModeValue=1;
    document.documentElement.style.setProperty('--body-bg-color', '#121212');
    document.documentElement.style.setProperty('--card-bg-color', '#202020');
    document.documentElement.style.setProperty('--select-bg-color', '#323232');
    document.documentElement.style.setProperty('--divider-color', '#484848');
    document.documentElement.style.setProperty('--text-color', '#E1F5FE');
    document.documentElement.style.setProperty('--title-color-bright', '#039BE5'); 
    document.documentElement.style.setProperty('--title-color-muted', '#4FC3F7');
    color1 = '#E1F5FE';
  }
  updateALL(extractedData);
}




// load the first set of data when load page
window.onload = function() {
  darkMode()
  initSelect(countriesEurope, "selectCountry", parameter["country"]);
  initSelect(governmentPolicies, "selectPolicy", parameter["policy"]);
  initSelect(covidFactors, "selectFactor", parameter["factor"]);
  initSelect(countriesEurope, "selectGraph3", 1);
  initPage('data/new_deaths_per_million.csv');
};
  








function initPage(src){
  for (i=0; i<countriesEurope.length; i++){
    dictData[i] = [];
  }
  // Add X axis 
  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${height})`)
  .attr('stroke', color1);
  // Add Y axis
  svg.append("g")
  .attr("class", "y axis")
  .attr('stroke', color1);
  svg.append("g")
  .attr("class", "rect");

  getData(src, dictData).then(function(){
    extractedData = extractData(startDate, dictData[parameter['country']], 'red', extractedData);
    updateALL(extractedData);
  });
}


function updateALL(graphData) {
  
  // maj X axis 
  XScale = d3.scaleLinear()
  .domain([0, (startDate.length * 30)])
  .range([ 0, widthReduced ]);
  svg.selectAll("g.x.axis")
  .attr("transform", `translate(0, ${heightReduced})`)
  .attr('stroke', color1)
  .call(d3.axisBottom(XScale));

  // maj Y axis
  YScale = d3.scaleLinear()
  .domain([getMin(graphData), getMax(graphData)])
  .range([heightReduced, 0 ]);
  svg.selectAll("g.y.axis")
  .attr('stroke', color1)
  .call(d3.axisLeft(YScale));

  var selection = svg.selectAll(".new_path")
  .data(graphData)
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
  .attr("stroke", function(d){return d[0][3]})
  .attr("d", d3.line()
    .curve(d3.curveLinear)
    .x(function(d) { return XScale(d[0]) })
    .y(function(d) { return YScale(d[1]) })
  )
  .lower();

  for (i=0; i<graphData.length; i++){
    svg.append('line')
      .attr('x1', XScale((i+1)*30))
      .attr('y1', 0)
      .attr('x2', XScale((i+1)*30))
      .attr('y2', heightReduced)
      .attr('stroke', color1)
      .style("stroke-width", 1);
  }

}
 











// function that get the data from source file (mySRC)
// parse all data and put it in the output variable (myOUT)
function getData(mySRC, myOUT){
  return d3.csv(mySRC,
    // When reading the csv, I must format variables:
    function(d){
      var temp;
      date = new Date(d["date"]);
      for (var j = 0; j < countriesEurope.length; j++){
        temp = parseFloat(d[countriesEurope[j]]);
        if (temp !== temp){
          temp = 0;
        }
        myOUT[j].push([date,temp]);
        temp=0;
      }});  
} 

// function that take a liste of string containing dates "listDate"
// an array of data contained in the file "countryData" probably a sub array of dictData
// and retrun an output variable "out"
function extractData(listDate, countryData, color, myOUT){
  var currentMyOUTlength = myOUT.length;
  for (q=0; q<listDate.length; q++){
    myOUT.push([]);
  }
  //for each date in the list
  for (d=0; d<listDate.length; d++){
    //console.log(d+currentMyOUTlength);
    //get the indice in the data where we want to start plotting (date of implementatio of the policy)
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
      myOUT[d+currentMyOUTlength].push(
        [
          30*d+j, 
          100*(countryData[indice+j][1]-countryData[indice][1])/(countryData[indice][1]+1), 
          countryData[indice+j][0],
          color
        ]);
    }
  }
  return myOUT;
}

















// Functions to initiate and handle the html "select" elements ||||||||||||||||||||||||||

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

// change values of the parameters when select value changes
function selectOnChange(selectID){
  if (selectID=="selectCountry"){
    parameter['country'] = document.getElementById(selectID).value;
  }if (selectID=="selectPolicy"){
    parameter['policy'] = document.getElementById(selectID).value;
  }if (selectID=="selectFactor"){
    parameter['factor'] = document.getElementById(selectID).value;
  }console.log("parameters : " +parameter['country'] +' '+ parameter['policy'] +' '+ parameter['factor'])

  extractedData = [];
  extractedData = extractData(startDate, dictData[parameter['country']], "red", extractedData);
  updateALL(extractedData);
}

// Add a country to the Graph 3 to compare with the first one
function selectOnChangeG3(selectID){
  extractedData = [];
  extractedData = extractData(startDate, dictData[parameter['country']], "red", extractedData);
  extractedData = extractData(startDate, dictData[document.getElementById(selectID).value], color1, extractedData);
  updateALL(extractedData);
}


//MATH FUNCTIONS |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

// 2D matrix transpose
function transpose(array2D){
  return array2D[0].map((_, colIndex) => array2D.map(row => row[colIndex]));
}

// min of a 3D matrix only on the 2nd element the 3rd dim 
// ie : min for all row, for all col, for all 2nd elem
function getMin(arrayData){
  var temp = [];
  for (i=0; i<arrayData.length; i++){
    temp.push(Math.min(...transpose(arrayData[i])[1]));
  }
  return Math.min(...temp);
}

// max of a 3D matrix only on the 2nd element the 3rd dim 
// ie : max for all row, for all col, for all 2nd elem
function getMax(arrayData){
  var temp = [];
  for (i=0; i<arrayData.length; i++){
    temp.push(Math.max(...transpose(arrayData[i])[1]));
  }
  return Math.max(...temp);
}






