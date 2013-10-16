'use strict';
var baseUrl = 'http://pedesorange.rapapp.com/api/', isDebugEnabled = true;
var fileUploadUrl = 'http://pedesorange.rapapp.com/service/aservice';
//var baseUrl = 'http://localhost:8888/api/', isDebugEnabled = true;
(function (w) {
	var d = w.document,
	script = d.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapOnLoad';
	w.mapOnLoad = function () {

	};
	d.body.appendChild(script);
}(window));

function debug(message) {
	if (isDebugEnabled && console) {
		console.log(message);
	}
}
window.showAlert = function(message, title) {
	if (navigator.notification) {
		navigator.notification.alert(message, null, title, 'OK');
	} else {
		window.alert(title ? (title + ': ' + message) : message);
	}
};
window.showConfirm = function(message, confirmCallback, title, buttonLabels) {
	if (navigator.notification) {
		navigator.notification.confirm(message, confirmCallback, title, buttonLabels);
	} else {
		var r=window.confirm(title ? (title + ': ' + message) : message);
		if (r===true) {
			confirmCallback();
		}
	}
};
var PhoneGap = {
	initialize: function() {
		this.bind();
	},
	bind: function() {
		document.addEventListener('deviceready', this.deviceready, false);
	},
	deviceready: function() {
		// note that this is an event handler so the scope is that of the event
		// so we need to call app.report(), and not this.report()
		PhoneGap.report('deviceready');
		FastClick.attach(document.body);
	},
	report: function(id) {
		// hide the .pending <p> and show the .complete <p>
		// document.querySelector('#' + id + ' .pending').className += ' hide';
		// var completeElem = document.querySelector('#' + id + ' .complete');
		// completeElem.className = completeElem.className.split('hide').join('');
	}
};

PhoneGap.initialize();


var app = angular.module('SPAApp', ['ngMobile', 'ngResource', 'infinite-scroll']);
app.config(['$provide', function ($provide) {
	$provide.decorator('$sniffer', ['$delegate', function ($delegate) {
		if (!$delegate.transitions||!$delegate.animations) {
			$delegate.transitions = (typeof document.body.style.webkitTransition=== 'string');
			$delegate.animations = (typeof document.body.style.webkitAnimation === 'string');
		}
		return $delegate;
	}]);
}]);
app.config(['$routeProvider', '$locationProvider', '$httpProvider',
function ($routeProvider, $locationProvider, $httpProvider) {
	var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
		function success(response) {
			return response;
		}
		function error(response) {
			debug('http request error:');
			debug(angular.toJson(response));
			var status = response.status;
			if (status === 0) {
				showAlert('There seems to be some network issue. Please make sure you are connected to the internet.', 'Connection issue');
			}
			if (status === 401 && status === 404) {
				showAlert('Page not found', 'Page not found');
			} else {
				showAlert(response.message);
			}
			// otherwise
			return $q.reject(response);
		}
		return function (promise) {
			return promise.then(success, error);
		};
	}];
	$httpProvider.responseInterceptors.push(interceptor);
}]);
/*
app.run(['$rootScope', function($rootScope) {
$rootScope.$on('$routeChangeStart', function(scope, next, current){
//...
});

$rootScope.$on('$routeChangeSuccess', function(scope, next, current){
console.log(angular.toJson(scope));
console.log(angular.toJson(current));
console.log(angular.toJson(next));
});
}]);
*/
app.config(function ($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/main.html',
		controller: 'MainCtrl'
	})
	.when('/phyform', {
		templateUrl: 'views/phyrefform.html',
		controller: 'PhyFormCtrl'
	})
	.when('/refform', {
		templateUrl: 'views/patients.html',
		controller: 'PatientDetailCtrl'
	})
	.when('/login', {
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});
app.factory('RaModel', function($resource) {
	return $resource(baseUrl + ':dataSource/:operation', {'8888':':8888'}, {
		query: {
			method: 'POST',
			params: {},
			isArray: false
		},
		save: {
			method: 'POST',
			params: {},
			isArray: false
		},
		saveAll: {
			method: 'POST',
			params: {},
			isArray: true
		}
	});
});
app.factory('DropDownFactory', ['RaModel','Logger','Session',function(RaModel,Logger,Session) {
    return {
        loadDropDown: function(ds,valueAttribute,displayAttribute,callback) {
        		console.log("***In load drop down******");
        	 var dsoptions =	{'dataSource':ds};
        	 var  options =	{'limit':100,'offset':0, 
        	 				 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 
        	 				 'select': [valueAttribute,displayAttribute],
        	 				 'orderBy': '#creationDate# DESC'};

				RaModel.query(dsoptions,options ,callback);
			}

		
    };
}]);



