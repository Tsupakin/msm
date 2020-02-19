app.appController = function($scope,$http, $filter, $interval){
//scope var
	if ($.cookie("mach_id") == null || $.cookie("mach_id") == '') {
		var mode = prompt("Please set your machine ID:", "2022");
	    if(mode !== "" && mode !== null){
	    	if(mode == 'admin'){ 
	    		mode = '2022';
	        	$.cookie("msm_mode",'admin',{ expires: 365 });
	    	}
	        $scope.machID = mode;
	        $.cookie("mach_id",mode,{ expires: 365 });
	    }
	}
	else{
		$scope.machID = $.cookie("mach_id");
	    $.cookie("mach_id",$.cookie("mach_id"),{ expires: 365 });
	}
	console.log($.cookie("msm_mode"));
	if ($.cookie("msm_mode") == null || $.cookie("msm_mode") != 'admin') {
		$('.adm').addClass('hide');
	}
	else{
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
	}
	$('#mok').hide();

	//$scope.machID = "2028";
	$scope.Waste = {};
	$scope.machName = "";
	$scope.currJobID = null;
	$scope.currJobDesc = "";
	$scope.currJobStatus = null;
	$scope.statusID = "";
	$scope.spdFlag = "";
	$scope.agvStatus = 1;
	$scope.agvCall = false;
	$scope.speedStd = 0;
	$scope.speedCurr = 0;
	$scope.toolID = "";
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
	$scope.First = "ตรวจแผ่นแรก";
				$scope.Proof = "Proof";
				$scope.Standard = "เก็บมาตรฐานสี";
				$scope.Test = "ทดสอบ";


	$scope.waste = {
		list: $.cookie("ws"+$scope.machID) == undefined ? [] : JSON.parse($.cookie("ws"+$scope.machID)),
		counter: $.cookie("qty"+$scope.machID) == undefined ? null : JSON.parse($.cookie("qty"+$scope.machID)),
		numLabel: null,
		wqty: 0,
		cqty: 0,
		clear: function(){
			$scope.waste.list = [];
			$scope.waste.counter = null;
			$.cookie("qty"+$scope.machID, $scope.waste.counter, { expires: 10 });
    		$.cookie("ws"+$scope.machID, angular.toJson($scope.waste.list), { expires: 10 });
		},
		counterChange: function(){
			if($scope.waste.counter > 0){
        		var inx = $scope.waste.list.length+1;
    			if($scope.waste.list.length == 0){
        			$scope.waste.addList({
        				no: inx,
        				chk: null,
        				waste: null,
        				sum: 0,
        				total: inx*$scope.waste.counter,
        				count: inx*$scope.waste.counter
        			});
        		} else{
        			$scope.waste.reCalc();
        		}
        		$.cookie("qty"+$scope.machID, $scope.waste.counter, { expires: 10 });
        		$.cookie("ws"+$scope.machID, angular.toJson($scope.waste.list), { expires: 10 });
    		}
		},
		reCalc: function(val, type){
			var waste = 0;
			$scope.waste.wqty = 0;
			$scope.waste.cqty = 0;
			var inx = parseInt($('.numHeader').html());
    		for (i = 0; i < $scope.waste.list.length; i++) {
    			if(val != null && inx-1 == i && type != 'C'){ 
    				$scope.waste.list[i].waste = parseInt(val); 
    				if($scope.waste.list[i].chk == null) { $scope.waste.list[i].chk = 0; }
    			}
    			if(val != null && inx-1 == i && type == 'C'){ 
    				$scope.waste.list[i].chk = parseInt(val); 
    				if($scope.waste.list[i].waste == null) { $scope.waste.list[i].waste = 0; }
    			}

    			$scope.waste.wqty = $scope.waste.wqty + parseInt($scope.waste.list[i].waste == null ? 0 : $scope.waste.list[i].waste);
    			$scope.waste.cqty = $scope.waste.cqty + parseInt($scope.waste.list[i].chk == null ? 0 : $scope.waste.list[i].chk);

    			waste = waste + parseInt($scope.waste.list[i].waste == null ? 0 : $scope.waste.list[i].waste) + parseInt($scope.waste.list[i].chk == null ? 0 : $scope.waste.list[i].chk);
    			$scope.waste.list[i].sum = waste;
    			$scope.waste.list[i].total = (i+1)*$scope.waste.counter + waste;
        		$scope.waste.list[i].count = (i+1)*$scope.waste.counter;


    			if(val != null && i == ($scope.waste.list.length-1) && parseInt($scope.waste.list[i].waste) >= 0){
        			$scope.waste.addList({
        				no: $scope.waste.list[i].no+1,
        				chk: null,
        				waste: null,
        				sum: waste,
        				total: parseInt((i+2)*$scope.waste.counter) + waste,
        				count: parseInt((i+2)*$scope.waste.counter)
        			});
        			i=1000;
    			}
        	}
    		$.cookie("qty"+$scope.machID, $scope.waste.counter, { expires: 10 });
    		$.cookie("ws"+$scope.machID, angular.toJson($scope.waste.list), { expires: 10 });
		},
		addList: function(obj){
			$scope.waste.list.push(obj);
			setTimeout(function(){	
    			$('input.twnumpad[data-no="'+$scope.waste.list.length+'"]').numpad({
    				onKeypadOpen: function(){
						$('.numHeader').html($scope.waste.numLabel);
						$scope.$apply(function(){});
					},
					onKeypadClose: function(){
						$scope.waste.reCalc($(this).find('.nmpd-display').val());
						$scope.$apply(function(){});
					}
				});
    			$('input.tcnumpad[data-no="'+$scope.waste.list.length+'"]').numpad({
    				onKeypadOpen: function(){
						$('.numHeader').html($scope.waste.numLabel);
						$scope.$apply(function(){});
					},
					onKeypadClose: function(){
						$scope.waste.reCalc($(this).find('.nmpd-display').val(),"C");
						$scope.$apply(function(){});
					}
				});
			},800);
		}

	}


    $scope.loginAd = function(user, pwd, callback){
        var url = '';
        var host = window.location.origin;
        if(host != "http://192.168.100.7") { host = "http://192.168.1.7"; }
        url = host + '/portal/service/ad.ashx?user=' + user + '&pwd=' + pwd;
        $http.get(url).success(function(data){
          if(data == "True"){
            $('#inform-input-user,#inform-input-pass').val('');
            $('#modalLogin').modal('hide');
          }
          else{
            alert('User หรือ Password ไม่ถูกต้อง');
          }
	        if(callback){
	          callback(data);
	        }
        }).error(function(data, status){
          alert("Error status : " + status);
        });
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

	$scope.issue = {
		unit: 0,
		user: '',
		pwd: '',
		act: '',
		toolID: '',
		wdept: '',
		step: '',
		ready: true,
		state: false,
		inproc: false,
		crUser: ''
	};

	$scope.popIssue = function(){
        $('.actid').val('');
        $scope.issue.user = ''; $('#issue-user').val('');
        $scope.issue.pwd = ''; $('#issue-pwd').val('');
		if($scope.issue.state){
			$scope.issue.inproc = true;
			$http({
	            url: $scope.portalHost + "issue.ashx",
	            method: "POST",
	            dataType: 'json',
	            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	            data: $.param({   
	            	fn: 'UpdateWipAct',
	            	job: $scope.currJobID,
	            	step: $scope.issue.step ,
	            	wdept: $scope.issue.wdept ,
	            	tool: $scope.issue.toolID
	            })
	        })
	        .then(function (res) { 
				if(res.data.result == ''){
			        $scope.issue.state = false;
			        $scope.issue.user = '';
			        $scope.issue.pwd = '';
			        $scope.issue.unit = 0;
			        $scope.issue.act = '';
			    }else{
			        alert(res.data.result);
			    }
				$scope.issue.inproc = false;
				$scope.Blink.ClearIssue();
	        });
		}else{
	        $scope.issue.user = '';
	        $scope.issue.pwd = '';
	        $scope.issue.unit = 0;
	        $scope.issue.act = '';
			$('#modalIssue').modal('show');
		}
	}

	$scope.saveIssue = function(){
		// if($scope.issue.user == '' || $scope.issue.pwd == ''){
		// 	$scope.issue.user = $('#issue-user').val();
		// 	$scope.issue.pwd = $('#issue-pwd').val();
		// }
		// if($scope.issue.user == '' || $scope.issue.pwd == '' || $scope.issue.unit.length > 0 || $scope.issue.act == ''){
		// 	alert('ใส่ข้อมูลไม่ครบ');
		// 	return;
		// }
		if($scope.issue.unit.length > 0 || $('#selActid option:selected').text() == ''){
			alert('ใส่ข้อมูลไม่ครบ');
			return;
		}
		//return;
		// $scope.loginAd($scope.issue.user, $scope.issue.pwd, function(data){
		// 	if(data == "True"){
				$scope.issue.inproc = true;
				$http({
		            url: $scope.portalHost + "issue.ashx",
		            method: "POST",
		            dataType: 'json',
		            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		            data: $.param({   
		            	fn: 'SaveWipAct',
		            	job: $scope.currJobID,
		            	step: $scope.issue.step ,
		            	wdept: $scope.issue.wdept ,
		            	tool: $scope.issue.toolID ,
		            	act: $('#selActid').val() ,
		            	type: $scope.statusID == 2 ? 'S' : ($scope.statusID == 3 ? 'R' : '') ,
		            	user: $scope.issue.crUser,
		            	unit: $scope.issue.unit
		            })
		        })
		        .then(function (res) { 
		        	if(res.data.result == ''){
			        	$scope.issue.state = true;
			        }else{
			        	alert(res.data.result);
			        }
					$scope.issue.inproc = false;
					$scope.Blink.Issue();
					$('#modalIssue').modal('hide');
		        });
		// 	}
		// });
	}

	$scope.getIssue = function(){
		$http({
            url: $scope.portalHost + "issue.ashx",
            method: "POST",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({   
            	fn: 'Get',
            	tool: $scope.issue.toolID,
            	wdept: $scope.issue.wdept,
            	step: $scope.issue.step,
            	job: $scope.currJobID
            })
        })
        .then(function (res) { 

        	if(res.data && res.data.length > 0){
        		$scope.issue.state = true;
				$scope.Blink.Issue();
				$('#modalIssue').modal('hide');
        	}else{
        		$scope.issue.state = false;
				$scope.Blink.ClearIssue();
				// $('#modalIssue').modal('hide');
        	}
        });
	}

	$scope.initIssue = function(){
		$http({
            url: $scope.portalHost + "issue.ashx",
            method: "POST",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({   
            	fn: 'GetWip',
            	mach: $scope.machID
            })
        })
        .then(function (res) { 
        	if(res.data.WIP_HEADER){
        		var r = res.data.WIP_HEADER[0];
        		$scope.issue.toolID = r.TOOLS_ID;
        		$scope.issue.wdept = r.WDEPT_ID;
        		$scope.issue.step = r.STEP_ID;
				$scope.issue.crUser = r.CR_USER_ID;
        	}
        	if(!$scope.WIP_ACT){
        		$scope.WIP_ACT = res.data.WIP_ACT;
			}
        	$scope.issue.ready = true;

        	if(res.data.END_TIME && res.data.END_TIME.length > 0){
        		$scope.issue.state = true;
				$scope.Blink.Issue();
				$('#modalIssue').modal('hide');
        	}else{
        		$scope.issue.state = false;
				$scope.Blink.ClearIssue();
				// $('#modalIssue').modal('hide');
        	}

        	$interval(function(){  $scope.getIssue(); }, 3000);
        });
	    
	}


	$scope.updateAgvStatus = function(){
		var status = 1;

		// if($scope.agvStatus == 0){ status = 1; }
		// if($scope.agvStatus == 1 || $scope.agvStatus == 2){ status = 3; }

		// $http({
  //           url: $scope.serviceHost + "Msm/ashx/agv.ashx",
  //           method: "POST",
  //           dataType: 'json',
  //           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //           data: $.param({ fn: 'Update', status: status, mach: $scope.machID })
  //       })
  //       .then(function (res) { 
  //         $scope.agvStatus = parseInt(res.data.result);
  //       });    
  		$scope.agvCall = true;
  		/*$http({
            url: $scope.tcsServer + "req/order/" + $scope.machID,
            method: "POST",
            dataType: 'json',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: $.param({ dest: [
								{ loc: $scope.machID,  op: 'LOAD' },
								{ loc: 'WIP',  op: 'UNLOAD' },
								{ loc: 'stop',  op: 'STOP' }
							]  })
        })
        .then(function (res) { 
        	$scope.agvStatus = data.length;
  			$scope.agvCall = false;
        });*/
		
		$http({
            url: $scope.tcsServer + "api/order/M" + $scope.machID,
            method: "GET",
        })
        .then(function (res) { 
        	$scope.agvStatus = res.data;
  			$scope.agvCall = false;
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
			console.table("TON Data",data);
			$scope.currJobID = data.JOB_INFO[0].CURR_JOB_ID;
			$scope.currJobDesc = data.JOB_INFO[0].CURR_JOB_DESC;
			$scope.speedCurr = parseInt(data.JOB_INFO[0].CURR_SPEED);
			$scope.speedLastUpdate = parseInt(data.SPEED[data.SPEED.length -1].LAST_SEC);
			$scope.currJobStepID = data.JOB_INFO[0].CURR_STEP_ID;
			$scope.currJobStepSeq = data.JOB_INFO[0].CURR_STEP_SEQ;
			$scope.currJobWdept = data.JOB_INFO[0].CURR_WDEPT_ID;
			if($scope.currJobWdept == "3"){
				$scope.Plan = "เป้าหมายการผลิต";
			}

			$scope.todayPlan = data.PLAN;
			$scope.todayPlanReal = data.REAL;
			//console.log("TON " , "$scope.currPlanSetupTime=", $scope.currPlanSetupTime , "$scope.currPlanRunTime=" , $scope.currPlanRunTime  , "$scope.currPlanUseTime=" , $scope.currPlanUseTime );
			$scope.currPlanSetupTime = parseInt(data.JOB_PLAN[0].SETUP_TIME);
			$scope.currPlanRunTime = parseInt(data.JOB_PLAN[0].RUN_TIME);
			$scope.currPlanUseTime = parseInt(data.JOB_PLAN[0].USED_TIME);
			//console.log("TON " , "$scope.currPlanSetupTime=", $scope.currPlanSetupTime , "$scope.currPlanRunTime=" , $scope.currPlanRunTime  , "$scope.currPlanUseTime=" , $scope.currPlanUseTime );
			if(!$scope.currPlanUseTime){ $scope.currPlanUseTime = 0; }
			$scope.speedStd = parseInt((data.JOB_PLAN[0].SPEED == "" ? "0" : data.JOB_PLAN[0].SPEED));
			$scope.spdFlag = data.JOB_PLAN[0].SPEED_FLAG;

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

			$scope.currWalFirst = data.WAL_FIRST;
			$scope.currWalTest = data.WAL_TEST;
			$scope.currWalProof = data.WAL_PROOF;
			$scope.currWalStdColor = data.WAL_STD_COLOR;


			if($scope.currJobID){
				$scope.Svg.InitCurrJob();
				$scope.Svg.DrawCurrJobRuler();
				if($scope.currPlanUseTime != NaN){ $scope.Svg.DrawCurrJobPlan(); }
				$scope.Svg.DrawCurrJobReal();
				$scope.Svg.DrawWalFirst();
				$scope.Svg.DrawWalTest();
				$scope.Svg.DrawWalProof();
				$scope.Svg.DrawWalStdColor();
				$scope.setRedButton();
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
			$('#frameJdesc').attr('src','http://192.168.1.5/jobdetail/job_detail.php?mode=p&job=' + $scope.currJobID);

			$http.get($scope.serviceHost + "Msm/ashx/waste.ashx?fn=GetWasteForm&id=" + $scope.currJobID + "&seq=" + $scope.currJobStepSeq + "&mach=" + $scope.machID + "&step=" + $scope.currJobStepID + "&wdept=" + $scope.currJobWdept).success(function(data){
				var res = data.result;
				$scope.Waste.JOB_STEP = res.JOB_STEP;
				$scope.Waste.WIP_DEPT = res.WIP_DEPT;
				$scope.Waste.MASTER_JOB_STEP = res.MASTER_JOB_STEP;
				$scope.Waste.WIP_TOOLS = res.WIP_TOOLS;
				$scope.Waste.RPRS_CAUSE_GRP = res.RPRS_CAUSE_GRP;
				$scope.Waste.RPRS_CAUSE = res.RPRS_CAUSE;
				$scope.Waste.CAL_STD = res.CAL_STD;
				$scope.Waste.PER_PAPER = '';
				if(res.PER_PAPER != null && res.PER_PAPER.length > 0){
					$scope.Waste.PER_PAPER = res.PER_PAPER[0].UNIT_PER_PAPER;
				}

				$scope.jobWaste = res.WASTE_DATA;
			});


			//$interval(function(){ 
				$scope.initIssue();
			//},3000);
			$scope.createDash();
		}).error(function(data){
			console.log('Error : $http.get ' + url);
		});

		//agv
		$interval(function(){ 
		    $http.get($scope.tcsServer+ "api/chkorder/M" + $scope.machID).success(function(data){
		    	$scope.agvStatus = data;
		    });
		},3000);
	}

	$scope.setRedButton = function()
	{
		$scope.SetRedButton = {
			button_first : false,
			button_test : false,
			button_proof : false,
			button_std_color : false
		};
		$scope.currWalFirst.forEach(el => {
			if (el.CHK1ST_END_DATE == null && el.MIN_ALL_TIME - el.WAL_STD_MIN > 0 ) 
				$scope.SetRedButton.button_first = true;
		});
		
		$scope.currWalTest.forEach(el => {
			if (el.END_DATE == null && el.MIN_ALL_TIME - el.WAL_STD_MIN > 0 ) 
				$scope.SetRedButton.button_test = true;;
		});
		$scope.currWalProof.forEach(el => {
			if (el.END_DATE == null && el.MIN_ALL_TIME - el.WAL_STD_MIN > 0 ) 
				$scope.SetRedButton.button_proof = true;
		});
		$scope.currWalStdColor.forEach(el => {
			if (el.END_DATE == null && el.MIN_ALL_TIME - el.WAL_STD_MIN > 0 ) 
				$scope.SetRedButton.button_std_color = true;;
		});
	}
	$scope.createDash = function(){
		var c6 = $('#content-6').width();
		$('.dashchart').css('width', (c6/2)-30);
		$scope.pwaste = [];
		$scope.calWaste = function(){
			if($scope.pwaste.length == 2){
				if($scope.pwaste[0].name == "ของดี"){
					$scope.pwaste[1].y = parseFloat((($scope.pwaste[1].y / $scope.pwaste[0].y) * 100).toFixed(2));
					$scope.pwaste[0].y = 100 - $scope.pwaste[1].y;
					$scope.pwaste[0].color = "rgba(0, 199, 0,0.7)";
					$scope.pwaste[1].color = "rgba(255, 63, 9,0.7)";
				} else{
					$scope.pwaste[0].y = parseFloat((($scope.pwaste[0].y / $scope.pwaste[1].y) * 100).toFixed(2));
					$scope.pwaste[1].y = 100 - $scope.pwaste[0].y;
					$scope.pwaste[0].color = "rgba(255, 63, 9,0.7)";
					$scope.pwaste[1].color = "rgba(0, 199, 0,0.7)";
				}
			}
		};

		$scope.dchart = {
			title: {
		        text: 'Combination chart'
		    },
		    credits: {
			    enabled: false
			},
			legend: {
				enabled: false,
				padding: 4,
				margin: 6
			},
		    xAxis: {
		        categories: []
		    },
		    yAxis: {
		    	title: {
		    		enabled: false
		    	}
		    },
		    labels: { 
		        items: [{
		            html: '',
		            style: {
		                left: '10px',
		                top: '5px',
		                color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
		            }
		        }]
		    },
		    series: [{
		        type: 'column',
		        name: '',
		        colorByPoint: true,
		        data: [],
		        colors: []
		    }, {
		        type: 'spline',
		        name: '',
		        data: [],
		        marker: {
		            lineWidth: 2,
		            lineColor: Highcharts.getOptions().colors[3],
		            fillColor: 'white'
		        }
		    },{
		        type: 'spline',
		        name: '',
		        data: [],
		        color: "blue",
		        lineWidth: 1,
		        marker: {
		            lineWidth: 1,
		            lineColor: "blue",
		            fillColor: 'white'
		        }
		    }]				
		};
		var d = new Date();

		$http.get($scope.serviceHost + "Msm/ashx/dash.ashx?mode=GetData&month="+(d.getMonth()+1)+"&year="+d.getFullYear()+"&num=7&mach="+$scope.machID+"&cal=SUM").success(function(data){
		
			var day = [], actual = [], target = [], gtarget = [], color = [], actt = [], ntar = [];
			var max = 0;
			var asum = null;
			var tar = null, tam = null;
			var sact = null, star = null;
			var p = jQuery.extend(true,{}, $scope.dchart);

			tar = data[data.length-1].TARGET;

			for(i = 0; i < data.length; i++){
				asum += (data[i].ACTUAL == null ? 0 : data[i].ACTUAL);

				actual.push((i+1) < d.getDate() ? asum : null);
				target.push(data[i].TARGET);
				actt.push(data[i].ACTUAL);

				day.push(data[i].DAY);
				color.push(data[i].ACTUAL < data[i].TARGET ? "red" : "green");

				if(tar != null && data[i].DAY >= d.getDate()){
					var tt = (tar - asum) / ((data.length - d.getDate()) + 1)
					ntar.push(tt > 0 ? tt : null);
				} else { ntar.push(null); }
			}
			p.yAxis.tickAmount = 6;
			p.legend.enabled = true;
			p.xAxis.categories = day;
			p.series[0].data = actual;
			p.series[0].colors = color;
			p.series[0].name = "ผลผลิตสะสม";
			p.series[1].data = target;
			p.series[1].name = "เป้าหมายสะสม";
			p.series[2].data = actt;
			p.series[2].name = "จำนวนผลิต";

			$scope.pwaste.push({
	            name: "ของดี",
	            y: asum
	        }); $scope.calWaste();

			p.series.push({
		        type: 'spline',
		        name: 'เป้าหมาย',
		        data: ntar,
		        color: "orange",
		        marker: {
		            lineWidth: 1,
		            lineColor: "orange",
		            fillColor: 'white'
		        }
		    },{
			        type: 'pie',
			        name: '% เสียหาย',
			        data: $scope.pwaste,
			        center: ["5%", "60%"],
			        size: 70,
			        showInLegend: false,
			        dataLabels: {
			            enabled: false
			     	}
			    });
			//p.yAxis.max = max;
			p.labels.items[0].html = "Actual: " + $filter('number')(asum, 0) + " <br>Target: " + $filter('number')(tar, 0);
			p.labels.items.push({
	            html: '% Waste',
	            style: {
	                left: '20%',
	                top: '88%',
	                color: 'black'
	            }
	        });

			p.title.text = "Output";
			$('#dashchart1').highcharts(p);
		});

		$http.get($scope.serviceHost + "Msm/ashx/dash.ashx?mode=OracleExecute&month="+pad(d.getMonth()+1,2)+"&year="+d.getFullYear()+"&num=WASTE_DESC_BY_MACH&mach="+$scope.machID).success(function(data){
			var sum = 0;
			var p = jQuery.extend(true,{}, $scope.dchart);
			var label = [], val = [], color = [];
			
			for(i = 0; i < data.length; i++){
				label.push(data[i].WASTE_DESC);
				val.push(data[i].REJECT_QTY);
				sum += data[i].REJECT_QTY;
				color.push("red");
			}
			p.xAxis.categories = label;
			p.series[0].data = val;
			p.series[0].colors = color;
			p.series[0].name = "จำนวนเสียหาย";
			p.labels.items[0].html = "ของเสียรวม: " + $filter('number')(sum, 0);
			p.title.text = "ของเสียและสาเหตุ";

			$scope.pwaste.push({
	            name: "ของเสีย",
	            y: sum
	        }); $scope.calWaste();

			$http.get($scope.serviceHost + "Msm/ashx/dash.ashx?mode=OracleExecute&month="+pad(d.getMonth()+1,2)+"&year="+d.getFullYear()+"&num=WASTE_CAUSE_BY_MACH&mach="+$scope.machID).success(function(data){
				var sum = 0, cause = [];
				for(i = 0; i < data.length; i++){
					sum += data[i].REJECT_QTY;
				}
				for(i = 0; i < data.length; i++){
					cause.push({
			            name: data[i].CAUSE_DESC,
			            y: (data[i].REJECT_QTY / sum) * 100
			        });
				}

				p.series.push({
			        type: 'pie',
			        name: '% สาเหตุ',
			        data: cause,
			        center: ["77%", 0],
			        size: 85,
			        showInLegend: false,
			        dataLabels: {
			            enabled: true
			     	}
			    });
				$('#dashchart2').highcharts(p);
			});
		});

		$http.get($scope.serviceHost + "Msm/ashx/dash.ashx?mode=OracleExecute&month="+(d.getMonth()+1)+"&year="+d.getFullYear()+"&num=OEE_APQ&mach="+$scope.machID).success(function(data){
			
			var obj = jQuery.extend(true,{}, $scope.dchart);
			var label = [], a = [], p = [], q = [], oee = [], ai = [], pi = [], oeei = [];
			
			for(i = 0; i < data.length; i++){
				label.push(data[i].DAY);
				a.push(data[i].A);
				p.push(data[i].P);
				q.push(data[i].Q);
				oee.push(data[i].OEE);
				ai.push(data[i].A_INTER);
				pi.push(data[i].P_INTER);
				oeei.push(data[i].OEE_INTER);
			}

			obj.xAxis.categories = label;
			obj.series = [
				{ type: 'column', name: 'OEE', data: oee, color: "#4F52FF" },
				{ type: 'spline', name: 'A', data: a, color: "#7F3426" },
				{ type: 'spline', name: 'P', data: p, color: "#FF9922" },
				{ type: 'spline', name: 'Q', data: q, color: "#2A4A30" }
			];
			obj.yAxis.max = 100;
			obj.legend.enabled = true;
			obj.title.text = "OEE, A, P, Q";
			$('#dashchart3').highcharts(obj);

			var obj2 = jQuery.extend(true,{}, $scope.dchart);
			obj2.xAxis.categories = label;
			obj2.series = [
				{ type: 'column', name: 'OEE Internal', data: oeei, color: "#4F52FF" },
				{ type: 'spline', name: 'A Internal', data: ai, color: "#7F3426" },
				{ type: 'spline', name: 'P Internal', data: pi, color: "#FF9922" },
			];
			obj2.yAxis.max = 100;
			obj2.legend.enabled = true;
			obj2.title.text = "OEE, A, P (Internal)";
			$('#dashchart4').highcharts(obj2);
		});
	}

//
//$watch
	$scope.$watch('t1.Wdept', function(newVal, oldVal){ 
		if($scope.Waste.WIP_DEPT != undefined){
			var res = $.grep($scope.Waste.WIP_DEPT, function (e) { return e.WDEPT_ID == newVal; })[0];
			$scope.t1.UnitID = res.UNIT_ID;
		}
	});
	$scope.$watch('t2.Wdept', function(newVal, oldVal){ 
		if($scope.Waste.WIP_DEPT != undefined){
			var res = $.grep($scope.Waste.WIP_DEPT, function (e) { return e.WDEPT_ID == newVal; })[0];
			$scope.t2.UnitID = res.UNIT_ID;
		}
	});
	$scope.$watch('t2.Cal', function(newVal, oldVal){ 
		if($scope.Waste.CAL_STD != undefined){
			var res = $.grep($scope.Waste.CAL_STD, function (e) { return e.CAL_ID == newVal; })[0];
			$scope.t2.Sheet = res.SHEET;
		}
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
  	var blinkIssue = null;
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
  		},
  		Issue: function(){
			clearInterval(blinkIssue); blinkIssue = null;
  			blinkIssue = setInterval(function(){
  				$('#content-section,#menu-section,#side-section').toggleClass('blinkissue');
  			},800);
  		},
  		ClearIssue: function(){
  			if(blinkIssue != null){
  				$('#content-section,#menu-section,#side-section').removeClass('blinkissue');
  				clearInterval(blinkIssue); blinkIssue = null;
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

  	$scope.click_ = function(){
  		
  	}

	function pad(str, max) {
	  if(!str){ str = "0"; }
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}
}