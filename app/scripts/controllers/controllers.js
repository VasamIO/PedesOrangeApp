'use strict';
var app = angular.module('SPAApp');
app.controller('SearchAccountsCtrl', ['$scope', '$location', 'RaModel', 'Session', 'Cache', 'Menu', 'Logger', function ($scope, $location, RaModel, Session, Cache, Menu, Logger) {
	Menu.setActiveCode('searchAccounts');
	Logger.log('SearchAccountsCtrl');
	$scope.Menu = Menu;
	var s;
	function init() {
		$scope.s = Cache.get('SearchAccountsData') || {'data':{}};
		s = $scope.s;
		s.loading = false;
	}
	init();
	var query = function(callback){
		if (s.data) {
			s.loading = true;
			RaModel.query({'dataSource':'CustWBCustomerSearch'}, {'limit':20,'offset':s.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'data' : s.data, 'orderBy': '#accountNumber# ASC, #identifyingAddressFlag# DESC'}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						s.elapsed = result.elapsed;
						s.result.push.apply(s.result, result.data);
						Cache.put('SearchAccountsResults', s.result);
						if (result.data.length < 20) {
							s.hasMore = false;
						} else {
							s.hasMore = true;
						}
						Cache.put('SearchAccountsHasMore', s.hasMore);
					} else {
						s.hasMore = false;
						if (s.result.length === 0) {
							Logger.showAlert('No acounts found');
						}
					}
				}
				s.loading = false;
				s.scrolling = false;
				if (callback) {
					callback(result);
				}
			});
		} else {
			Logger.showAlert('You must', 'Blind Query');
			s.scrolling = false;
		}
	};
	$scope.doSearch = function(callback) {
		if (s.loading === true) {
			return;
		}
		s.hasMore = false;
		s.result = [];
		s.offset = 0;
		query(callback);
		Cache.put('SearchAccountsData', s);
	};
	$scope.doClear = function() {
		s = $scope.s = {'data':{}};
		Cache.remove('SearchAccountsData');
	};
	$scope.scroll = function(w) {
		if (s.scrolling === true || s.loading === true || s.hasMore === false || s.result === undefined || s.result.length === 0) {
			return;
		}
		s.scrolling = true;
		$scope.getMore();
	};
	$scope.getMore = function() {
		s.offset += 20;
		query();
	};
	$scope.goToDetails = function(a) {
		Menu.setSubPage(false);
		Cache.put('currPatient', a);
		$location.path('/account');
	};
	$scope.back = function() {
		$location.path('/');
	};

}]);




app.controller('MainCtrl', ['$scope', '$location', 'alarmService', 'Menu', 'Session', 'Cache',  function ($scope, $location, alarmService, Menu, Session, Cache) {
	Menu.setActiveCode('/');
	$scope.Menu = Menu;
//	$scope.Demo = Demo;
	$scope.showIntro = Cache.get('showIntro');
	if ($scope.showIntro === undefined) {
		$scope.showIntro = true;
	}
	setTimeout(function(){
		$scope.$apply(function(){
			$scope.showIntro = false;
			Cache.put('showIntro', $scope.showIntro);
		});
	}, 5000);

	$scope.userName = Session.get().displayName;
	$scope.session = Session.get();

	$scope.signOff = function() {
		Session.signOff();
	};
}]);
app.controller('TasksCtrl', ['$scope', '$location', 'alarmService', 'Menu', function ($scope, $location, alarmService, Menu) {
	function init() {
		$scope.alarms = alarmService.getAlarms();
	}
	init();
	$scope.goToDetails = function(alarm) {
		if (Menu.isOpen()) {
			Menu.toggle();
			return;
		}
		Menu.setSubPage(false);
		$location.path('/details/' + alarm.id);
	};
	$scope.create = function() {
		Menu.setSubPage(false);
		$location.path('/create');
	};
}]);

app.controller('LoginCtrl', ['$scope', '$location', 'Session', 'Menu', function ($scope, $location, Session, Menu) {
	Menu.setSubPage(true);
	setTimeout(function(){
		$('input[type="text"]').focus();
	}, 100);
	$scope.signIn = function() {
		Session.signIn($scope.username, $scope.password, function(){
			if (Session.isActive()) {
				$location.path('/');
			}
		});
	};
}]);



