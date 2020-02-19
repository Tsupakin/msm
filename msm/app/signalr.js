app.signalrController = function($scope,$http){
  var machSDName = ["Disconnect","ปิดเครื่อง","Setup", "Running"]; 
  $scope.stoneCount = 0;
//SignalR
  //$.connection.hub.url = "http://192.168.1.7:28000/signalr";
  $.connection.hub.url = $scope.serviceHost + "signalr";
  proxy = $.connection.msmHub;
  if (proxy) {
     proxy.client.refresh = function () {
        location.reload();
        console.log("TON ");
     }
     proxy.client.recCurrJobInfo = function (jobID, jobDesc,statusID, jobStatusID, currSpeed,lastUpdate,lastStamp,useTime,setTime,runTime,agvStatus) {
        console.log("recCurrJobInfo: " + jobID + ", Speed: " + currSpeed + ", TimeStamp: " + lastStamp + ", Status: " + statusID);
        $scope.$apply(function () {
          $scope.currJobID = jobID;
          $scope.currJobDesc = jobDesc;
          $scope.statusID = jobStatusID;
          $scope.speedCurr = parseInt(currSpeed);
          // $scope.toolID = toolID;
          //$scope.agvStatus = parseInt(agvStatus); //agv
          $scope.Chart.UpdateSpeed(currSpeed);
          console.log("TON currJobID" , $scope.currJobID)
          if($scope.currJobID != ""){ 
            $scope.Svg.DrawCurrJobReal();
            $scope.Svg.DrawFirst(); 
            $scope.Svg.DrawWalFirst();
            $scope.Svg.DrawWalTest();
            $scope.Svg.DrawWalProof();
            $scope.Svg.DrawWalStdColor();
          }
          $scope.Graph.UpdateSpeedGraph(parseInt(lastStamp),parseInt(currSpeed),parseInt(statusID));
          $scope.currRealSetupTime = parseInt(setTime);
          $scope.currRealRunTime = parseInt(runTime);
          $scope.currRealUseTime = $scope.currRealSetupTime + $scope.currRealRunTime;
          if($scope.statusID == "2"){ $scope.Chart.UpdateSetup(); }
          if(statusID == "1") { $scope.stoneCount++; }
          else{ $scope.stoneCount = 0; }

          $scope.Svg.DrawJobTodayReal();

          if(($scope.currRealUseTime + 35) > $scope.scaleNumMin){
            location.reload();
          }
        });
     }

     // $scope.login = function(user, pwd, callback){
     //    var url = '';
     //    var host = window.location.origin;
     //    if(host != "http://192.168.100.7") { host = "http://192.168.1.7"; }
     //    url = host + '/portal/service/ad.ashx?user=' + user + '&pwd=' + pwd;
     //    $http.get(url).success(function(data){
     //      if(data == "True"){
     //        $('#inform-input-user,#inform-input-pass').val('');
     //        $('#modalLogin').modal('hide');
     //        if(callback){
     //          callback();
     //        }
     //      }
     //      else{
     //        alert('User หรือ Password ไม่ถูกต้อง');
     //      }
     //    }).error(function(data, status){
     //      alert("Error status : " + status);
     //    });
     // }

    $(document)
      .on('click','#inform-cancel',function(){
        $('#modalLogin').modal('show');
      })
      .on('click','.btnLogin',function(callback){ //ไม่ได้อยากทำเลย แต่เครื่อง service ดันมี 2 ip แล้วไม่เห็นกันอีก
        $scope.loginAd($('#inform-input-user').val(), $('#inform-input-pass').val(), function(){
            proxy.server.clearAlert($scope.machID,$scope.speedLastUpdate);
        });
      })


    $(window).bind("beforeunload", function() { 
      proxy.server.clearGroup($scope.machID);
    });
    
     proxy.client.updateCurrJob = function (obj) {
        console.log("updateCurrJob");
        $scope.$apply(function () {

        });
     }
     proxy.client.clearAlert = function (val) {
        console.log("clearAlert");
        $scope.$apply(function () {
          $scope.stopAlert = parseInt(val);
          $scope.Graph.ClearAlert();
        });
     }
  }

  $scope.SignalR = {
    Connected: function(){
      $.connection.hub.start()
        .done(function () {
          console.log('Connected');
          proxy.server.joinGroup($scope.machID);
        });
    }
  }

  $.connection.hub.error(function (error) {
    if (error){
      console.log('Connection error: ' + error.message + ' Retrying...');
      setTimeout(function() {
        location.reload();
      }, 5000); 
    }
  });

  $.connection.hub.disconnected(function() {
     console.log('Connection closed. Retrying...');
    //proxy.server.clearGroup($scope.machID);
     setTimeout(function() {
        location.reload();
     }, 3000); 
  });
  //Connected();
}