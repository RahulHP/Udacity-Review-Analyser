var monthNames = ["January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"];

function updateGlobalNav(reviewsByProject){
	var totalReviews = 0,
		totalEarned = 0;
	reviewsByProject.forEach(function(d){
		totalReviews += d.count;
		totalEarned += d.total;
	});

	var spnSt = '<span class="text-success">';
    $('.reviewCount').html('Reviews: ' + spnSt + totalReviews + '</span> <span class="caret"></span>')
    $('.moneyCount').html('Earned: ' + spnSt + totalEarned + '</span> <span class="caret"></span>')
	// https://github.com/simplydallas/udacityreviewparser/blob/gh-pages/js/main.js#L271
	var projReview = '';
	var projMoney = '';

	var projPre = '<li><a>';
	var projSuf = '</a></li>';
	reviewsByProject.forEach(function(d){
		projReview += projPre + d.p_name + ': ' + d.count + ' (' + Math.round(d.count / totalReviews * 1000) / 10 + '% )' + projSuf;
		projMoney += projPre + d.p_name + ': ' + d.total + ' (' + Math.round(d.total / totalEarned * 1000) / 10 + '% )' + projSuf;
	})
	//console.log(projReview);
	$('#reviewDD').html(projReview);
	$('#moneyDD').html(projMoney);
}

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

