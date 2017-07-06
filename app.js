var jade = require('jade'),
    fs = require('fs'),
    path = require('path'),
    IterateObject = require("iterate-object");

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

console.log('starting');

fs.readFile('src/Jade/Views/partner_template.jade', 'utf8', function (err, data) {
    if (err) throw err;
	var page = JSON.parse(fs.readFileSync('partners.json', 'utf8'));
	page.sort(dynamicSort("sort"));

	var fn = jade.compile(data, {
        filename: path.join(__dirname, '/src/Jade/Templates/Base.jade'),
        pretty:   true
	});

	IterateObject(page, function (value, i, arr) {
		if(arr[i + 1]) {
			var next = arr[i + 1].url;
		} else{
			var next = '';
		}

		if(arr[i - 1]) {
			var prev = arr[i - 1].url;
		} else{
			var prev = '';
		}

		console.log(arr[i].url);

		arr[i].next = next;
		arr[i].prev = prev;

		var html = fn(arr[i]);
		fs.writeFile("dist/partner_"+arr[i].url+".html", html, 'utf8');

	});


	
});