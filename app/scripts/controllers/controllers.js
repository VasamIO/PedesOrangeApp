'use strict';
var app = angular.module('SPAApp');

app.controller('MainCtrl', ['$rootScope','$scope', '$location', 'DropDownFactory','alarmService', 'Menu', 'Session', 'Cache',  function ($rootScope,$scope, $location, DropDownFactory,alarmService, Menu, Session, Cache) {
	Menu.setActiveCode('/');
	$scope.Menu = Menu;
//	$scope.Demo = Demo;
	$scope.showIntro = Cache.get('showIntro');
	if ($scope.showIntro === undefined) {
		$scope.showIntro = true;
	}
	function init() {
		DropDownFactory.loadDropDown("FacilityMaster","facilityCode","facilityName",function(result) {

					if (result.$error) {
								Logger.showAlert(result.errorMessage, result.errorTitle);
							} else {
								if (result.data.length > 0) {
									console.log("Loaded... Facility dropdown:"+result.data.length);
										$rootScope.facilitydata = result.data;
								} 
							}
				});
	}
	init();
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

app.controller('LoginCtrl', ['$scope', '$location', 'Session', 'Menu', function ($scope, $location, Session, Menu) {
	Menu.setSubPage(true);
	setTimeout(function(){
		$('input[type="text"]').focus();
	}, 100);
	$scope.signIn = function() {
		Session.signIn($scope.username, $scope.password, function(){
			if (Session.isActive()) {
				$location.path('/');
				//load all dropdowns
				
			}
		});
	};
}]);



app.controller('PhyFormCtrl', ['DropDownFactory','CameraFactory','$rootScope','$scope', '$location', 'Menu','Logger','Session','RaModel', function (DropDownFactory,CameraFactory,$rootScope,$scope, $location,  Menu,Logger,Session,RaModel) {
	 $scope.uploadingimages = false;
	 $scope.phoneNumberPattern = /^(\([0-9]{3}\) |[0-9]{3}-)[0-9]{3}-[0-9]{4}$/; //.(714) 345-4567
	 var $this = this;
	 $scope.imagesrefresh  = false ;
	 $scope.format = 'M/d/yy h:mm:ss a';
	 $scope.title = "Referral Form";
	 $scope.selection = "ReferralForm";
		$scope.facilityDropDown = [];
		$scope.fileIds = "";
	function init() {
		$scope.date = new Date();
		$scope.time = '09:30';
		$scope.upimages =[];
		$scope.userName = Session.get().displayName;
		$scope.userId = Session.get().userId;
	   	$scope.facilityDropDown = $rootScope.facilitydata;
	   	console.log("***Pattern*******"+$scope.phoneNumberPattern);
  	}
	init();

	$scope.back = function() {
		Menu.setSubPage(true);
		$location.path('/');
	};


	$scope.$watch('selection', function(newValue, oldValue){
		Logger.log(oldValue + '->' + newValue);
		//alert(newValue);
		/*
		a.patients.initialized = true;
		*/if (newValue === 'ReferralForm') {
			$scope.title = 'Referral Form';
			
			
			
		} else if (newValue === 'ConfirmRefferral') {
			$scope.title = 'Confirm Refferral';
		} 
	});

	$scope.order = function(arcode,prefix,lineumber) {
	
//	Logger.showAlert("****"+$scope.ot);  
console.log("Phone vlaidation:"+arcode+"-->"+prefix+"-->"+lineumber);
	if(typeof $scope.facility === "undefined" ||$scope.facility === "nofacility" ) {
		Logger.showAlert("Please select facility","Error");
		return;
	}
	console.log("****"+$scope.art+"**********"+$scope.venous);
	if($scope.fname == null && $scope.lname == null) {
		Logger.showAlert("Please enter patient name","Error");
		return;
	} else if((!arcode || !prefix || !lineumber ) 
		|| ($scope.arcode == null || $scope.prefix == null || $scope.linenumber == null  )){
		Logger.showAlert("Please enter valid phone number. Ex (xxx) xxx-xxxx","Error");
		return;
	} else if (($scope.venous == null || !$scope.venous)&& ($scope.art == null ||!$scope.art)) {
		Logger.showAlert("Please select atleast one from Arterial or Venous","Error");
		return;
	} else if($scope.uc == null && $scope.ai == null  
		&&  $scope.veno == null && $scope.ot == null ) {
		Logger.showAlert("Please select atleast one from Evaluation/Treatment","Error");
		return;
	} else if($scope.dap == null && $scope.dvt == null
				&& $scope.pain == null && $scope.piv == null
				&& $scope.pse == null && $scope.pvd == null && $scope.se == null
				&& $scope.vv == null && $scope.nhw == null  && $scope.cl == null && $scope.iot == null) {
		Logger.showAlert("Please select/enter atleast one from Indications","Error");
		return;
	}
	 $scope.selection  = "ConfirmRefferral";
	 //$this.confirmreferral();
}

	 $scope.removeImg = function(imagevalue,index) {
  		Logger.showConfirm('Do you want to delete it?', function(button){
			if(button  === 2) return;
			$scope.safeApply(function(){
		  	 	$scope.upimages.splice(index,1);
		  	 	var selectedFileID = imagevalue.substring(imagevalue.lastIndexOf("=")+1,imagevalue.length);
		  	 	var _uploadDocIds =  $scope.fileIds;
		  	 	if(_uploadDocIds.indexOf(selectedFileID) > -1) {
		  	 		_uploadDocIds = _uploadDocIds.replace(selectedFileID,"");
		  	 	}
		  	 });
	 	});
  	 }

  $scope.confirmreferral = function() {
  	console.log("**************** In confirm refferrral********");
	$scope.uploadingimages =  true;
	var _pname = "";

	if(typeof $scope.lname !== "undefined") {
		_pname += $scope.lname +" ";
	}
	if(typeof $scope.fname !== "undefined") {
		_pname += $scope.lname;
	}
	RaModel.save({'dataSource':'PatientReferralFormV','operation':'insert'}, { "sessionId":Session.get().sessionId,
	  'phone':"("+$scope.arcode+") "+$scope.prefix+"-"+$scope.linenumber,
	  'uploadDocIds':  $scope.fileIds,
	  "referred":$scope.userId,                             
      "dateref":new Date(),
      "venogram": $scope.veno?"Y":"N",
      "otherVenogram":$scope.ot,
	  'patientName':_pname,
	  "pain":$scope.pain?"Y":"N",
      "ulcer":$scope.nhw?"Y":"N",
      "pvd":$scope.pvd?"Y":"N",
      "claudication":$scope.cl?"Y":"N",
      "absentPulses":$scope.dap?"Y":"N",
      "dvt":$scope.dvtpain?"Y":"N",
      "swelling":$scope.se?"Y":"N",
      "varicoseVeins":$scope.vv?"Y":"N",
      "interEvaluation":$scope.piv?"Y":"N",    
      "otherIndication": $scope.iot,
      "surgicalEvaluation": $scope.pse?"Y":"N",
      "venousDuplex":$scope.venous ? 'Y' : 'N',
      "arterialDuplex":$scope.art ? 'Y' : 'N',
      "bilUltra":$scope.bil ? 'Y' : 'N',  
      "rightUltra":$scope.right ? 'Y' : 'N',  
      "leftUltra":$scope.left ? 'Y' : 'N',  
      "angiogram":$scope.ai ? 'Y' : 'N',
      "ultraConsult":$scope.uc ? 'Y' : 'N',
      "status":'Submitted',
      "facility":$scope.facility,
      "vascularconsult": 'N',
      "exercisestudy": 'N'
	}, function(result){
		$scope.uploadingimages =  false;
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
					
						var d = new Date($scope.date);
						var time = d.getHours()+""+d.getMinutes();
						d = d.getMonth()+"/"+d.getDate()+"/"+d.getFullYear();
						var test = $scope.art?"Arterial":"Venous";
						Logger.showConfirm('Congratulations Dr.'+$scope.userName+' you have referred '+$scope.pname+' for an '+test+' with Pedes Orange County. Your referral was received '+d+' at '+time+' hours from your Irvine Office facility. We will begin processing your referral immediately. Please let us know if you have any questions', function(){
							$scope.safeApply (function(){
								$location.path('/');
							});
					},"Update",'Ok');
					
				}
			});
	};
	
	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	   // Logger.showAlert("***********");
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	    } else {
	    	//Logger.showAlert(phase+"****** else *****");
	       this.$apply(fn);
	    }
	};
	$scope.openCamera  = function(fileIds,upImgbar) {
		$scope.imagesrefresh = true;
		$scope.uploadingimages = true;
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
							 $scope.safeApply(function(){
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
		    					});
		    			},failure : function(error) {
							Logger.showError(error);
							$scope.uploadingimages = false;
		    			}
						});
						
	}

}]);



