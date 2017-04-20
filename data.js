function refresh(token){
	console.log(token);
	// https://github.com/simplydallas/udacityreviewparser/blob/gh-pages/js/main.js#L313

	// Using .getJSON for debugging purposes. .ajax will be used for production
	$.getJSON("local.json",function(response){
		if(isJson(response)){
				console.log("Good JSON");
				//console.log(response);
				return response;
			} else {
				console.log("Bad JSON");
			}
	})

	// http://stackoverflow.com/questions/6792878/jquery-ajax-error-function
	/*$.ajax({method: 'GET',
		url: 'https://review-api.udacity.com/api/v1/me/submissions/completed.json',
		data: {start_date : 0 },
		headers: {Authorization: token},
		success: function(response){
			if(isJson(response)){
				console.log("Good JSON");
				console.log(response);
				return response;
			} else {
				console.log("Bad JSON");
			}
		},

		error: function(response){
			console.log(response);
		}
	})*/
}

// https://github.com/simplydallas/udacityreviewparser/blob/gh-pages/js/main.js#L855
function isJson(item) {
    item = typeof item !== "string" ?
        JSON.stringify(item) :
        item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if ($.type(item) === "array" && item != null) {
      if (item[0].udacity_key !== undefined) {
        return true;
      }
    }
    //else {
      //debug("invalid JSON tested (probably empty)");
    //}

    return false;
}