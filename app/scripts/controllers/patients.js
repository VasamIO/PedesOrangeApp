/*global showAlert:false */
'use strict';
var app = angular.module('SPAApp');
app.controller('PatientDetailCtrl', ['$scope', '$location', 'RaModel', 'Session', 'Cache', 'Menu','Logger', function ($scope, $location, RaModel, Session, Cache, Menu, Logger) {
	Logger.log('PatientDetailCtrl');

	//Demo.setScope($scope);
	//Cache.remove('_a');
	var currentPatient = Cache.get('currentPatient'), a = Cache.get('_a'), c, _limit = 20, $this = this;

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
		a.data = currentPatient;
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
		$scope.a = a;
		$this.patientsQuery();
	};
  
	this.init = function(){
		a = {'pageTitle':'Patients'};
	};

	this.patientsQuery = function(){ 
			RaModel.query({'dataSource':'PatientReferralFormV'}, {'limit':_limit,'offset':a.patients.offset, 'params':{'executeCountSql': 'N'}, 'sessionId':Session.get().sessionId, 'select': ['patientName',	'facility','uploadDocIds','patientId'],'orderBy': '#patientName#'}, function(result){
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

	$scope.getMorepatientDetails = function() {
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
}]);
