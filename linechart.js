function drawPieChart(reviewsByProject){
	
	var height = 350;
    var width = 350;
    console.log(reviewsByProject);
    nv.addGraph(function() {
        var chart = nv.models.pieChart()
            .x(function(d) {  return d.p_name })
            .y(function(d) { return d.total })
            .growOnHover(true)
            .color(d3.scale.category10().range())
            .labelType('percent')
            .legendPosition('top')
            .showTooltipPercent(true)
            .width(width)
            .height(height);

        d3.select("#piechartHolder")
            .datum(reviewsByProject)
            .transition().duration(1200)
            .attr('width', width)
            .attr('height', height)
            .call(chart);


        return chart;
    });

}

function createYearTable(reviewsByYear){
	var table = document.getElementById("yearlyTable");
	var header = table.createTHead();

	var row = header.insertRow(0);
	var cell = row.insertCell(0);
	cell.innerHTML = "Year";

	var cell = row.insertCell(1);
	cell.innerHTML = "USD";

	reviewsByYear.forEach(function(d){
		var row = table.insertRow();
		var cell = row.insertCell(0);
		cell.innerHTML = +d.key;

		var cell = row.insertCell(1);
		cell.innerHTML = +d.values.total;
	})
};


function createMonthTable(reviewsByMonth){
	var monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];
	var table = document.getElementById("monthlyTable");

	var header = table.createTHead();

	var row = header.insertRow(0);

	var cell = row.insertCell(0);
	cell.innerHTML = "Month";

	var cell = row.insertCell(1);
	cell.innerHTML = "Year";

	var cell = row.insertCell(2);
	cell.innerHTML = "USD";

	reviewsByMonth.forEach(function(d){
		
		d.values.forEach(function (i){
			var row = table.insertRow();
			console.log(i);

			var cell = row.insertCell(0);
			cell.innerHTML = monthNames[+i.key];

			var cell = row.insertCell(1);
			cell.innerHTML = +d.key;
			var cell = row.insertCell(2);
			cell.innerHTML = +i.values.total + " $"

		})
		




	})
}

function drawLineChart2(reviewsByDate){
	console.log("Initialising");
	console.log(reviewsByDate);
	data = [{
		"values":[],
		"key" : "total",
		"yAxis":1
	},
	{
		"values":[],
		"key" : "avg",
		"yAxis":1
	},
	{
		"values":[],
		"key" : "count",
		"yAxis":1
	}]
	reviewsByDate.forEach(function(d){
		//console.log(d);
		data[0]['values'].push({"y":d["total"],"x":d["date"]});
		data[1]['values'].push({"y":d["avg"],"x":d["date"]});
		data[2]['values'].push({"y":d["count"],"x":d["date"]});
	});
	console.log(data);
	
	nv.addGraph(function() {
    var chart = nv.models.lineWithFocusChart()
    	.height(500)
        .x(function(d) {console.log(d);return d['x'];});//d3.time.format("%Y-%m-%dT%H:%M:%S").parse(d['x']);});

    chart.yAxis
    .tickFormat(d3.format(',.2f'));

    chart.y2Axis
    .tickFormat(d3.format(',.2f'));

    chart.xAxis
    .tickFormat(function(d) { return d3.time.format('%d %b %Y')(new Date(d)) });

    chart.x2Axis
    .tickFormat(function(d) { return d3.time.format('%d %b %Y')(new Date(d)) });
    
    d3.select('#linechartHolder')
    .datum(data)
    .transition().duration(500)
    .call(chart);
    
    return chart;
	});

}

function prepareData(reviews){
		//console.log(reviews);
		var parseDate = d3.time.format.iso;
		data = [];
		data = reviews.map(function(d)
		{
			price = +d.price;
			//https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
			day = +d3.time.format("%d")((parseDate.parse(d.completed_at)));
			month = +d3.time.format("%m")((parseDate.parse(d.completed_at)));
			year = +d3.time.format("%Y")((parseDate.parse(d.completed_at)));
			completed_at = d.completed_at
			p_id = +d.project_id;
			p_name = d.project.name;
			//console.log("day: ",date);
			return {"day":day, "month":month, "completed_at":completed_at, "year":year, "price":price, 'p_id':p_id, 'p_name':p_name};
		})
		
		console.log("data",data);
		
		//http://learnjsdata.com/group_data.html
		var reviewsByMonth = d3.nest()
			.key(function(d) {return d.year;})
			.key(function(d) {return d.month;})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);
		
		var reviewsByYear = d3.nest()
			.key(function(d) {return d.year;})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);

		console.log(reviewsByMonth);
		
		reviewsByDate = d3.nest()
			.key(function(d) {return d3.time.format("%d-%m-%Y")((parseDate.parse(d.completed_at)));})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);

		//console.log(reviewsByDate);
		
		reviewsByProject = d3.nest()
			.key(function(d) {return d.p_id})
			.key(function(d) {return d.p_name})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);

		//console.log(reviewsByProject);

		reviewsByProject.forEach(function(d){
			d.p_id = d.key;
			d.p_name = d.values[0].key;
			d.total = d.values[0].values.total;
			d.count = d.values[0].values.count;
			d.avg = d.values[0].values.avg;
		});

		//console.log(reviewsByProject);


    	// https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
    	var parseDate = d3.time.format("%d-%m-%Y").parse;
		reviewsByDate.forEach(function(d){
			d.date = parseDate(d.key);
			d.total = +d.values.total;
			d.count = +d.values.count;
			d.avg = +d.values.avg;
		});
		
		// http://stackoverflow.com/questions/19430561/how-to-sort-a-javascript-array-of-objects-by-date
		reviewsByDate.sort(function(a,b){
			return new Date(a.date).getTime() - new Date(b.date).getTime()
		});	
		//console.log(reviewsByDate);
		drawPieChart(reviewsByProject);
		createMonthTable(reviewsByMonth);
		createYearTable(reviewsByYear);
		drawLineChart2(reviewsByDate);
}


function init(reviews){
	prepareData(reviews);
}