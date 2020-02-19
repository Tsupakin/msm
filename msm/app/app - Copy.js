app.appController = function($scope,$http){
//scope var
	// if ($.cookie("mach_id") == null || $.cookie("mach_id") == '') {
	// 	var mode = prompt("Please set your machine ID:", "2022");
	//     if(mode !== "" && mode !== null){
	//     	if(mode == 'admin'){ 
	//     		mode = '2022';
	//         	$.cookie("msm_mode",'admin',{ expires: 365 });
	//     	}
	//         $scope.machID = mode;
	//         $.cookie("mach_id",mode,{ expires: 365 });
	//     }
	// }
	// else{
	// 	$scope.machID = $.cookie("mach_id");
	//     $.cookie("mach_id",$.cookie("mach_id"),{ expires: 365 });
	// }
	// if ($.cookie("msm_mode") == null || $.cookie("msm_mode") != 'admin') {
	// 	$('.adm').addClass('hide');
	// }
	// 
	
	//else{
		var url = $scope.serviceHost + "Msm/ashx/mach.ashx";
		$http.get(url).success(function(data){
			var tab = $('.tab-content .tab-pane');
			for(i = 0; i < tab.length; i++){
				var find = jQuery.grep(data, function (d) { return d.WDEPT_ID == tab.eq(i).data('val'); });
				var html = '';

				for(ii = 0; ii < find.length; ii++){
					html += '<div class="col-xs-6">' +
							 	'<div class="hi-icon3-wrap hi-icon3-effect-1 hi-icon3-effect-1a machine" id="' + find[ii].MACH_ID + '">' +
							 		'<i class="fa fa-gear hi-icon3"></i>' + find[ii].MACH_ID + ' : ' + find[ii].MACH_NAME + '</div></div>';
				}
				tab.eq(i).find('div.row').html(html);
			}
		});
	//}
	$('#mok').hide();

	//$scope.machID = "2028";
	$scope.Waste = {};
	$scope.machName = "";
	$scope.currJobID = null;
	$scope.currJobDesc = "";
	$scope.currJobStatus = null;
	$scope.statusID = "";
	$scope.speedStd = 0;
	$scope.speedCurr = 0;
	$scope.speedLastUpdate = "";
	$scope.machSDID = 0;
	$scope.machSDName = ["Disconnect","แก้ปัญหา","Setup", "Running","รองานถัดไป"]; 
	$scope.machSDLabel = "";
	$scope.currPlanSetupTime = 0;
	$scope.currStartTime = "";
	$scope.stopAlert = 0;
	$scope.speedAvg = "";
	$scope.doneTime = "";
	$scope.todayPlan = null;
	$scope.todayPlanReal = null;
	$scope.overtime = false;
	$scope.overMinDisplay = "";
	$scope.jobWaste = [];
	$scope.setup = {
		real: "",
		plan: ""
	};
	$scope.Per100 = [1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95];

	$scope.class = {
		speedAvg: "hide",
		doneTime: "hide"
	};

	$scope.t1 = {
		Wdept:'',
		Step:'',
		ToolID:'',
		CauseID:'',
		RejQty:'',
		Retsub:'',
		Waste:''
	};
	$scope.t2 = {
		Wdept:'',
		Step:'',
		ToolID:'',
		CauseID:'',
		RejQty:'',
		Retsub:'',
		Split:'',
		Cal:'',
		Pallet:'',
		SubPallet:'',
		RejHeight:'',
		ExpUnit:'',
		Per100:''
	};

	$scope.addWaste = function(){
		var data = {};
		if($('#wred').hasClass('active')){
			if($scope.machID == '' || $scope.currJobID == '' || $scope.currJobStepID == '' || $scope.t1.Wdept == ''
			 || $scope.t1.Step == '' || $scope.t1.ToolID == '' || $scope.t1.Waste == '' || $scope.t1.RejQty == ''
			 || $scope.t1.RejQty <= 0)
			{ alert('ระบุข้อมูลไม่ครบ หรือไม่ถูกต้อง'); return;}

			data = {
				in_mach_id: $scope.machID,
				in_job_id: $scope.currJobID,
				in_step_id: $scope.currJobStepID,
				unit_id: $scope.t1.UnitID,
				step_id: $scope.t1.Step,
				tools_id: $scope.t1.ToolID,
				waste_code: $scope.t1.Waste,
				split_job_qty:"-",
				retsub_flag: ($scope.t1.Retsub ? 'T' : 'F'),
				expect_unit: '',
				reject_qty: $scope.t1.RejQty,
				cal_id:'',
				pallet:'',
				sub_pallet:'',
				reject_height:'',
				expect_unit:'',
				split_job_per100:''
			};
		}
		if($('#whold').hasClass('active')){
			if($scope.machID == '' || $scope.currJobID == '' || $scope.currJobStepID == '' || $scope.t1.Wdept == ''
			 || $scope.t1.Step == '' || $scope.t1.ToolID == '' || $scope.t1.Waste == '' || $scope.t1.RejQty == ''
			 || $scope.t1.RejQty <= 0)
			{ alert('ระบุข้อมูลไม่ครบ หรือไม่ถูกต้อง'); return;}

			data = {
				in_mach_id: $scope.machID,
				in_job_id: $scope.currJobID,
				in_step_id: $scope.currJobStepID,
				unit_id: $scope.t1.UnitID,
				step_id: $scope.t1.Step,
				tools_id: $scope.t1.ToolID,
				waste_code: $scope.t1.Waste,
				split_job_qty:"4",
				retsub_flag: 'F',
				expect_unit: '',
				reject_qty: $scope.t1.RejQty,
				cal_id:'',
				pallet:'',
				sub_pallet:'',
				reject_height:'',
				expect_unit:'',
				split_job_per100:''
			};
		}
		if($('#wgreen').hasClass('active')){
			if($scope.machID == '' || $scope.currJobID == '' || $scope.currJobStepID == '' || $scope.t2.Wdept == ''
			 || $scope.t2.Step == '' || $scope.t2.ToolID == '' || $scope.t2.Waste == '' || $scope.t2.Split == '' || $scope.t2.Cal == ''
			 || $scope.t2.ExpUnit == '' || $scope.t2.ExpUnit == null || $scope.t2.ExpUnit <= 0
			 || $scope.t2.Pallet == '' || $scope.t2.Pallet == null || $scope.t2.Pallet <= 0
			 || $scope.t2.SubPallet < 0
			 || $scope.t2.RejHeight == '' || $scope.t2.RejHeight == null || $scope.t2.RejHeight <= 0
			 || ($scope.t2.Split == '2' && ($scope.t2.Per100 == '' || $scope.t2.Per100 == null || $scope.t2.Per100 <= 0)))
			{ alert('ระบุข้อมูลไม่ครบ หรือไม่ถูกต้อง'); return;}

			data = {
				in_mach_id: $scope.machID,
				in_job_id: $scope.currJobID,
				in_step_id: $scope.currJobStepID,
				unit_id: $scope.t2.UnitID,
				step_id: $scope.t2.Step,
				tools_id: $scope.t2.ToolID,
				waste_code: $scope.t2.Waste,
				split_job_qty: $scope.t2.Split,
				retsub_flag: ($scope.t2.Retsub ? 'T' : 'F'),
				expect_unit: $scope.t2.ExpUnit,
				reject_qty: ($scope.t2.Split == '2' ? ($scope.t2.RejHeight * $scope.t2.Sheet * ($scope.t2.ExpUnit / $scope.Waste.PER_PAPER) * (100 - $scope.t2.Per100) / 100).toFixed(1) 
													: ($scope.t2.RejHeight * $scope.t2.Sheet * ($scope.t2.ExpUnit / $scope.Waste.PER_PAPER).toFixed(1))
							),
				cal_id:$scope.t2.Cal,
				pallet:$scope.t2.Pallet,
				sub_pallet: ($scope.t2.SubPallet == '' || $scope.t2.SubPallet == null ? '0' : $scope.t2.SubPallet),
				reject_height:$scope.t2.RejHeight.toFixed(1),
				split_job_per100:$scope.t2.Per100
			};
		}

		$http({
            url: $scope.serviceHost + "Msm/ashx/waste.ashx",
            method: "POST",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({ fn: 'SaveWaste', param: angular.toJson(data) })
        })
        .then(function (res) { 
        	if(res.data.result.length == 15){
        		data.gen_pk = res.data.result;
				$scope.jobWaste.push(data);

				$scope.t1.Waste = 
				$scope.t1.RejQty = 
				$scope.t1.Retsub = 
				$scope.t2.Waste = 
				$scope.t2.RejHeight = 
				$scope.t2.Retsub = 
				$scope.t2.Split = 
				$scope.t2.Per100 = 			
				$scope.t2.Pallet = 
				$scope.t2.SubPallet = 
				$scope.t2.ExpUnit = "";
			}
        });
	};

	$scope.colorLabel = function(lb){
		if(lb == '-'){
			return '<div class="btn btn-danger"> </div>';
		}else if(lb == '4'){
			return '<div class="btn btn-warning"> </div>';
		}else{
			return '<div class="btn btn-success"> </div>';
		}
	};
	$scope.delWaste = function(){
		var inx = $('tr.sel').index();
		$http({
            url: $scope.serviceHost + "Msm/ashx/waste.ashx",
            method: "POST",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({ fn: 'DelWaste', param: angular.toJson($scope.jobWaste[inx]) })
        })
        .then(function (res) { 
  			$scope.jobWaste.splice(inx, 1); 
        });    
	};

	$scope.get = {
		waste : function(id){
			var res = $.grep($scope.Waste.RPRS_CAUSE, function (e) { return e.WASTE_CODE == id; })[0];
			return res.WASTE_CODE + ' ' + res.WASTE_DESC;
		},
		unit : function(id){
			var res = $.grep($scope.Waste.WIP_DEPT, function (e) { return e.UNIT_ID == id; })[0];
			return res.WDEPT_DESC;
		}
	};

//
//InitLoad
	$scope.InitLoad = function(){
		var url = $scope.serviceHost + "Msm/ashx/init.ashx?mach=" + $scope.machID;
		$http.get(url).success(function(data){
			Highcharts.setOptions(Highcharts.theme);

			$scope.currJobID = data.JOB_INFO[0].CURR_JOB_ID;
			$scope.currJobDesc = data.JOB_INFO[0].CURR_JOB_DESC;
			$scope.speedCurr = parseInt(data.JOB_INFO[0].CURR_SPEED);
			$scope.speedLastUpdate = parseInt(data.SPEED[data.SPEED.length -1].LAST_SEC);
			$scope.currJobStepID = data.JOB_INFO[0].CURR_STEP_ID;
			$scope.currJobStepSeq = data.JOB_INFO[0].CURR_STEP_SEQ;
			$scope.currJobWdept = data.JOB_INFO[0].CURR_WDEPT_ID;

			$scope.todayPlan = data.PLAN;
			$scope.todayPlanReal = data.REAL;

			$scope.currPlanSetupTime = parseInt(data.JOB_PLAN[0].SETUP_TIME);
			$scope.currPlanRunTime = parseInt(data.JOB_PLAN[0].RUN_TIME);
			$scope.currPlanUseTime = parseInt(data.JOB_PLAN[0].USED_TIME);
			if(!$scope.currPlanUseTime){ $scope.currPlanUseTime = 0; }
			$scope.speedStd = parseInt((data.JOB_PLAN[0].SPEED == "" ? "0" : data.JOB_PLAN[0].SPEED));

			$scope.currRealSetupTime = parseInt(data.JOB_REAL[0].SETUP_TIME);
			$scope.currRealRunTime = parseInt(data.JOB_REAL[0].RUN_TIME);
			$scope.currRealUseTime = $scope.currRealSetupTime + $scope.currRealRunTime;
			$scope.currStartTime = data.JOB_REAL[0].START_JOB_TIME;
			$scope.scaleNumMin = ($scope.currRealUseTime > $scope.currPlanUseTime ? $scope.currRealUseTime : $scope.currPlanUseTime);
			$scope.setupEnd = data.JOB_REAL[0].END_TIME;
			if($scope.setupEnd == ""){
				var bal = $scope.currPlanSetupTime - $scope.currRealSetupTime;
				var d = new Date();
				d = new Date(d.getTime() + bal * 60000);
				$scope.setupEnd = pad(d.getHours(),2) + ':' + pad(d.getMinutes(),2);
			}

			$scope.SpeedHis = data.SPEED;
			$scope.statusID = data.JOB_REAL[0].STATUS;
			$scope.stopAlert = parseInt(data.SPEED_LAST[0].LAST_UPDATE);

			if($scope.currJobID){
				$scope.Svg.InitCurrJob();
				$scope.Svg.DrawCurrJobRuler();
				if($scope.currPlanUseTime != NaN){ $scope.Svg.DrawCurrJobPlan(); }
				$scope.Svg.DrawCurrJobReal();
			}

	    	$scope.Svg.InitJobToday();
	    	$scope.Svg.DrawJobTodayRuler();
			$scope.Svg.DrawJobTodayPlan();
			$scope.Svg.DrawJobTodayPlanReal();
			$scope.Svg.DrawJobTodayReal();
			$scope.Chart.InitRunning($scope.speedStd);
			$scope.Graph.DrawSpeedGraph();
        	$scope.SignalR.Connected();

        	 // $('.currJobBar').hide();
			$('#frameStatus').attr('src','http://192.168.1.37/status' + $scope.machID + '.php');
			$('#frameJdesc').attr('src','http://192.168.1.37/jobdetail/job_detail.php?mode=p&job=' + $scope.currJobID);

			$http.get($scope.serviceHost + "Msm/ashx/waste.ashx?fn=GetWasteForm&id=" + $scope.currJobID + "&seq=" + $scope.currJobStepSeq + "&mach=" + $scope.machID + "&step=" + $scope.currJobStepID).success(function(data){
				var res = data.result;
				$scope.Waste.JOB_STEP = res.JOB_STEP;
				$scope.Waste.WIP_DEPT = res.WIP_DEPT;
				$scope.Waste.MASTER_JOB_STEP = res.MASTER_JOB_STEP;
				$scope.Waste.WIP_TOOLS = res.WIP_TOOLS;
				$scope.Waste.RPRS_CAUSE_GRP = res.RPRS_CAUSE_GRP;
				$scope.Waste.RPRS_CAUSE = res.RPRS_CAUSE;
				$scope.Waste.CAL_STD = res.CAL_STD;
				$scope.Waste.PER_PAPER = '';
				if(res.PER_PAPER.length > 0){
					$scope.Waste.PER_PAPER = res.PER_PAPER[0].UNIT_PER_PAPER;
				}

				$scope.jobWaste = res.WASTE_DATA;
			});
		}).error(function(data){
			console.log('Error : $http.get ' + url);
		});
	}

//
//$watch
	$scope.$watch('t1.Wdept', function(newVal, oldVal){ 
		var res = $.grep($scope.Waste.WIP_DEPT, function (e) { return e.WDEPT_ID == newVal; })[0];
		$scope.t1.UnitID = res.UNIT_ID;
	});
	$scope.$watch('t2.Wdept', function(newVal, oldVal){ 
		var res = $.grep($scope.Waste.WIP_DEPT, function (e) { return e.WDEPT_ID == newVal; })[0];
		$scope.t2.UnitID = res.UNIT_ID;
	});
	$scope.$watch('t2.Cal', function(newVal, oldVal){ 
		var res = $.grep($scope.Waste.CAL_STD, function (e) { return e.CAL_ID == newVal; })[0];
		$scope.t2.Sheet = res.SHEET;
	});

	$scope.$watch('currRealRunTime', function(newVal, oldVal){ if(newVal == oldVal) { return; }
	
		var a = [];
		var t = 0;
		for (var i = $scope.SpeedHis.length - 1; i > -1; i--) {
			if($scope.SpeedHis[i].STATUS == "3") {
				a.push($scope.SpeedHis[i]['CURRENT_SPEED']);
				t++;
			}
			if($scope.SpeedHis[i].STATUS == "2") { i = -100; }
		}

		var avg = a.average();
		var out = (t / 60) * avg;
		var outAvg = avg / t;
		var want = ($scope.currPlanRunTime / 60) * $scope.speedStd;
		if(out > ((want / 4) * 3)){
			var dif = want - out;
			if(dif > 0){
				var timeWant = dif / outAvg;
				var perRun = (t / ($scope.currRealRunTime)) * 100;
				timeWant = (timeWant / perRun) * 100;
				if(timeWant > 1){
					$scope.class.doneTime = "";
					$scope.doneTime = timeWant;
				}
			}
			else{
				$scope.class.doneTime = "hide";
			}
		}
  		if($scope.currRealRunTime > ($scope.currPlanRunTime / 2)){ 
			$scope.class.speedAvg = "";
  			$scope.speedAvg = avg;
  		}
  	});
	$scope.$watch('currJobID', function(newVal, oldVal){ if(newVal == oldVal) { return; }
  		if(newVal == ""){ $scope.statusID = "4"; }
  		if(oldVal != null){ location.reload(); }
  	});
  	$scope.$watch('statusID', function(newVal, oldVal){ if(newVal == oldVal) { return; }
  		var newST = parseInt(newVal);
  		if($scope.currJobID == ""){ newST = 4; }

  		if(newST < 1){
  			newST = 1;
  		}
  		if(newST == 1){
  			if($scope.currJobStatus == null){
	  			$http.get($scope.serviceHost + "Msm/ashx/laststatus.ashx?job=" + $scope.currJobID + "&mach=" + $scope.machID).success(function(data){
				    $scope.machSDID = parseInt(data);
				    $scope.currJobStatus = parseInt(data);
	  				if($scope.machSDID == 3 && $scope.speedCurr < $scope.speedStd){ $scope.Blink.Speed(); }
				}).error(function(data){
					console.log('Error : $http.get ' + url);
				});
			}
			else{
				$scope.machSDID = parseInt($scope.currJobStatus);
	  			if($scope.machSDID == 3 && $scope.speedCurr < $scope.speedStd){ $scope.Blink.Speed(); }
			}
	    }
	    else{
	    	$scope.machSDID = newST;
	    }
  	});
  	$scope.$watch('machSDID', function(newVal, oldVal){ //if(newVal === oldVal) { return; }
  		if($scope.overtime){ return; }
  		$('#side-section > div:not(.cont)').css({display: 'none'});
  		if(newVal == "3") { $('#side-section > div.running').css({display: ''}); }
	    else if(newVal == "2") { 
	    	$scope.Chart.InitSetup(); 
	    	$('#side-section > div.setup').css({display: ''});
	    }
  		//if(newVal != "3"){ clearInterval(blinkSpeed); blinkSpeed = null; }

	    $scope.machSDLabel = $scope.machSDName[parseInt(newVal)];
  	});
//
//Blink
  	var blinkOvertime = null;
  	var blinkSpeed = null;
  	var blinkSetup = null;
  	$scope.Blink = {
  		Overtime: function(){
  			if(blinkOvertime == null){
				clearInterval(blinkSetup); blinkSetup = null;
				clearInterval(blinkSpeed); blinkSpeed = null;
	  			$('#content-section,#menu-section,#side-section').removeClass('blink');
	  			blinkOvertime = setInterval(function(){
	  				$('#content-section,#menu-section,#side-section').toggleClass('blink');
	  			},800);
	  		}
  		},
  		Speed: function(){
  			if(blinkOvertime == null && blinkSpeed == null && $scope.machSDID == 3){
  				clearInterval(blinkSetup); blinkSetup = null;
	  			blinkSpeed = setInterval(function(){
	  				$('#side-section').toggleClass('blink');
	  			},800);
  				console.log("Speed");
	  		}
  		},
  		Setup: function(){
  			if(blinkOvertime == null && blinkSetup == null && $scope.machSDID == 2){
  				clearInterval(blinkSpeed); blinkSpeed = null;
	  			blinkSetup = setInterval(function(){
	  				$('#side-section').toggleClass('blink');
	  			},800);
  				console.log("Setup");
	  		}
  		},
  		ClearOvertime: function(){
  			if(blinkOvertime != null){
	  			clearInterval(blinkOvertime); blinkOvertime = null;
	  			$('#content-section,#menu-section,#side-section').removeClass('blink');
	  			if($scope.speedCurr < $scope.speedStd){
			  		$scope.Blink.Speed();
	  			}
	  		}
  		},
  		ClearSpeed: function(){
  			if(blinkOvertime == null && blinkSpeed != null){
  				$('#side-section').removeClass('blink');
  				clearInterval(blinkSpeed); blinkSpeed = null;
  				console.log("ClearSpeed");
  			}
  		},
  		ClearSetup: function(){
  			if(blinkOvertime == null && blinkSetup != null){
  				$('#side-section').removeClass('blink');
  				clearInterval(blinkSetup); blinkSetup = null;
  				console.log("ClearSetup");
  			}
  		}
  	}
  	$scope.$watch('speedCurr', function(newVal, oldVal){ 
  		//if($scope.machSDID != 2){
	  		if($scope.speedCurr >= $scope.speedStd){ $scope.Blink.ClearSpeed(); }
	  		else if(blinkSpeed == null){ $scope.Blink.Speed(); }
	  	//}
  	});
  	$scope.$watch('speedStd', function(newVal, oldVal){ 
  		if($scope.machSDID != 2){
	  		if($scope.speedCurr >= $scope.speedStd){ $scope.Blink.ClearSpeed(); }
	  		else if(blinkSpeed == null){ $scope.Blink.Speed(); }
	  	}
  	});
  	$scope.$watch('overtime', function(newVal, oldVal){ if(newVal == oldVal) { return; }
	  	if(newVal && blinkOvertime == null){ 
	  		$scope.Blink.Overtime(); 
	  		$('#side-section > div:not(.cont)').css({display: 'none'});
	  		$('#side-section > div.inform').show({display: ''});
	  		$scope.machSDLabel = $scope.machSDName[1];
	  	}
	  	else if(blinkOvertime != null){ 
	  		$scope.Blink.ClearOvertime(); 

	  		$('#side-section > div:not(.cont)').css({display: 'none'});
	  		if($scope.statusID == "3") { $('#side-section > div.running').css({display: ''}); }
		    else if($scope.statusID == "2") { 
		    	$scope.Chart.InitSetup(); 
		    	$('#side-section > div.setup').css({display: ''});
		    }
	  		$scope.machSDLabel = $scope.machSDName[$scope.statusID];

	  	}
  	});
  	$scope.$watch('currRealSetupTime', function(newVal, oldVal){ 
  		if($scope.machSDID == 2){
	  		if($scope.currRealSetupTime <= $scope.currPlanSetupTime){ $scope.Blink.ClearSetup(); }
	  		else if(blinkSetup == null){ $scope.Blink.Setup(); }
	  	}
  	});

	function pad(str, max) {
	  if(!str){ str = "0"; }
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}
}