app.service('Logger', function() {
	var $this = this;
	this.show = false;
	this.type = 'A';
	this.title = '';
	this.message = '';
	this.confirmCallback = null;
	this.buttonLabels = '';
	this.log = function(msg) {
		debug(msg);
	};
	this.isAlertVisible = function(){
		return $this.show;
	};
	this.hideAlert = function() {
		$this.show = false;
		$this.type = null;
		$this.title = null;
		$this.message = null;
	};
	this.showAlert = function(message, title) {
		if (navigator.notification) {
			navigator.notification.alert(message, null, title, 'OK');
		} else {
			$this.show = true;
			$this.type = 'A';
			$this.title = title;
			$this.message = message;
		}
	};
	this.showConfirm = function(message, confirmCallback, title, buttonLabels) {
		if (navigator.notification) {
			navigator.notification.confirm(message, confirmCallback, title, buttonLabels);
		} else {
			$this.show = true;
			$this.type = 'C';
			$this.title = title;
			$this.message = message;
			$this.buttonLabels = buttonLabels;
			$this.confirmCallback = confirmCallback;
		}
	};
	this.showError = function(message) {
		showAlert(message,"Error");
	}
	this.confirmYes = function(){
		$this.confirmCallback();
	};
});


app.factory('QCalls', ['$http','$q',function($http,$q) {
	var $this = this;
	//var datas = null;
	return {

		 waitForAllQCalls: function(getURLs) { 
		var httpcall1 =  $http({ url: getURLs[0], method: "GET",  headers: {'Content-Type': 'image/jpeg'}});
		var httpcall2 =  $http({ url: getURLs[1], method: "GET",  headers: {'Content-Type': 'image/jpeg'}});
			console.log(httpcall1);
			console.log(httpcall2);
          return $q.all([httpcall1,httpcall2]);
      }
	}
	
}]);

//factory style, more involved but more sophisticated
app.factory('CameraFactory', ['Logger',function(Logger) {
    return {
        openCamera: function(imageoptions,callback) {
        		
				if (!navigator.camera) {
					Logger.showAlert("Camera API is not supported", "Error");
			        return;
			    }
                var options =   {   quality: 50,
                       destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                        encodingType: 0     // 0=JPG 1=PNG
                 };
                 navigator.camera.getPicture(function(imageData) {
					    var path = imageData;
					    var name = imageData;
					    var uploadServerUrl = fileUploadUrl;
					    var ft = new FileTransfer();
					    //alert("ulr options:"+imageoptions);
					    ft.upload( imageData, uploadServerUrl,
					        function(r) {
					      		callback.success(r.response)
						    }, 
						    function(error) {
					  	      callback.failure(error);
					        },
					        imageoptions
					      );  
				 },
			     function() {
	                   Logger.showAlert('Error taking picture', 'Error');
				 },  options);
			}

		
    };
}]);


app.service('Utils', ['Logger','Session',function(Logger,Session) {
	var $this = this;
	//var datas = null;
	this.openCamera = function(ds){
      //     Logger.showAlert("In openCamera");
     var options =   {   quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                        encodingType: 0     // 0=JPG 1=PNG
                    };
	//	ds = ds;
	//Logger.showAlert("Options:"+options);

	//Logger.showAlert("Camera Obj123:"+navigator.camera);
    navigator.camera.getPicture(captureSuccess,captureError,options);
	};

	this.captureSuccess  = function(mediaFiles) {    
		Logger.showAlert("In CaptuerSuccess");
    	uploadFile(mediaFiles[0]);
	}

	this.captureError = function(error) {
    	var msg = 'An error occurred during capture: ' + error.code;
    	Logger.showError(msg);
	}

	
}]);




/*
input[type="checkbox"]  {
    display:inline-block;
    width:19px;
    height:19px;
    margin:-1px 4px 0 0;
    vertical-align:middle;
   
    cursor:pointer;
}*/

