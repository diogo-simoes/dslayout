
$( document ).ready( function () {

	var officialEmail = "hello@diogosimoes.com";

	var i18n = new I18n();

	$('body').hide();
	setTimeout( function () {
		$('body').show("fade", 400);
		gmap_init();
	}, 200);

	$( window ).on('scroll', function () {
		var yPos = window.pageYOffset;
		if (yPos > 200 && !$('#static-title-bar').is(':visible')) {
			$('#static-title-bar').slideDown(200);
		}
		if (yPos < 200 && $('#static-title-bar').is(':visible')) {
			$('#static-title-bar').hide();
		}
		$('.i18n-menu').hide();
	});

	$('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 1000);
				return false;
			}
		}
	});

	$('.menu-item-lang').click( function () {
		if ($('.i18n-menu').is(':visible')) {
			$('.i18n-menu').hide();
		} else {
			$('.i18n-menu').slideDown(100);
		}
	});

	$('.language-item').click( function () {
		$('.language-item').removeClass('picked-lang');
		if ($(this).hasClass('portuguese')) {
			$('.portuguese').addClass('picked-lang');
			i18n.lang('pt');
		} else if ($(this).hasClass('english')) {
			$('.english').addClass('picked-lang');
			i18n.lang('en');
		} else if ($(this).hasClass('greek')) {
			$('.greek').addClass('picked-lang');
			i18n.lang('gr');
		}
	});

	var changeContactsPanelContent = function (activeId, phase) {
		if ($('#'+activeId).hasClass('active')) {
			return;
		}
		$('.contacts-menu').removeClass('active');
		$('#'+activeId).addClass('active');
		$('.contacts-panel').animate({'margin-left': phase});
	};

	$('#profile-menu').click( function () {
		changeContactsPanelContent('profile-menu',0);
	});

	$('#email-menu').click( function () {
		changeContactsPanelContent('email-menu',-400);
	});

	$('#social-media-menu').click( function () {
		changeContactsPanelContent('social-media-menu',-800);
	});

	$('#name-textfield').on('focus', function () {
		$(this).removeClass('contact-textfield-validated');
	});

	$('#email-textfield').on('focus', function () {
		$(this).removeClass('contact-textfield-validated');
	});

	var validateForm = function () {
		if (!$('#name-textfield').val()) {
			$('#name-textfield').attr('data-i18n-placeholder','contacts.emailform.name-validator');
			i18n.localize();
			$('#name-textfield').addClass('contact-textfield-validated');
		}

		var emailPattern = /^[^\.@]+([.][^\.@]+)*[@][^\.@]+([.][^\.@]+)+$/;

		if (!$('#email-textfield').val() || !emailPattern.test($('#email-textfield').val().trim())) {
			$('#email-textfield').val("");
			$('#email-textfield').attr('data-i18n-placeholder','contacts.emailform.email-validator');
			i18n.localize();
			$('#email-textfield').addClass('contact-textfield-validated');
		}
		return $('#name-textfield').val() && $('#email-textfield').val() && emailPattern.test($('#email-textfield').val().trim());
	}

	$('#contact-submit').on('click', function () {
		if (!validateForm()) {
			return false;
		}
		$(this).attr('disabled', 'disabled');
		$(this).attr('data-i18n-value','contacts.emailform.sending');
		i18n.localize();
		var name = $('#name-textfield').val();
		var email = $('#email-textfield').val();
		var timestamp = (new Date()).toUTCString();
		var subject = $('#subject-textfield').val();
		var message = $('#contact-textarea').val();
		$.ajax({
			method: 'POST',
			url: 'http://localhost:8080/mailservice',
			data: JSON.stringify({'name': name, 'email': email, 'timestamp': timestamp, 'subject': subject, 'message': message}),
			dataType: 'json'
		}).done( function (msg) {
			$('#contact-form').slideUp();
			$('.email-success').slideDown();
		}).fail( function (msg) {
			$('#send-email-manually').attr('href', "mailto:" + officialEmail + 
				"?subject=" + subject +
				"&body=" + message);
			$('#contact-form').slideUp();
			$('.email-error').slideDown();
		}).always( function (msg) {
			$('#contact-submit').removeAttr('disabled');
			$('#contact-submit').attr('data-i18n-value','contacts.emailform.sendbutton');
			i18n.localize();
		});
		return false;
	});

	$('#email-success-write-again').on('click', function () {
		$('#contact-form')[0].reset();
		$('.email-success').hide();
		$('#contact-form').slideDown();
	});

	$('#send-email-manually').on('click', function () {
		$('#contact-form')[0].reset();
		$('.email-error').hide();
		$('#contact-form').slideDown();
	});
	$('#email-error-try-again').on('click', function () {
		$('.email-error').hide();
		$('#contact-form').slideDown();
	});
});

