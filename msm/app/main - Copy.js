app.controller("MainCtrl",function($scope,$http, $filter, $interval){
	$scope.gui = null;

	try{
		$scope.gui = require('nw.gui');
		var exec = require('child_process').exec,child;
		var path = require('path');
		var nwPath = process.execPath;
		$scope.path = path.dirname(nwPath);
		$scope.fs = require('fs');
	}
	catch(err){ }

	var host = window.location.origin; //ไม่ได้อยากทำเลย แต่เครื่อง service ดันมี 2 ip แล้วไม่เห็นกันอีก
	if(host != "http://192.168.100.7") { host = "http://192.168.1.7"; }
	// $scope.serviceHost = "http://localhost:49288/";
	$scope.tcsServer = "http://192.168.1.5:3000/";
	// $scope.serviceHost = "http://192.168.55.6:28000/";
	 $scope.portalHost = "http://portal.kimpai.com/portal/service/msm/";
	//$scope.portalHost = "http://localhost:57539/service/msm/";
	 $scope.serviceHost = host + ":28000/";
	// $scope.serviceHost = "http://localhost:28001/";


	var headHeigth = $('#mach-section').height();
	var mainWidth = $('#title-section').width();
	var mainHeigth = $(window).height() - headHeigth;
	var manuWidth = $('.caption').width();
	var proxy;
  	
	var layout = {
	  	resize : function(){
			$('#side-section').css({height: mainHeigth + "px"});
			$('#content-section').css({width: (mainWidth * $('#content-section > div').length) + "px", height: mainHeigth + "px"});
			$('#content-section > div').css({width: mainWidth + "px", height: mainHeigth + "px"});
			$scope.$apply(function () { $scope.siteWidth = $('#side-section').width(); });
		}
	}

	var map = {17: false, 77: false, 67: false};
	var elePopover = '#chart-jobtoday rect:not(.stroke-dash3,line,.todayReal),' +
                 '#chart-jobtoday text:not(.todayReal)';
	var popover = '#popover';
	$(document)
		.ready(function(){
			$.fn.numpad.defaults.gridTpl = '<table class="table modal-content"></table>';
			$.fn.numpad.defaults.backgroundTpl = '<div class="modal-backdrop in"></div>';
			$.fn.numpad.defaults.displayTpl = '<input type="text" class="form-control" />';
			$.fn.numpad.defaults.buttonNumberTpl =  '<button type="button" class="btn btn-default"></button>';
			$.fn.numpad.defaults.buttonFunctionTpl = '<button type="button" class="btn" style="width: 100%;"></button>';
			$.fn.numpad.defaults.onKeypadCreate = function(){$(this).find('.done').addClass('btn-primary');};
			$('input.wnumpad').numpad({
				onKeypadClose: function(){
					$scope.waste.reCalc(null);
				}
			});
			$('input.twnumpad').numpad({
				onKeypadOpen: function(){
					$('.numHeader').html($scope.waste.numLabel);
					$scope.$apply(function(){});
				},
				onKeypadClose: function(){
					$scope.waste.reCalc($(this).find('.nmpd-display').val());
					$scope.$apply(function(){});
				}
			});
			$('input.tcnumpad').numpad({
				onKeypadOpen: function(){
					$('.numHeader').html($scope.waste.numLabel);
					$scope.$apply(function(){});
				},
				onKeypadClose: function(){
					$scope.waste.reCalc($(this).find('.nmpd-display').val(),"C");
					$scope.$apply(function(){});
				}
			});
			$scope.waste.reCalc(null);
			layout.resize();
			var _href = $(location).attr('href').split('#');
			if(_href.length > 1){
				$('a[href="#' + _href[1] + '"]').click();
			}
			if($scope.gui){ 
				$scope.fs.readFile($scope.path + "\\mach.txt", 'utf8', function(err, data) {
				  	$scope.machID = data
					if(err || $scope.machID == null || $scope.machID == ''){
						$scope.machID = '2022'
					}
					$scope.fs.writeFile($scope.path + "\\mach.txt", $scope.machID, function(err){});
					$scope.InitLoad();
				});
			}
			else{
				if ($.cookie("mach_id") == null || $.cookie("mach_id") == '') {
				    $scope.machID = '2022';
				}
				else{
					$scope.machID = $.cookie("mach_id")
				}
				if($scope.machID == null || $scope.machID == ''){ $scope.machID = '2022'; }
				if($scope.fs) { $scope.fs.writeFile($scope.path + "\\mach.txt", $scope.machID, function(err){}); }
				
				$.cookie("msm_mode",'admin',{ expires: 365,path: '/' });
				$.cookie("mach_id",$scope.machID,{ expires: 365,path: '/' });
				$scope.InitLoad();
			}
  			$('#side-section > div:not(.cont)').css({display: ''});

  			if($scope.machID.substring(0,1) != '2'){
  				$('.status').addClass('hide');
  			}

  			var hash = window.location.hash.replace('#','').replace('/','');
  			//alert(hash);
  			if(hash == "admin"){
  				$.cookie("msm_mode",'admin',{ expires: 365 });
  				window.location.href = window.location.origin + window.location.pathname;
  			}
  			$('#menu-section a#title-' + hash).click();
		})
		.resize(function() {
			layout.resize();
		})
		.on('click','#menu-section a',function(){
			$('#menu-slider').animate({
		        marginLeft : ($(this).index() * manuWidth) + "px"
		     },500);
		     $('#content-section').animate({
		        marginLeft : "-" + ($(this).index() * mainWidth) + "px"
		     },500);
		})
		.on('click','.machine',function(){
	        $.cookie("mach_id",$(this).attr('id'),{ expires: 365 });
			if($scope.gui){ $scope.fs.writeFile($scope.path + "\\mach.txt", $(this).attr('id'), function(err){}); }
			location.reload();
		})
		.on('click','#selMach',function(){
			$('#modalMach').modal('show'); 
			$(this).parents('ul').addClass('hide');
		})
		.on('click','#selMan',function(){
			$('#modalDoc .modal-title').html('คู่มือ'); 
			$('#modalDoc .about').addClass('hide');
			$('#modalDoc .man').removeClass('hide');
			$('#modalDoc').modal('show'); 
			$(this).parents('ul').addClass('hide');
		})
		.on('click','#selAbout',function(){
			$('#modalDoc .modal-title').html('เกี่ยวกับโปรแกรม'); 
			$('#modalDoc .man').addClass('hide');
			$('#modalDoc .about').removeClass('hide');
			$('#modalDoc').modal('show'); 
			$(this).parents('ul').addClass('hide');
		})
		.on('click','#selOutput',function(){
			if($scope.gui){ 
				child = exec($scope.path + '\\production_system.exe KPR$$$550019$$$$$$$$$2022B',function (error, stdout, stderr) {
				    if (error !== null) {
				      alert('exec error: ' + error);
				    }
					$('#selOutput').parents('ul').addClass('hide');
				});
	 		}
		})
		.on('click','.wrow',function(){
			$('tr.sel').removeClass('sel');
			$(this).addClass('sel');
		})
	    .keydown(function(e) {
	        if (e.keyCode in map) {
	            map[e.keyCode] = true;
	            if (map[17] && map[77] && map[67]) {
	                $.cookie("mach_id",'');
	                $.cookie("msm_mode",'');
	                location.reload();
	            }
	        }
	    })
	    .on('mousemove',elePopover,function(e){
	        if($(popover).is(":visible")){
	            $(popover).css({left: (e.pageX - 138) + "px", top: (e.pageY - 215) + "px"});
	        }
	    })
	    .on('mouseover',elePopover,function(e){ ShowPopover($(this)); })
	    .on('mouseleave',elePopover,function(e){
	        $(popover).hide();
	    });

	var issueuser = document.getElementById('issue-user');
    if(!issueuser.VKI_attached) VKI_attach(issueuser);
    var issuepwd = document.getElementById('issue-pwd');
    if(!issuepwd.VKI_attached) VKI_attach(issuepwd);

    var kbUser = document.getElementById('inform-input-user');
    if(!kbUser.VKI_attached) VKI_attach(kbUser);
    var kbPass = document.getElementById('inform-input-pass');
    if(!kbPass.VKI_attached) VKI_attach(kbPass);


	$("#wrapper-inform-window").kendoWindow({
        width: "400px",
        title: "กรุณากรอกรหัสผ่าน",
        visible: false,
        modal: true,
        activate: function(){

        },
        actions: [
            "Close"
        ],                
        close: function(){
            //btnSetting.show();
        },
        resizable: false
    });
    $('#inform-button-password').click(function(){
        //  Check Active Directory password by DAQ-Service.
        var stUser = $("#inform-input-user").val();
        var stPass = $("#inform-input-pass").val();
        if(!stUser || !stPass){
            alert("กรุณาระบุข้อมูลให้ครบถ้วน");
            return;
        }
        var bCorrect = false;
        $.ajax({
            url: '../Server/verify-ad-password.php',
            type: 'POST',
            global: true,      //  If set to false, it will not trigger the ajaxStart event for the call
            async: false,
            data: {
                user: stUser,
                password: stPass
            },
            dataType: "json",
            success: function(data, textStatus, jqXHR){
                if(data){
                    alert(data);
                }
            }
        });
        //  Result
        if(bCorrect){
            CancelInformStatus();
            $('#wrapper-inform-window').data("kendoWindow").close();
        }else{
            alert("รหัสผ่านผิดพลาด");
        }
        $("#inform-input-pass").val("");            //  Clear control.
    });  

	function ShowPopover(e){
        var html = '';
        if(e.is("text")){ html = e.html(); }
        else if(e.is("rect.stroke-dash1")){
            var index = e.index();
            html = e.parent().find('*').eq(index - 2).html();
        }
        else{
            var index = e.index();
            html = e.parent().find('*').eq(index + 1).html();
        }

        var jobData = jQuery.grep($scope.todayPlan, function (d) { return d.JOB_ID == html && d.STEP_ID == e.attr('val'); });
        
        $(popover + ' .popover-title').html('เลขที่งาน: ' + html);
        var ele = $(popover + ' .popover-content');
        if(jobData.length > 0){
	        ele.find('.jdesc').html(jobData[0]['JOB_DESC']);
	        ele.find('.jstep').html(jobData[0]['STEP_DESC']);
	        ele.find('.jsetup').html(jobData[0]['SETUP_TIME']);
	        ele.find('.jrunning').html(jobData[0]['RUN_TIME']);
	        ele.find('.jall').html(jobData[0]['USED_TIME']);
	    }
	    else{
	    	if(ele.find('.jdesc').length > 0){
		        ele.find('.jdesc').html('');
		        ele.find('.jstep').html('');
		        ele.find('.jsetup').html('');
		        ele.find('.jrunning').html('');
		        ele.find('.jall').html('');
		    }
	    }

        $(popover).show();
    }
	app.labelController($scope);
	app.appController($scope,$http,$filter,$interval);
	app.propertiesController($scope);
	app.svgController($scope,$http);
	app.signalrController($scope,$http);
});