app.service('Session', ['RaModel', '$location', 'Logger', function (RaModel, $location, Logger) {
	var session = null, $this = this;
	this.get = function () {
		return session;
	};
	this.validate = function(callback) {
		session = angular.fromJson(localStorage.getItem('session'));
		if (session) {

			RaModel.save({'dataSource':'validateSession'}, {'sessionId': session.sessionId},
			function(result) {
				Logger.log(angular.toJson(result));
				if (result.valid === 'Y') {
					callback();
				} else {
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						Logger.log('Invalid session');
					}
					$this.showLogin();
				}
			});
		} else {
			Logger.log('No session');
			$this.showLogin();
		}
	}
	
	this.showLogin = function() {
		localStorage.removeItem('session');
		$location.path('/login');
	};
	this.isActive = function () {
		if (session) {

		} else if (localStorage.getItem('session')){
			session = angular.fromJson(localStorage.getItem('session'));
		}
		return session && session.sessionId !== null;
	};
	this.signIn = function (username, pwd, callback) {
		RaModel.save({'dataSource':'signin'}, {'username': username, 'password': pwd},
		function(result) {
			//alert("*********"+result);
			Logger.log(angular.toJson(result));
			if (result.$error) {
				Logger.showAlert(result.errorMessage, result.errorTitle);
			} else {
				$location.path('/');
				session = result;
				localStorage.setItem('session', angular.toJson(session));
				callback();
			}
		});
	};
	this.signOff = function () {
		Logger.showConfirm('Would you like to log out?', function(button){
			//Logger.showAlert(button);
			if(button  === 2) return;
			RaModel.save({'dataSource':'signoff'}, {'sessionId': session.sessionId},
			function(result) {
				Logger.log(angular.toJson(result));
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				}
				$this.showLogin();
			});
		});
	};
}]);
app.service('alarmService', function () {
	this.getAlarms = function () {
		return alarms;
	};
	this.getCount = function () {
		return alarms.length;
	};
	this.addAlarm = function (d, t, m) {
		var i = alarms.length + 1;
		alarms.push({
			id: i,
			date: d,
			time:t,
			msg:m
		});
	};

	this.deleteAlarm = function (id) {
		for (var i = alarms.length - 1; i >= 0; i--) {
			if (alarms[i].id === id) {
				alarms.splice(i, 1);
				break;
			}
		}
	};

	this.getAlarm = function (id) {
		for (var i = 0; i < alarms.length; i++) {
			if (alarms[i].id === id) {
				return alarms[i];
			}
		}
	};

	var alarm, alarms = [];

	for (var i=1; i<11; i++) {
		alarm = { id : i, date : '12/12/2013', time : '09:00', msg : 'My Task ' + i};
		alarms.push(alarm);
	}
});
app.service('Menu', ['$location', function ($location) {
	this.setSubPage = function(b) {
		subPage = b;
	};
	this.isSubPage = function() {
		return subPage;
	};
	this.getItems = function () {
		return items;
	};
	this.getActive = function () {
		return active;
	};
	this.back = function () {
		window.history.back();
	};
	this.setActiveCode = function (code) {
		this.setActive(this.getItem(code));
	};
	this.setActive = function (item) {
		if (active) {
			active.active = false;
		}
		active = item;
		active.active = true;
	};
	this.menuItemClick = function(menuItem) {
		this.setSubPage(false);
		this.setActive(menuItem);
		$location.path(menuItem.code);
		setTimeout(function(){
			$('#menu').hide();
		},400);
		isOpen = false;
	};
	this.clear = function () {
		this.setActive(items[0]);
	};
	this.isOpen = function () {
		return isOpen;
	};
	this.TBD = function () {
		showAlert('Function not implemented', 'TBD');
	};

	var isOpen = false, subPage = false, active,
	items = [{code:'phyform', icon:'icon-building', name:'Referral Form',cls:'icon',style:'background:#8B4C39'},{code:'refform', icon:'icon-copy', name:'Referrals',cls:'icon',style:''}];

	this.getItem = function(code){
		var len = items.length;
		for (var i=0; i<len; i++) {
			if (items[i].code === code) {
				return items[i];
			}
		}
		return items[0];
	};
}]);
app.service('Cache', function () {
	var map;
	this.init = function(){
		if (map) {
			return;
		}
		if (localStorage.getItem('Cache')){
			map = angular.fromJson(localStorage.getItem('Cache'));
		} else {
			map = {};
		}
	};
	this.get = function (k) {
		this.init();
		return map[k];
	};
	this.put = function (k, v) {
		this.init();
		map[k] = v;
		localStorage.setItem('Cache', angular.toJson(map));
		return map[k];
	};
	this.remove = function (k) {
		this.init();
		delete map[k];
		localStorage.setItem('Cache', angular.toJson(map));
	};
});
app.factory('nowTime', ['$timeout',function($timeout) {
	var nowTime = Date.now();
	var updateTime = function() { $timeout(function(){ nowTime = Date.now(); updateTime(); }, 1000); };
	updateTime();
	return function() {
		return nowTime;
	};
}]);
app.factory('timeAgo', function() {
	var service = {
		settings: {
			refreshMillis: 60000,
			allowFuture: false,
			strings: {
				prefixAgo: null,
				prefixFromNow: null,
				suffixAgo: 'ago',
				suffixFromNow: 'from now',
				seconds: 'less than a minute',
				minute: 'about a minute',
				minutes: '%d minutes',
				hour: 'about an hour',
				hours: 'about %d hours',
				day: 'a day',
				days: '%d days',
				month: 'about a month',
				months: '%d months',
				year: 'about a year',
				years: '%d years',
				numbers: []
			}
		},
		inWords: function(distanceMillis) {
			var $l = service.settings.strings;
			var prefix = $l.prefixAgo;
			var suffix = $l.suffixAgo;
			if (service.settings.allowFuture) {
				if (distanceMillis < 0) {
					prefix = $l.prefixFromNow;
					suffix = $l.suffixFromNow;
				}
			}

			var seconds = Math.abs(distanceMillis) / 1000;
			var minutes = seconds / 60;
			var hours = minutes / 60;
			var days = hours / 24;
			var years = days / 365;

			function substitute(stringOrFunction, number) {
				var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
				var value = ($l.numbers && $l.numbers[number]) || number;
				return string.replace(/%d/i, value);
			}

			var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
			seconds < 90 && substitute($l.minute, 1) ||
			minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
			minutes < 90 && substitute($l.hour, 1) ||
			hours < 24 && substitute($l.hours, Math.round(hours)) ||
			hours < 42 && substitute($l.day, 1) ||
			days < 30 && substitute($l.days, Math.round(days)) ||
			days < 45 && substitute($l.month, 1) ||
			days < 365 && substitute($l.months, Math.round(days / 30)) ||
			years < 1.5 && substitute($l.year, 1) ||
			substitute($l.years, Math.round(years));

			var separator = $l.wordSeparator === undefined ?  ' ' : $l.wordSeparator;
			return $.trim([prefix, words, suffix].join(separator));
		},
		parse: function(iso8601) {
			if (angular.isNumber(iso8601)) {
				return parseInt(iso8601,10);
			}
			var s = $.trim(iso8601);
			s = s.replace(/\.\d+/,''); // remove milliseconds
			s = s.replace(/-/,'/').replace(/-/,'/');
			s = s.replace(/T/,' ').replace(/Z/,' UTC');
			s = s.replace(/([\+\-]\d\d)\:?(\d\d)/,' $1$2'); // -04:00 -> -0400
			return new Date(s);
		}
	};
	return service;
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});