window.I18n = function (defaultLang) {
	var lang = defaultLang || 'en';
	this.language = lang;

	(function (i18n) {
		$.getJSON('localized-content.json', function (json) {
			i18n.contents = json;
			i18n.contents.prop = function (key) {
				var result = this;
				var keyArr = key.split('.');
				for (var index = 0; index < keyArr.length; index++) {
					var prop = keyArr[index];
					result = result[prop];
				}
				return result;
			};
			i18n.localize();
		});
	})(this);
};

window.I18n.prototype.hasCachedContents = function () {
	return this.contents !== undefined;
};

window.I18n.prototype.lang = function (lang) {
	if (typeof lang === 'string') {
		this.language = lang;
	}
	this.localize();
	return this.language;
};

window.I18n.prototype.localize = function () {
	var contents = this.contents;
	if (!this.hasCachedContents()) {
		return;
	}
	var dfs = function (node, keys, results) {
		var isLeaf = function (node) {
			for (var prop in node) {
				if (node.hasOwnProperty(prop)) {
					if (typeof node[prop] === 'string') {
						return true;
					}
				}
			}
		}
		for (var prop in node) {
			if (node.hasOwnProperty(prop) && typeof node[prop] === 'object') {
				var myKey = keys.slice();
				myKey.push(prop);
				if (isLeaf(node[prop])) {
					//results.push(myKey.reduce((prev, current) => prev + '.' + current));	//not supported in older mobile broweser
					results.push(myKey.reduce( function (previousValue, currentValue, currentIndex, array) {
						return previousValue + '.' + currentValue;
					}));
				} else {
					dfs(node[prop], myKey, results);
				}
			}
		}
		return results;
	};
	var keys = dfs(contents, [], []);
	for (var index = 0; index < keys.length; index++) {
		var key = keys[index];
		if (contents.prop(key).hasOwnProperty(this.language)) {
			$('[data-i18n="'+key+'"]').text(contents.prop(key)[this.language]);
			$('[data-i18n-placeholder="'+key+'"]').attr('placeholder', contents.prop(key)[this.language]);
			$('[data-i18n-value="'+key+'"]').attr('value', contents.prop(key)[this.language]);
		} else {
			$('[data-i18n="'+key+'"]').text(contents.prop(key)['en']);
			$('[data-i18n-placeholder="'+key+'"]').attr('placeholder', contents.prop(key)['en']);
			$('[data-i18n-value="'+key+'"]').attr('value', contents.prop(key)['en']);
		}
	}
};

// Google Maps Config
//google.maps.event.addDomListener(window, 'load', init);
var map;
function gmap_init() {
	var mapOptions = {
		center: new google.maps.LatLng(38.71300,-9.195500),
		zoom: 12,
		zoomControl: false,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
		},
		disableDoubleClickZoom: false,
		mapTypeControl: false,
		scaleControl: false,
		scrollwheel: false,
		panControl: false,
		streetViewControl: false,
		draggable : false,
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
			['I\'m here!', 'undefined', 'undefined', 'undefined', 'undefined', 38.725953883962974, -9.138895203041138, 'images/mapicon58.png']
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
		/*
		 * Uncomment this if you want the info window to show
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
		*/
	}
}