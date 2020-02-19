app.labelController = function($scope){
	//header
	$scope.Title = "Machine Status Monitoring";
	$scope.Version = "v3.8";
	//page 1,2
	$scope.JobID = "เลขที่งาน:";
	$scope.JobDesc = "ชื่องาน:";
	$scope.PerSheet = "ชิ้นต่อแผ่น:";
	$scope.Plan = "แผนการผลิต";
	$scope.PlanNow = "การทำงานจริง";
	$scope.Real = "สถานะปัจจุบัน";
	//Status
	$scope.Disconnect = "Disconnected";
	$scope.Setup = "Setup";
	$scope.Running = "Running";
	//Menu
	$scope.Menu = {
		CurrJob: "งานนี้",
		ToDay: "วันนี้",
		Status: 'สถานะ',
		JobOrder: 'ใบสั่งผลิต',
		Waste: 'พาเลท',
		Dash: 'Dashboard'
	};
}