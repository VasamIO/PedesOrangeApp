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



app.controller('PhyFormCtrl', ['$scope', '$location', 'Menu','Logger','Session','RaModel', function ($scope, $location,  Menu,Logger,Session,RaModel) {
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

	$scope.order = function() {//alert("*********"+$scope.pname+"*********");
		
	/*
		Validations Rules 
		================= 
	 1. Should select one of the optionts in Arterial , Venous
	 2. Should select one fo the following options 
		{ 	Ultrasound & Consulation 
		 	Venogram with possible intervention
		 	Other	
			Angiogram with possible intervention
		}
	 3. User should select one fo the following options
	     {
			 Claudication
			 Decreased/Absent Pulses
			 DVT
			 Pain
			 Post Intervention Evaluation  
			 PVD
			 Swelling/Edema
			 Ulcer/Non-Healing Wound
			 Varicose Veins
			 Others
	     }	
	*/


console.log("************"+$scope.facility);
//Logger.showAlert(,"Error");
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
	$scope.openCamera = function(fileIds,upImgbar) {
		var jsonStr = eval('[{name:"value123",name1:"value345"}]');
		//$scope.fileIds = "20302,20303";
		//alert(jsonStr[0].name+"*********");
	if (!navigator.camera) {
		Logger.showAlert("Camera API is not supported", "Error");
        return;
    }
    var options =   {   quality: 50,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                        encodingType: 0     // 0=JPG 1=PNG
                    };
	
	
	//Logger.showAlert("*******Getting Camera Object********"+navigator.camera);
    navigator.camera.getPicture(function(imageData) {
		//alert("In success ....");        
     //Logger.showAlert(imageData+"--------------");
     		uploadFile(imageData,fileIds,upImgbar);    
		//alert("Fiel UPloaded...");        
        },
        function() {
            Logger.showAlert('Error taking picture', 'Error');
        },
        options);
	};


	function uploadFile (mediaFile,fileIds,upImgbar) {
		
		$scope.uploadingimages = true;
	    var path = mediaFile;
	    var name = mediaFile;
	    var options = {};
	    options.fileKey="file";
	    options.fileName="patientinfo.JPG";
	    options.mimeType="image/jpeg";
	    var params = new Object();
	    params.sid = Session.get().sessionId;
	    params.name = name;
	    params.ds = "PatientReferralFormV";
	    //alert("**** upload uri:"+mediaFile);
	    options.params = params;
	    options.chunkedMode = false;
	    var uploadServerUrl = fileUploadUrl;
	    var ft = new FileTransfer();
	    ft.upload( mediaFile, uploadServerUrl,
	       	//success
	        function(r) {
	      		var _json  = eval(r.response);
		    	$scope.fileIds = (typeof $scope.fileIds !== "undefined" ?$scope.fileIds:"")+ ","+_json[0].fileId;
		    //	alert("Uploaded ids..."+$scope.fileIds);
		    	$scope.upimages.push(mediaFile);
		    	$scope.uploadingimages = false;
		    }, //failure
		    function(error) {
	            Logger.showError(error);
	        },
	        options
	      );
	}
/*
	this.captureSuccess  = function(mediaFiles) {    
		Logger.showAlert("In CaptuerSuccess");
    	uploadFile(mediaFiles[0]);
	}

	this.captureError = function(error) {
    	var msg = 'An error occurred during capture: ' + error.code;
    	Logger.showError(msg);
	}
*/

/*
	this.uploadFile = function(mediaFile) {
    path = mediaFile.fullPath;
    name = mediaFile.name;
    Logger.showAlert("In uploadFile");
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=mediaFile.name;
    options.mimeType="image/jpeg";

    var params = new Object();
    params.fullpath = path;
    params.name = name;

    options.params = params;
    options.chunkedMode = false;
    var uploadServerUrl = fileUploadUrl + "ds=PatientReferralFormV&sid="+Session.get().sessionId();
    Logger.showAlert("*****Server Url****"+uploadServerUrl);
    var ft = new FileTransfer();
    ft.upload( path, uploadServerUrl,
        function(result) {
			//upload successful    
			Logger.showAlert("Upload successful"+result,"Info");        
        },
        function(error) {
            //upload unsuccessful, error occured while upload. 
            Logger.showError(error);
        },
        options
        );
	}*/
}]);



app.controller('RefFormCtrl', ['$scope', '$location', 'Menu','Logger','Session','RaModel','Cache', function ($scope, $location,  Menu,Logger,Session,RaModel,Cache) {
var s = Cache.get('PatientData');

function init() {
		$scope.s = Cache.get('PatientData') || {'data':{}};
		s = $scope.s;
		s.offset = 0;

	}
	init();
function query (callback){
			RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':20,'offset':s.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'orderBy':  '#creationdate# DESC'}, function(result){
				if (result.$error) {m
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					if (result.data.length > 0) {
						//alert(result.data.length);
						s.elapsed = result.elapsed;
						//alert(s.data);
						s.data.push(result.data);
						Cache.put('PatientData', s.result);
						if (result.data.length < 20) {
							s.hasMore = false;
						} else {
							s.hasMore = true;
						}
						Cache.put('PatientDataHasMore', s.hasMore);
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
		alert("****calling:"+s.offset);
		query();
	};
	
	$scope.back = function() {
		$location.path('/');
	};

}]);



app.controller('PatientDetailCtrl', ['$scope','$http' ,'$location', '$window','RaModel', 'Session', 'Cache', 'Menu','Logger', function ($scope, $http,$location,$window, RaModel, Session, Cache, Menu, Logger) {
	Logger.log('PatientDetailCtrl');

	//Demo.setScope($scope);
	//Cache.remove('_a');
	var currPatient = Cache.get('currPatient'), a = Cache.get('_a'), c, _limit = 20, $this = this;
	$scope.image_data  = {};
	$scope.nodocuments = true;
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
		//a.patientDetails.imagesloading
		$scope.a = a;
		$this.patientsQuery();
	};
  
	this.init = function(){
		a = {'pageTitle':'Account'};
	};

	this.patientsQuery = function(){
			a.patients.loading = true;	 
			RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patients.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['patientName',	'facility','physicianName','creationDate','patientId','uploadDocIds'],'orderBy': '#creationDate# DESC'}, function(result){
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
	$scope.$watch('a.patients.current', function(a, o){
		Logger.log(o + '->' + a);
		if (o){
			Logger.log(o.patientId + ',' + o.facility + ', ' + o.state + ' ' + o.postalCode);
		}
		if (a){
			$scope.a.pageTitle = 'Patient Details';
			Logger.log(a.patientId +  ',' + a.city + ', ' + a.state + ' ' + a.postalCode);
			
			$this.patientDetailsQuery(a.patientId);
			//alert("*****"+o.patientName + ":"+a.patientName);
			//$this.codeAddress();
		}
	}, true);

	/* Start Patient Details */
	this.patientDetailsQueryInternal = function(pid){
		
		RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patientDetails.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId,'data' :{'patientId':pid}}, function(result){
				
				if (result.$error) {
					Logger.showAlert(result.errorMessage, result.errorTitle);
				} else {
					//alert("****"+result.data.length);
					if (result.data.length > 0) {
						/*var dimgs = [];
						var fileIds = a.patients.current.uploadDocIds;
						var singleResult = result.data[0];
						if(typeof fileIds !== 'undefined' && typeof singleResult.imgs === 'undefined') {
							a.patientDetails.imagesloading = true;
							dimgs = $this.downloadFile(a.patients.current.uploadDocIds,pid);
						}					
						if(dimgs.length > 0) {
							singleResult.imgs = dimgs;
						}*/
						a.patientDetails.data.push.apply(a.patientDetails.data, result.data);
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

		//loading images

				a.patientDetails.imagesloading = true;
				$this.downloadFile(a.patients.current.uploadDocIds,pid);
				
				

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

var _fid ;
var _lc;
this.downloadFile  = function(fid,pid) {
var imagedata = [];
var parentimagedata = {};

parentimagedata.pid = pid;
console.log("Downloading file for ..."+fid);
var params = "rev=1&sid="+Session.get().sessionId+"&ds=PatientReferralFormV&fid=";
	    console.log("downloding url:"+fileUploadUrl+"?"+params);
var count = 1;
var fileIds = [];
if(typeof fid === "undefined") {
	a.patientDetails.imagesloading = false;
	return;
}
if(fid.indexOf(",") > -1) {
	var fileIds = fid.split(",");
	count = fileIds.length;
} else {
	fileIds[0] = fid;
}

for(var c = 0 ; c < count; c++) {
	if(fileIds[c] == "") {
		continue;
	}
	console.log("Download url:"+fileUploadUrl+"?"+params+fileIds[c]);
	  
     _fid = fileIds[c];_lc = c;
     console.log("***"+_fid+"****"+c);
     //(function(_fid,_lc,count,pid){
     	console.log("***"+_fid+"****"+c+"***"+fileUploadUrl+"?"+params+_fid);
    
    /*$http({method: 'GET', url: fileUploadUrl+"?"+params+_fid}).
  		success(function(data, status, headers, config) {
  			console.log("call:"+_lc+" for "+fileUploadUrl+"?"+params+_fid);
  			 var responseText = data;
    var responseTextLen = responseText.length;
    var binary = ''
    for (var j = 0; j < responseTextLen; j+=1) {
        binary += String.fromCharCode(responseText.charCodeAt(j) & 0xff)
    } 
*/
 xhr_object.open('GET', fileUploadUrl+"?"+params+fileIds[c], false);
	xhr_object.send(null);
	//xhr_object.onreadystatechange = function(){
			console.log("calling...");
		if(xhr_object.status == 200){
    var responseText = xhr_object.responseText;
    var responseTextLen = responseText.length;
    var binary = ''
    for (var j = 0; j < responseTextLen; j+=1) {
        binary += String.fromCharCode(responseText.charCodeAt(j) & 0xff)
    } 
   imagedata.push('data:image/jpeg;base64,' + window.btoa(binary));
  // a.patientDetails.imagesloading = false;
  // parentimagedata.pid = pid;
	//	parentimagedata.imgs = imagedata;
		

/*var _copyimagedata = $scope.image_data[pid];
console.log("********"+_copyimagedata);
if(typeof _copyimagedata !== "undefined") {
	console.log("*** Got eixting image***"+_copyimagedata)
}
$scope.image_data[pid] = imagedata;
		console.log($scope.image_data);
*/   /* 
    if(_lc  === (count - 1 )) {
    	parentimagedata.pid = pid;
		parentimagedata.imgs = imagedata;
		
		$scope.image_data = [pid,parentimagedata];
 	}*/
 }
	
//}


}
$scope.image_data[pid] = imagedata;
console.log($scope.image_data);
$scope.nodocuments = false;
a.patientDetails.imagesloading = false;
    // this callback will be called asynchronously
    // when the response is available
  /*}).
  error(function(data, status, headers, config) {
  	Logger.showError(data);
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });*/
 // })(_fid,_lc,count,pid);
    //alert(binary + " for "+ fileIds[c]);

	

//return imagedata;
}




var xhr_object = new XMLHttpRequest();

xhr_object.overrideMimeType('text/plain; charset=x-user-defined');

}]);
