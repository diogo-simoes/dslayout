

$( document ).ready( function () {

});


// Google Maps Config
google.maps.event.addDomListener(window, 'load', init);
var map;
function init() {
	var mapOptions = {
		center: new google.maps.LatLng(38.734500,-9.145100),
		zoom: 13,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
		},
		disableDoubleClickZoom: false,
		mapTypeControl: false,
		scaleControl: false,
		scrollwheel: false,
		panControl: true,
		streetViewControl: false,
		draggable : true,
		overviewMapControl: false,
		overviewMapControlOptions: {
			opened: false,
		},
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    		styles: [
					{"featureType": "all",
						"stylers":[
							{"saturation": 0},
							{"hue": "#e7ecf0"}
						]
					},
					{"featureType": "road",
						"stylers":[
							{"saturation": -70}
						]
					},
					{"featureType": "transit",
						"stylers":[
							{"visibility": "off"}
						]
					},
					{"featureType": "poi",
						"stylers":[
							{"visibility": "off"}
						]
					},
					{"featureType": "water",
						"stylers":[
							{"visibility": "simplified"},
							{"saturation": -60}
						]
					}
				],
	}
	var mapElement = document.getElementById('contacts-map');
	var map = new google.maps.Map(mapElement, mapOptions);
	var locations = [
			['I\'m here!', 'undefined', 'undefined', 'undefined', 'undefined', 38.755953883962974, -9.098895203041138, 'images/mapicon58.png']
	];
	for (i = 0; i < locations.length; i++) {
		if (locations[i][1] =='undefined'){ description ='';} else { description = locations[i][1];}
		if (locations[i][2] =='undefined'){ telephone ='';} else { telephone = locations[i][2];}
		if (locations[i][3] =='undefined'){ email ='';} else { email = locations[i][3];}
		if (locations[i][4] =='undefined'){ web ='';} else { web = locations[i][4];}
		if (locations[i][7] =='undefined'){ markericon ='';} else { markericon = locations[i][7];}
		marker = new google.maps.Marker({
			icon: markericon,
			position: new google.maps.LatLng(locations[i][5], locations[i][6]),
			map: map,
			title: locations[i][0],
			desc: description,
			tel: telephone,
			email: email,
			web: web
		});
		link = '';
		bindInfoWindow(marker, map, locations[i][0], description, telephone, email, web, link);
	}
	function bindInfoWindow(marker, map, title, desc, telephone, email, web, link) {
		var infoWindowVisible = (function () {
			var currentlyVisible = false;
			return function (visible) {
				if (visible !== undefined) {
					currentlyVisible = visible;
				}
				return currentlyVisible;
			};
		}());
		iw = new google.maps.InfoWindow();
		google.maps.event.addListener(marker, 'click', function() {
			if (infoWindowVisible()) {
				iw.close();
				infoWindowVisible(false);
			} else {
				var html= "<div style='color:#000;background-color:#fff;padding:5px;width:60px;'><h4>"+title+"</h4></div>";
				iw = new google.maps.InfoWindow({
					content:html,
					maxWidth: 60
				});
				iw.open(map,marker);
				infoWindowVisible(true);
			}
		});
		google.maps.event.addListener(iw, 'closeclick', function () {
			infoWindowVisible(false);
		});
	}
}