app.controller('PatientDetailCtrl', ['$timeout','DropDownFactory','CameraFactory','$rootScope','$scope','$http' ,'$location', '$window','RaModel','QCalls', 'Session', 'Cache', 'Menu','Logger', function ($timeout,DropDownFactory,CameraFactory,$rootScope,$scope, $http,$location,$window, RaModel, QCalls,Session, Cache, Menu, Logger) {
	Logger.log('PatientDetailCtrl');

	//Demo.setScope($scope);
	//Cache.remove('_a');
	var currPatient = Cache.get('currPatient'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.image_data  = {};
	$scope.nodocuments = true;
	$scope.facilityDropDown = [];
	$scope.imageselected = false;
	$scope.urlIndex = "s";
	$scope.sessionId = "";
	$scope.facilityDropDown = {};
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

		$scope.facilityDropDown = $rootScope.facilitydata;
		console.log($scope.facilityDropDown);
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
		a.patientDetails.imagesrefresh = false;
		a.patientComments = {};
		a.patientComments.data = [];
		a.patientComments.initialized = false;
		a.patientComments.loading = false;
		//a.patientDetails.imagesloading
		$scope.a = a;
		$this.patientsQuery();
	};
  	
  	 $scope.removeImg = function(imageKey,imagevalue,index) {
  	 	
		Logger.showConfirm('Do you want to delete it?', function(button){
			if(button  === 2) return;
		 	
			$scope.safeApply(function(){
			 	var images = $scope.image_data[imageKey];
		  	 	images.splice(index,1);
		  	 	var selectedFileID = imagevalue.substring(imagevalue.lastIndexOf("=")+1,imagevalue.length);
		  	 	var _uploadDocIds =  a.patients.current.uploadDocIds;
		  	 	if(_uploadDocIds.indexOf(selectedFileID) > -1) {
		  	 		_uploadDocIds = _uploadDocIds.replace(selectedFileID,"");
		  	 	}

		  	 	RaModel.save({'dataSource':'PatientInfo','operation':'update'}, { "sessionId":Session.get().sessionId,
				  'patientId':a.patients.current.patientId,
				  'userId':  Session.get().userId,
				  'patientName': a.patientDetails.current.patientName,
				  'phone':a.patientDetails.current.phone,
				  'createdBy':a.patientDetails.current.createdBy,
				  'creationDate':a.patientDetails.current.creationDate,
				  'referred':a.patientDetails.current.referred,
				  "facility":a.patientDetails.current.facility,
				  'uploadDocIds':_uploadDocIds,
				  'lastUpdateDate': new Date()
				}, function(result){
						if (result.$error) {
							Logger.showAlert(result.errorMessage,result.errorTitle);
						} else {
						}
				});
			})
		});
  	 }
	this.init = function(){
		a = {'pageTitle':'Patients'};
	};

	this.patientsQuery = function(){
			a.patients.loading = true;	 
			RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patients.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['patientName',	'facility','physicianName','creationDate','lastUpdateDate','patientId','uploadDocIds','referred'],'orderBy': '#creationDate# DESC'}, function(result){
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
	};
	this.loadComments = function(pid) {
		a.patientComments.loading = true;
			$this.loadCommentsQueryInternal(pid);
	};

		$scope.openCamera  = function() {

			a.patientDetails.imagesrefresh = true;
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
						CameraFactory.openCamera(options,{
							success: function(r) {
								$scope.safeApply(function(){
									$scope.uploadingimages = false;
									var _json  = eval(r);
									if(typeof $scope.fileIds !== "undefined") {
				    					$scope.fileIds = $scope.fileIds +","+_json[0].fileId;
					    			} else {
					    				$scope.fileIds = _json[0].fileId;
					    			}
					    			var imgurl = fileUploadUrl+"?rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid="+_json[0].fileId;
					    			var patientImgs = $scope.image_data[a.patients.current.patientId];
					    			if(typeof patientImgs !== "undefined") {
					    					patientImgs.push(imgurl);		
					    			} else {
					    				var _imagedata = [];
					    				_imagedata.push(imgurl);
					    				$scope.image_data[a.patients.current.patientId] = _imagedata;
					    			}
					    			var fids = $scope.fileIds;
					    			$this.insertDocument(fids);
					    			$scope.fileIds = "";
					    			a.patientDetails.imagesrefresh = false;
				    			});
				    		},
				    		failure : function(error) {
								Logger.showError(error);
		    				}
						});
	}

	$scope.safeApply = function(fn) {
	    var phase = this.$root.$$phase;
	   // Logger.showAlert("***********");
	    if(phase == '$apply' || phase == '$digest') {
		if(fn && (typeof(fn) === 'function')) {
		  fn();
		}
	    } else {
	    	//Logger.showAlert(phase+"****** else *****");
	       this.$apply(fn);
	    }
	};

	this.insertDocument = function(fileIds) {
		if(typeof a.patients.current.uploadDocIds !== "undefined") {
			fileIds = fileIds +","+ a.patients.current.uploadDocIds;
		} else {
			a.patients.current.uploadDocIds = "";
		} 
			a.patients.current.uploadDocIds = fileIds;
		RaModel.save({'dataSource':'PatientInfo','operation':'update'}, { "sessionId":Session.get().sessionId,
			  'patientId':a.patients.current.patientId,
			  'userId':  Session.get().userId,
			  'patientName': a.patientDetails.current.patientName,
			  'phone':a.patientDetails.current.phone,
			  'createdBy':a.patientDetails.current.createdBy,
			  'creationDate':a.patientDetails.current.creationDate,
			  'referred':a.patientDetails.current.referred,
			  "facility":a.patientDetails.current.facility,
			  'uploadDocIds':fileIds,
			  'lastUpdateDate': new Date()
		}, function(result){
				if (result.$error) {
					Logger.showAlert(result.errorMessage,result.errorTitle);
				} else {
				}
		});
	};

	$scope.insertComments = function(pid,userid,comments) {
		if(comments === '') return false;
		a.patientComments.loading = true;
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
			});

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
