function init(reviews){

	console.log("Initialising");
	var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

    // Basic CSV Parsing http://bl.ocks.org/d3noob/b3ff6ae1c120eea654b5



	var formatTime = d3.time.format("%e %B");

    var x = d3.time.scale().range([0, width]);
	var y = d3.scale.linear().range([height, 0]);

	var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

	var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

	// Define the line
	var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.total);});

    var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

	var div = d3.select("body").append("div")	
    					.attr("class", "tooltip")				
    					.style("opacity", 0);

	//var dataset=d3.csv.parse("parsed.csv");

	// http://bl.ocks.org/enjalot/1525346

		//console.log("reviews:",reviews);
		console.log("Review:",reviews[0]);
		var parseDate = d3.time.format.iso;
		var data = [];
		data = reviews.map(function(d)
		{
			price = +d.price;
			//https://github.com/d3/d3-3.x-api-reference/blob/master/Time-Formatting.md
			day = +d3.time.format("%d")((parseDate.parse(d.completed_at)));
			month = +d3.time.format("%m")((parseDate.parse(d.completed_at)));
			year = +d3.time.format("%Y")((parseDate.parse(d.completed_at)));
			completed_at = d.completed_at
			p_id = +d.project_id;
			//console.log("day: ",date);
			return {"day":day, "month":month, "completed_at":completed_at, "year":year, "price":price, 'p_id':price};
		})
		
		console.log("data",data);
		
		// http://learnjsdata.com/group_data.html
		//var reviewsByMonth = d3.nest()
		//	.key(function(d) {return d.month;})
		//	.rollup(function(v) {return {
		//		count : v.length,
		//		total : d3.sum(v, function(d){return d.price;}),
		//		avg : d3.mean(v, function(d){return d.price;})
		//	}; })
		//	.entries(data);
		
		//console.log(reviewsByMonth);
		
		var reviewsByDate = d3.nest()
			.key(function(d) {return d3.time.format("%d-%m-%Y")((parseDate.parse(d.completed_at)));})
			.rollup(function(v) {return {
				count : v.length,
				total : d3.sum(v, function(d){return d.price;}),
				avg : d3.mean(v, function(d){return d.price;})
			}; })
			.entries(data);

		console.log(reviewsByDate);
		
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

		x.domain(d3.extent(reviewsByDate, function(d) { return d.date; }));
		y.domain([0, d3.max(reviewsByDate, function(d) { return d.total; })]);

		console.log(reviewsByDate);
		svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(reviewsByDate));

        svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

            svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);


    svg.selectAll("dot")
        .data(reviewsByDate)
      .enter().append("circle")
        .attr("r", 3)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.total); })
        .on("mouseover", function(d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(formatTime(new Date(d.date)) + "<br/>"  + "Total : " + d.total + "$<br/>"  + "Reviews : " + d.count)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
            })
        ;        
	
}