app.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

  app.directive("ngTap", function() {
  return function($scope, $element, $attributes) {
    var tapped;
    tapped = false;
    $element.bind("click", function() {
    	Logger.showAlert("click event");
      if (!tapped) {
        return $scope.$apply($attributes["ngTap"]);
      }
    });
    $element.bind("touchstart", function(event) {
    	Logger.showAlert("touch start");
      return tapped = true;
    });
    $element.bind("touchmove", function(event) {
    	Logger.showAlert("touch move");
      tapped = false;
      return event.stopImmediatePropagation();
    });
    return $element.bind("touchend", function() {
    	Logger.showAlert("touch end");
      if (tapped) {
        return $scope.$apply($attributes["ngTap"]);
      }
    });
  };
});

app.directive('timeAgo', ['timeAgo', 'nowTime', function(timeago, nowTime) {
	return {
		restrict: 'EA',
		link: function(scope, linkElement, attrs) {
			var fromTime;

			// Track the fromTime attribute
			attrs.$observe('fromTime', function(value) {
				fromTime = timeago.parse(value);
			});


			// Track changes to time difference
			scope.$watch(function() { return nowTime() - fromTime; }, function(value) {
				$(linkElement).text(timeago.inWords(value));
			});
		}
	};
}]);

app.filter('timeAgo', ['timeAgo', 'nowTime', function(timeAgo, nowTime) {
	return function(value) {
		var fromTime = timeAgo.parse(value);
		var diff = nowTime() - fromTime;
		return timeAgo.inWords(diff);
	};
}]);