app.controller('PhyFormCtrl', ['CameraFactory','$scope', '$location', 'Menu','Logger','Session','RaModel', function (CameraFactory,$scope, $location,  Menu,Logger,Session,RaModel) {
	 $scope.uploadingimages = false;
	function init() {
		$scope.date = '2013-06-20';
		$scope.time = '09:30';
		$scope.upimages =[];
		$scope.userName = Session.get().displayName;
		$scope.userId = Session.get().userId;
		//$scope.msg = alarmService.getCount()+1 + ' New message goes here...';
	}
	init();

	$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/');
	};

	$scope.order = function() {
	if(typeof $scope.facility === "undefined" ||$scope.facility === "nofacility" ) {
		Logger.showAlert("Please select facility","Error");
		return;
		
	}
	if($scope.pname == null) {
		Logger.showAlert("Please enter patient name","Error");
		return;
	} else if ($scope.venous == null && $scope.art == null) {
		Logger.showAlert("Please select atleast one from Arterial or Venous","Error");
		return;
	} else if($scope.uc == null && $scope.ai == null  
		&&  $scope.veno == null && $scope.ot == null ) {
		Logger.showAlert("Please select atleast one from Ultrasound, Angiogram Intervention or Venogram Intervention","Error");
		return;
	} else if($scope.dap == null && $scope.dvt == null
				&& $scope.pain == null && $scope.piv == null
				&& $scope.pvd == null && $scope.se == null
				&& $scope.vv == null && $scope.nhw == null  && $scope.cl == null) {
		Logger.showAlert("Please select atleast one from Indications","Error");
		return;
	}
	//alert("--------Upload file Ids:"+$scope.fileIds);
	RaModel.save({'dataSource':'PatientReferralFormV','operation':'insert'}, { "sessionId":Session.get().sessionId,
	  'phone':$scope.phone,
	  'uploadDocIds':  $scope.fileIds,
	  "referred":$scope.userId,                             
      "dateref":new Date(),
      "venogram": $scope.veno?"Y":"N",
      "otherVenogram":$scope.ot?"Y":"N",
	 'patientName':$scope.pname,
	  
     // "ultraconsult":$scope.uc?"Y":"N",
      "pain":$scope.pain?"Y":"N",
      "ulcer":$scope.nhw?"Y":"N",
      "pvd":$scope.pvd?"Y":"N",
      "claudication":$scope.cl?"Y":"N",
      "absentPulses":$scope.dap?"Y":"N",
      "dvt":$scope.dvtpain?"Y":"N",
      "swelling":$scope.se?"Y":"N",
      "varicoseVeins":$scope.vv?"Y":"N",
      "surgicalevaluation":$("#presurgical").is(':checked') ? 'Y' : 'N',     
      "interEvaluation":$scope.piv?"Y":"N",    
      "otherindication": $scope.iot ,
      "venousDuplex":$scope.venous ? 'Y' : 'N',
      "arterialDuplex":$scope.art ? 'Y' : 'N',
      "bilultra":$scope.bil ? 'Y' : 'N',  
      "rightultra":$scope.right ? 'Y' : 'N',  
      "leftultra":$scope.left ? 'Y' : 'N',  
      "angiogram":$scope.ai ? 'Y' : 'N',
      "ultraConsult":$scope.uc ? 'Y' : 'N',
      "status":'Submitted',
      "facility":$scope.facility,
      "vascularconsult": 'N',
      "exercisestudy": 'N'


	}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
					
						Logger.showConfirm('Updated Successfully', function(){
							$scope.back();
					},"Update",'Ok');
					
				}
			});
	};
	$scope.openCamera  = function(fileIds,upImgbar) {
						var options = {};
					    options.fileKey="file";
					    options.fileName="patientinfo.JPG";
					    options.mimeType="image/jpeg";
					    var params = new Object();
					    params.sid = Session.get().sessionId;
					    params.name = name;
					    params.ds = "PatientReferralFormV";
					    options.params = params;
					    options.chunkedMode = false;
					    //$scope.uploadingimages = true;
						CameraFactory.openCamera(options,{
							success: function(r) {
								$scope.uploadingimages = false;
								var _json  = eval(r);
							if(typeof $scope.fileIds !== "undefined") {
		    					$scope.fileIds = $scope.fileIds +","+_json[0].fileId;
			    			} else {
			    					$scope.fileIds = _json[0].fileId;
			    			}
		    			var imgurl = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid="+_json[0].fileId+"&thumb=Y";
		    			$scope.upimages.push(imgurl);
		    			$scope.uploadingimages = false;
		    			},failure : function(error) {
							Logger.showError(error);
		    			}
						});
						
	}

}]);