function createCollapsibleTable(reviewsByMonth){
	var container = document.getElementById("graphContainer");
	container.innerHTML += '<table id="collapsibleTable" class="table"></table>';
	document.getElementById("collapsibleTable").innerHTML="";

	var table = document.getElementById("collapsibleTable");

	var header = table.createTHead();

	var row = header.insertRow(0);

	var cell = row.insertCell(0);
	cell.innerHTML = "Year";
	
	var cell = row.insertCell(1);
	cell.innerHTML = "Month";

	var cell = row.insertCell(2);
	cell.innerHTML = "Count";

	var cell = row.insertCell(3);
	cell.innerHTML = "USD";

	reviewsByMonth.forEach(function(d){
		var row = table.insertRow();
		var cell = row.insertCell(0);
		cell.innerHTML = d.key;

		var cell = row.insertCell(1);
		cell.innerHTML = "";

		d.total = d3.sum(d.values, function(v){return v.values.total;});

		d.count = d3.sum(d.values, function(v){return v.values.count;});
		var cell = row.insertCell(2);
		cell.innerHTML = d.count;

		var cell = row.insertCell(3);
		cell.innerHTML = d.total;

		d.values.forEach(function(v){
			var row = table.insertRow();
			var cell = row.insertCell(0);
			cell.innerHTML = "";

			var cell = row.insertCell(1);
			cell.innerHTML = monthNames[+v.key-1];

			var cell = row.insertCell(2);
			cell.innerHTML = v.values.count;

			var cell = row.insertCell(3);
			cell.innerHTML = v.values.total;			
		})
	})
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
function createMonthlyReport(){
	console.log("Monthly");
	document.getElementById("MonthlyReportButton").classList.add("active");
	document.getElementById("AnnualReportButton").classList.remove("active");
	var container = document.getElementById("graphContainer");
	container.innerHTML = '';
	createDatePicker();
	createCurrentMonthDetails(currentMonthReviewsByDate);
}

function createAnnualReport(){
	console.log("Annual");
	document.getElementById("MonthlyReportButton").classList.remove("active");
	document.getElementById("AnnualReportButton").classList.add("active");	
	var container = document.getElementById("graphContainer");
	container.innerHTML = '';
	createCollapsibleTable(reviewsByMonth);
	drawLineChart2(reviewsByDate);
}
function createCurrentMonthDetails(currentMonthReviewsByDate){
	console.log(currentMonthReviewsByDate);
	var container = document.getElementById("graphContainer");

	var Data = [{
		"values":[],
		"key" : "total",
	},{
		"values":[],
		"key" : "count"
	}
	];
	currentMonthReviewsByDate.sort(function(a,b){
		return d3.time.format("%d-%m-%Y").parse(a.key).getTime() - d3.time.format("%d-%m-%Y").parse(b.key).getTime()
	});		
	currentMonthReviewsByDate.forEach(function(d){
		var v =  d3.time.format("%d-%m-%Y").parse(d.key);
		Data[0]['values'].push({y:d.values.total,x:v.getDate()});
		Data[1]['values'].push({y:d.values.count,x:v.getDate()});	
	});

	var curMonth = monthNames[new Date().getMonth()];
	var curYear = 1900 + new Date().getYear();
	container.innerHTML += '<svg height="400px" height="100%" width="100%" id="MonthGraph"></svg>';
	var chart;
    nv.addGraph(function() {
        chart = nv.models.historicalBarChart();
        chart
            .margin({left: 100, bottom: 100})
            .useInteractiveGuideline(true)
            .duration(250)
            .padData(true)
            ;
        chart.interactiveLayer.tooltip
        	.contentGenerator(function(d){
        		return "<p>"+d.value+" "+ curMonth + " "+ curYear +"<br>"+"Reviews: "+d.series[1].value + 
        			"<br>" + "Earned: "+d.series[0].value +  "$</p>";
        	});
        chart.xAxis
            .axisLabel("Date");
        chart.yAxis
            .axisLabel('Earned')
        chart.showXAxis(true);
        d3.select('#MonthGraph')
            .datum(Data)
            .transition()
            .call(chart);
        return chart;
    });	


	
	container.innerHTML += '<table id="dailyTable" class="table"></table>';
	table = document.getElementById("dailyTable");
	//console.log(table);

	var header = table.createTHead();
	var row = header.insertRow(0);
	var cell = row.insertCell(0);
	cell.innerHTML = "Day";

	var cell = row.insertCell(1);
	cell.innerHTML = "Count";

	var cell = row.insertCell(2);
	cell.innerHTML = "Earned";
	
	currentMonthReviewsByDate.forEach(function(d){
		
		var row = table.insertRow();
		var cell = row.insertCell(0);
		var v =  d3.time.format("%d-%m-%Y").parse(d.key);
		cell.innerHTML = v.getDate() + " " + monthNames[v.getMonth()];

		var cell = row.insertCell(1);
		cell.innerHTML = d.values.count;

		var cell = row.insertCell(2);
		cell.innerHTML = d.values.total;
	})


}
function drawLineChart2(reviewsByDate){
		// http://stackoverflow.com/questions/19430561/how-to-sort-a-javascript-array-of-objects-by-date
		reviewsByDate.sort(function(a,b){
			return new Date(a.date).getTime() - new Date(b.date).getTime()
		});		
	var container = document.getElementById("graphContainer");
	container.innerHTML += '<svg height="600px" width="100%" id="linechartHolder"></svg>';
	data = [{
		"values":[],
		"key" : "total",
		"yAxis":1
	},
	/*{
		"values":[],
		"key" : "avg",
		"yAxis":1
	},*/
	{
		"values":[],
		"key" : "count",
		"yAxis":1
	}]
	reviewsByDate.forEach(function(d){
		//console.log(d);
		data[0]['values'].push({"y":d["total"],"x":d["date"]});
		//data[1]['values'].push({"y":d["avg"],"x":d["date"]});
		data[1]['values'].push({"y":d["count"],"x":d["date"]});
	});
	//console.log(data);
	
	nv.addGraph(function() {
    var chart = nv.models.lineWithFocusChart()
    	.height(500)
        .x(function(d) {return d['x'];});//d3.time.format("%Y-%m-%dT%H:%M:%S").parse(d['x']);});

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
		var parseDate = d3.time.format.iso;

		data = [];
		data = reviews.map(function(d)
		{
			price = +d.price;
			//https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
			day = +d3.time.format("%d")((parseDate.parse(d.completed_at)));
			month = +d3.time.format("%m")((parseDate.parse(d.completed_at)));
			year = +d3.time.format("%Y")((parseDate.parse(d.completed_at)));
			completed_at = new Date(d.completed_at);
			p_id = +d.project_id;
			p_name = d.project.name;
			//console.log("day: ",date);
			return {"day":day, "month":month, "completed_at":completed_at, "year":year, "price":price, 'p_id':p_id, 'p_name':p_name};
		});

		earliestReviewDate = new Date( Math.min.apply(null, data.map(function(d){return d.completed_at.getTime();})));
		console.log(earliestReviewDate);

		latestReviewDate = new Date( Math.max.apply(null, data.map(function(d){return d.completed_at.getTime();})));
		console.log(latestReviewDate);
		
		//console.log(new Date(earliestReviewDate).getDate());
		//console.log(new Date(latestReviewDate).getDate());
		//http://learnjsdata.com/group_data.html
		reviewsByMonth = d3.nest()
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

		//console.log(reviewsByMonth);
		
		reviewsByDate = d3.nest()
			.key(function(d) {return d3.time.format("%d-%m-%Y")((parseDate.parse(d.completed_at)));})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);
		//console.log(reviewsByDate);

		// http://stackoverflow.com/questions/19430561/how-to-sort-a-javascript-array-of-objects-by-date
		reviewsByDate.sort(function(a,b){
			return new Date(a.date).getTime() - new Date(b.date).getTime()
		});		
		var parseDate = d3.time.format("%d-%m-%Y").parse;
		currentMonthReviewsByDate = reviewsByDate.filter(function(d){
			return parseDate(d.key).getMonth() == new Date().getMonth();
		});

		//console.log(currentMonthReviewsByDate);
		//createCurrentMonthDetails(currentMonthReviewsByDate);
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
		updateGlobalNav(reviewsByProject);
    	// https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
    	
		reviewsByDate.forEach(function(d){
			d.date = parseDate(d.key);
			d.total = +d.values.total;
			d.count = +d.values.count;
			d.avg = +d.values.avg;
		});
		//createDatePicker();
		createMonthlyReport(currentMonthReviewsByDate);
		//createCurrentMonthDetails(currentMonthReviewsByDate);
		//console.log(reviewsByDate);
		//createCollapsibleTable(reviewsByMonth);
		//drawPieChart(reviewsByProject);
		//createMonthTable(reviewsByMonth);
		//createYearTable(reviewsByYear);
		//drawLineChart2(reviewsByDate);
}

function createDatePicker(){
	var container = document.getElementById("graphContainer");
	container.innerHTML += '<div class="input-group date" id="MonthPicker"><input type="text" class="form-control"><span class="input-group-addon"><i class="glyphicon glyphicon-th"></i></span></div>'
	// https://bootstrap-datepicker.readthedocs.io/en/stable/options.html
	$(function() {
  		$('#MonthPicker').datepicker({
  			format: "MM yyyy",
		    startView: 1,
		    minViewMode: 1,
		    maxViewMode: 2,
		    todayBtn: "linked",
		    orientation: "bottom left",
		    autoclose : true,
		    startDate : earliestReviewDate,
		    endDate : latestReviewDate,
  		}).on('changeDate', function(e){
  			console.log(e);
  			alert(e.date);
  		});
  		
	});
}


function init(reviews){
	prepareData(reviews);
}