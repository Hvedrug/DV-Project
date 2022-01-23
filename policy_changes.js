const european_countries = ['Albania', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom'];
const list_filenames = ["covid-19-testing-policy.csv", "covid-vaccination-policy.csv", "face-covering-policies-covid.csv", "income-support-covid.csv", "public-campaigns-covid.csv", "public-events-covid.csv", "public-transport-covid.csv", "school-closures-covid.csv", "stay-at-home-covid.csv"];
const file_folder_prefix = "data/";
const dict_filename_to_column = {
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

european_countries.forEach(function(country){
	dictCountriesPolicies[country] = {};

	list_filenames.forEach(function(policy){
		dictCountriesPolicies[country][policy] = {last_idx:-1, list_dates:[], list_idx:[]};
	})
})


var allDataDict;
var tab = [];
var compt = 0;

function maj(){

	compt = 0;
	allDataDict = [];
	data_filtered = [];

	list_filenames.forEach(function(policy_filename){  // for each policy filename

		d3.csv(file_folder_prefix+policy_filename).then(function(data) {

			data.map(function(line){  // for each line

				european_countries.forEach(function(country_name){  // for each country
				
					if(line["Entity"] == country_name){
						policy_idx = parseInt(line[dict_filename_to_column[policy_filename]]);
						date = line["Day"];

						dictCountry = dictCountriesPolicies[country_name][policy_filename];
						if (dictCountry.last_idx != policy_idx){
							dictCountry.last_idx = policy_idx;
							dictCountry.list_dates.push(date);
							dictCountry.list_idx.push(policy_idx);
						}
						compt += 1;
					}
				});
			});
		});
	});
	console.log(dictCountriesPolicies);
}

var t1 = new Date().getTime();
maj();
console.log(new Date().getTime() - t1 );