app.controller('PatientDetailCtrl', ['CameraFactory','$scope','$http' ,'$location', '$window','RaModel','QCalls', 'Session', 'Cache', 'Menu','Logger', function (CameraFactory,$scope, $http,$location,$window, RaModel, QCalls,Session, Cache, Menu, Logger) {
	Logger.log('PatientDetailCtrl');

	//Demo.setScope($scope);
	//Cache.remove('_a');
	var currPatient = Cache.get('currPatient'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.image_data  = {};
	$scope.nodocuments = true;
	$scope.imageselected = false;
	$scope.urlIndex = "s";
	$scope.sessionId = "";
		$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/');
	};
	$scope.getMorePatients = function() {
		if (a.patients.loading || !a.patients.hasMore) {
			return;
		}
		a.patients.offset += _limit;
		$this.patientsQuery();
	};
	this.initScope = function() {
		a.data = currPatient;
		a.selection = 'Patients';
		$scope.displayName = Session.get().displayName;

		a.patients = {};
		a.patients.data = [];
		a.patients.offset = 0;
		a.patients.initialized = false;
		a.patients.hasMore = false;
		a.patients.loading = false;

		a.patientDetails = {};
		a.patientDetails.data = [];
		a.patientDetails.offset = 0;
		a.patientDetails.initialized = false;
		a.patientDetails.hasMore = false;
		a.patientDetails.loading = false;
		a.patientDetails.imagesloading = false;
		a.patientDetails.images = {};
		a.patientDetails.images.data = [];

		a.patientComments = {};
		a.patientComments.data = [];
		a.patientComments.initialized = false;
		a.patientComments.loading = false;
		//a.patientDetails.imagesloading
		$scope.a = a;
		$this.patientsQuery();
	};
  
	this.init = function(){
		a = {'pageTitle':'Patients'};
	};

	this.patientsQuery = function(){
			a.patients.loading = true;	 
			RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patients.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['patientName',	'facility','physicianName','creationDate','patientId','uploadDocIds','referred'],'orderBy': '#creationDate# DESC'}, function(result){
					if (result.$error) {
						Logger.showAlert(result.errorMessage, result.errorTitle);
					} else {
						if (result.data.length > 0) {
							a.patients.data.push.apply(a.patients.data, result.data);
							if (result.data.length < _limit) {
								a.patients.hasMore = false;
							} else {
								a.patients.hasMore = true;
							}
						} else {
							a.patients.hasMore = false;
						}
						Cache.put('_a', a);
					}
					a.patients.loading = false;
				}
			);
	   
	};


	$scope.$watch('a.selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		//alert(newValue);
		/*
		a.patients.initialized = true;
		*/if (newValue === 'Patients') {
			a.pageTitle = 'Patient Referals';
			
			//$this.patientsQuery();
			if (a.patients.initialized) {
				return;
			}
			
		} else if (newValue === 'PatientDetails') {
			a.pageTitle = 'Patient Details';
		} 
	});

	$scope.$watch('imageselected', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		

	});
 	$scope.openPopup = function(urlIndex1) {
               $scope.imageselected = true;
               //alert(urlIndex1);
               $scope.urlIndex = urlIndex1+"";
             //  alert($scope.urlIndex);
             
    };

	$scope.closePopup = function() {
	               $scope.imageselected = false;
	};
	
	$scope.$watch('a.patients.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.patientId + ',' + o.facility + ', ' + o.state + ' ' + o.postalCode);
		}
		if (a){
			$scope.a.pageTitle = 'Patient Details';
			Logger.log(a.patientId +  ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
			
			$this.patientDetailsQuery(a.patientId);
			$this.loadComments(a.patientId);
		}
	}, true);

	/* Start Load Comment */

	this.loadCommentsQueryInternal = function(pid){
		
		RaModel.query({'dataSource':'RefferralComments'}, {'limit':5,'offset':0, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'patientId':pid},'orderBy': '#creationDate# DESC'}, function(result){
				a.patientComments.data = [];
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						a.patientComments.data.push.apply(a.patientComments.data, result.data);

					} else {
						a.patientComments.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.patientComments.loading = false;
				
			}
		);
	}
	this.loadComments = function(pid) {
		a.patientComments.loading = true;
			$this.loadCommentsQueryInternal(pid);
	}

		$scope.openCamera  = function() {
			a.patientDetails.imagesloading = true;
						var options = {};
					    options.fileKey="file";
					    options.fileName="patientinfo.JPG";
					    options.mimeType="image/jpeg";
					    var params = new Object();
					    params.sid = Session.get().sessionId;
					    params.name = name;
					    params.ds = "PatientReferralFormV";
					    options.params = params;
					    options.chunkedMode = false;
					    //$scope.uploadingimages = true;
						CameraFactory.openCamera(options,{
							success: function(r) {
								$scope.uploadingimages = false;
								var _json  = eval(r);
							if(typeof $scope.fileIds !== "undefined") {
		    					$scope.fileIds = $scope.fileIds +","+_json[0].fileId;
			    			} else {
			    					$scope.fileIds = _json[0].fileId;
			    			}
		    			var imgurl = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid="+_json[0].fileId;
		    			alert(imgurl);
		    			alert("inerting.. document..2222>>"+$scope.fileIds);
		    			var patientImgs = $scope.image_data[a.patients.current.patientId];
		    			if(typeof patientImgs !== "undefined") {
		    					patientImgs.push(imgurl);		
		    			} else {
		    				$scope.image_data.push(imgurl);
		    			}
		    			alert("inerting.. document.."+$scope.fileIds);
		    			var fids = $scope.fileIds;
		    			alert("ids:"+fids);
		    			$this.insertDocument(fids);
						a.patientDetails.imagesloading = false;
		    			//$scope.uploadingimages = false;
		    			},failure : function(error) {
							Logger.showError(error);
		    			}
						});
						
	}/*
$scope.openCamera  = function() {
			a.patientDetails.imagesloading = true;
					
								$scope.uploadingimages = false;
								var _json  = ["2322","1111"];
							if(typeof $scope.fileIds !== "undefined") {
		    					$scope.fileIds = $scope.fileIds +","+_json[0].fileId;
			    			} else {
			    					$scope.fileIds = _json[0].fileId;
			    			}
		    			var imgurl = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid="+_json[0].fileId;
		    			alert(imgurl);
		    			alert("inerting.. document..2222>>"+$scope.fileIds);
		    			var patientImgs = $scope.image_data[a.patients.current.patientId];
		    			if(typeof patientImgs !== "undefined") {
		    					patientImgs.push(imgurl);		
		    			} else {
		    				$scope.image_data.push(imgurl);
		    			}
		    			alert("inerting.. document.."+$scope.fileIds);
		    			var fids = $scope.fileIds;
		    			alert("ids:"+fids);
		    			$this.insertDocument(fids);
						a.patientDetails.imagesloading = false;
		    			//$scope.uploadingimages = false;
		    			
	}*/
	this.insertDocument = function(fileIds) {
		alert("in insert coments.."+fileIds);
		
		alert("Patient Id:"+a.patients.current.patientId + " Fiel ids:"+fileIds + "user Id" + Session.get().sessionId);
		if(typeof a.patients.current.uploadDocIds !== "undefined") {
			fileIds += a.patients.current.uploadDocIds;
		}
				//var comments = $scope.newcomment;
		//alert(comments);
		alert("P Name:"+a.patientDetails.current.patientName);
		alert("phone:"+a.patientDetails.current.phone);
		alert("referred:"+a.patientDetails.current.referred);
		RaModel.save({'dataSource':'PatientInfo','operation':'update'}, { "sessionId":Session.get().sessionId,
	  'patientId':a.patients.current.patientId,
	  'userId':  Session.get().userId,
	  'patientName': a.patientDetails.current.patientName,
	  'phone':a.patientDetails.current.phone,
	  'createdBy':a.patientDetails.current.createdBy,
	  'createdDate':a.patientDetails.current.createdDate,
		'referred':a.patientDetails.current.referred,
	  'uploadDocIds':fileIds,
	  'lastUpdateDate': new Date()
	 

	}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
					alert("*** UPDATED");
									a.patientDetails.imagesloading = false;
		
				}
			});
	};

	$scope.insertComments = function(pid,userid,comments) {
		
		if(comments === '') return false;
		a.patientComments.loading = true;

		//var comments = $scope.newcomment;
		//alert(comments);
		RaModel.save({'dataSource':'RefferralComments','operation':'insert'}, { "sessionId":Session.get().sessionId,
	  'patientId':pid,
	  'userId':  userid,
	  "comments":comments

	}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
					$this.loadComments(pid);
				}
			});
	};
	

	/* End */

	/* Start Patient Details */
	this.patientDetailsQueryInternal = function(pid){
		
		RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patientDetails.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'patientId':pid}}, function(result){
				
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {

						a.patientDetails.data.push.apply(a.patientDetails.data, result.data);
						a.patientDetails.current = result.data[0];
						
						if (result.data.length < _limit) {
							a.patientDetails.hasMore = false;
						} else {
							a.patientDetails.hasMore = true;
						}

					} else {
						a.patientDetails.hasMore = false;
					}
					Cache.put('_a', a);
				}
				a.patientDetails.loading = false;
				
			}
		);

				  $scope.$evalAsync(this.downloadAllFiles (a.patients.current.uploadDocIds,pid));
	}

	this.patientDetailsQuery = function(pid){
		a.patientDetails.loading = true;

		if(a.patientDetails.data.length && a.patientDetails.data.length > 0) {
			var recordFound = false;
			for(var counter = 0; counter < a.patientDetails.data.length; counter ++) {
				var patientDetails = a.patientDetails.data[counter];
				console.log("queried pid:"+pid+":"+patientDetails.patientId)
				if(pid === patientDetails.patientId) {
					recordFound = true;
					a.patientDetails.loading = false;
					a.patientDetails.current = patientDetails;

					a.patientDetails.imagesloading = false;
					break;

				}
			}
			if(!recordFound) {
				console.log("Query again...");
				$this.patientDetailsQueryInternal(pid);	
			} else {
				console.log("Existing record");
			}
		} else {
			console.log("No records found!");
			$this.patientDetailsQueryInternal(pid);
		}
	};

	this.getMorepatientDetails = function() {
		if (a.patientDetails.loading || !a.patientDetails.hasMore) {
			return;
		}
		a.patientDetails.offset += _limit;
		$this.orderQuery();
	};
	/* End patientDetails */
	if (a === undefined) {
		this.init();
		Cache.put('_a', a);
	}
	this.initScope();


	this.downloadAllFiles = function(fid,pid) {
		var imagedata = [];
		var parentimagedata = {};
		a.patientDetails.imagesloading = true;
		parentimagedata.pid = pid;
			var params = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid=";
			var count = 1;
			var fileIds = [];
			if(typeof fid === "undefined") {
				a.patientDetails.imagesloading = false;
				return;
			}
			if(fid.indexOf(",") > -1) {
			fileIds = fid.split(",");
				count = fileIds.length;
			} else {
				fileIds[0] = fid;
			}
			for(var c = 0 ; c < count; c++) {
				if(fileIds[c] === "") {
					continue;
				} else {
				if(fileIds[c].length > 1) {
						imagedata.push(params+fileIds[c]);
				}
			}
			}
			a.patientDetails.imagesloading = false;
			$scope.image_data[pid] = imagedata;
	};

}]);
