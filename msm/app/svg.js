app.svgController = function($scope,$http){
	var curJob = {};
	var jobToday = {};
	var svgCurrJob,svgJobToday;
	$scope.scaleNumMin = 240;
	var minimumPlanHour = 24;
	var planHour = minimumPlanHour;
	$scope.Svg = {
		InitCurrJob: function(){
			scaleNumMin = $scope.scaleNumMin;
			if(scaleNumMin == NaN){ scaleNumMin = 240; }
			var sc = $scope.Svg.GetTickScale(scaleNumMin + 35);
			//ความกว้าง ของ Tag svg 
			curJob.svgWidth = $('#chart-curjob').width();
			//ความสูง ของ Tag svg
		    curJob.svgHeight = 400;
		    curJob.chartMarginX = 50;
		    curJob.chartMarginTop = 10;
		    curJob.chartMarginTop2 = 25;
		    curJob.chartHeight = 32;
		    curJob.labelMarginLeft = 7;
		    curJob.yStartLabel = 21;
		   	//จุดเริ่มต้น แกน X
		    curJob.xStart = 10;
		    //จุดเริ่มต้น แกน Y
		    curJob.y1Start = 55;
		    curJob.y1End = curJob.y1Start + curJob.chartHeight;
		    curJob.y2Start = curJob.y1End + curJob.chartMarginTop2 + 30;
		    curJob.y2End = curJob.y2Start + curJob.chartHeight;
		    curJob.chartWidth = curJob.svgWidth - curJob.chartMarginX;

		    $scope.scaleNumMin = sc.maxData;
		    $scope.secPerPixel = (curJob.svgWidth - 49) / ($scope.scaleNumMin * 60); 

		    curJob.labelAttr = { 
		            "fill": "black",
		            "font-family": "ThaiSarabun",
		            "font-size": 17,
		            "font-weight": "200" 
		    };
		    curJob.chart1Style = {
		            "fill": "#6D96BA",
		            "stroke": "#364b5d",
		            "stroke-width": 1        
		    };
		    curJob.chart2Style = {
		            "fill": "#577894",
		            "stroke": "#2b3c4a",
		            "stroke-width": 1
		    };
		    curJob.chart3Style = {
		            "fill": "#6666b5",
		            "stroke": "#000085",
		            "stroke-width": 1
		    }; 

		    curJob.chart4Style = {
		            "fill": "#C23D3F",
		            "stroke": "#C22227",
		            "stroke-width": 1
		    }; 
		    //  Draw SVG wrapper. 
		    var svgCurjob = d3.select('#chart-curjob').append('svg').attr({
		        width: curJob.svgWidth.toString() + "px",
		        height: curJob.svgHeight
		    });
		    var defs2 = svgCurjob.append("svg:defs");
		    var defs2Pattern1 = defs2.append("svg:pattern")       //  Over plan.
		            .attr({
		                id: "hash2-1",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defs2Pattern1.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#ff4c4c"
		            });
		    var defs2Pattern2 = defs2.append("svg:pattern")       //  Blink on plan.
		            .attr({
		                id: "hash2-2",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defs2Pattern2.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#6666b5"
		            });
		    var defs3Pattern3 = defs2.append("svg:pattern")       //  Blink over plan.
		            .attr({
		                id: "hash2-3",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defs3Pattern3.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#ffb7b7"
		            });             
		    curJob.svg = svgCurjob;
		    curJob.group = curJob.svg.append('g').attr({ });    
		    curJob.plan = null;     //  Plan Rect info.
		    curJob.real = null;     //  Real Rect info.
		},
		DrawCurrJobRuler: function(){
			$('.currRuler').remove();
			var tick = $scope.Svg.GetTickScale($scope.scaleNumMin);
		    var xScale2 = d3.scale.linear()
		                 .domain([0, $scope.scaleNumMin])
		                 .range([curJob.xStart, curJob.xStart + curJob.chartWidth]);
		    var xAxis2 = d3.svg.axis()
		                .scale(xScale2)
		                .orient("top")
		                .tickValues(tick.arrayData)
		                .tickFormat(function(d, i){
		                     return d + "m";
		                });
		    curJob.ruler = curJob.svg.append("g")
		                .attr("class", "axis currRuler")
		                .attr("transform", "translate(0,30)")
		                .call(xAxis2);     
		},
		DrawCurrJobPlan: function(){
			$('.currReal').remove();
			setupTime = $scope.currPlanSetupTime;
			runTime = $scope.currPlanRunTime;
			curJob.plan = null;
			var planObj = {}; 
    		planObj._rect = []; 
    
		    var rectP1 = {};
		    rectP1.xStart = curJob.xStart;
		    rectP1.width = (setupTime) * 60 * $scope.secPerPixel;
		    rectP1.obj = curJob.group.append('rect').attr({
		        x: rectP1.xStart,
		        y: curJob.y1Start,
		        width: rectP1.width,
		        height: curJob.chartHeight,
		        class: "rect currPlan"
		    }).style(curJob.chart1Style);
		    //  Text
		    if(rectP1.width < 110){
		    	//curJob.labelAttr.fill = "rgb(225,225,225)";
		    	curJob.labelAttr.fill = "#666666";
		    }
		    else{
		    	curJob.labelAttr.fill = "#666666";
		    }
		    var minTemp = Math.round(setupTime);
		    rectP1.text = curJob.group.append("text").text(function(){
		        return "Setup: " + minTemp + "m";
		    }).attr({
		        x: (rectP1.xStart + (rectP1.width/2) - 43 < rectP1.xStart + curJob.labelMarginLeft ? rectP1.xStart + curJob.labelMarginLeft : rectP1.xStart + (rectP1.width/2) - 43), //rectP1.xStart + curJob.labelMarginLeft,
		        y: curJob.y1Start + curJob.yStartLabel - 30,
		        class: "currPlan"
		    }).attr(curJob.labelAttr);
		    //planObj._rect.push(rectP1);

		    //  RECT 2 : Draw Run Time Rect.
		    var rectP2 = {};
		    rectP2.xStart = rectP1.xStart + rectP1.width;
		    rectP2.width = runTime * 60 * $scope.secPerPixel;
		    rectP2.obj = curJob.group.append('rect').attr({
		        x: rectP2.xStart,
		        y: curJob.y1Start,
		        width: rectP2.width,
		        height: curJob.chartHeight,
		        class: "rect currPlan"
		    }).style(curJob.chart2Style);
		    //  Text
		    if(rectP2.width < 110){
		    	curJob.labelAttr.fill = "#666666";
		    }
		    else{
		    	curJob.labelAttr.fill = "#666666";
		    }

		    minTemp = Math.round(runTime);
		    rectP2.text = curJob.group.append("text").text(function(){
		        return "Running: " + minTemp + "m";
		    }).attr({
		        x: (rectP2.xStart + (rectP2.width/2) - 43 < rectP2.xStart + curJob.labelMarginLeft ? rectP2.xStart + curJob.labelMarginLeft : rectP2.xStart + (rectP2.width/2) - 43), //curJob.labelMarginLeft,
		        y: curJob.y1Start + curJob.yStartLabel+30,
		        class: "currPlan"
		    }).attr(curJob.labelAttr);
		    planObj._rect.push(rectP2);

		    curJob.plan = planObj;
		},
		DrawCurrJobReal: function(){
			$('.currReal').remove();
			realSetup = $scope.currRealSetupTime;
			realRun = $scope.currRealRunTime;
			curJob.real = null;
			var point = curJob.xStart;
			var planSetup = $scope.currPlanSetupTime;
			var realRunning = {}; 

    		var widthST = (realSetup > planSetup ? planSetup : realSetup); 
    		var widthRN = (realRun > $scope.currPlanRunTime ? $scope.currPlanRunTime : realRun); 
    		var overSetup = realSetup - $scope.currPlanSetupTime;
    		var overRun = realRun - $scope.currPlanRunTime;
    		realRunning._rect = []; 
    	    //
			var rect1 = {};
		    rect1.xStart = point;
		    rect1.min = widthST;
		    rect1.width = rect1.min * 60 * $scope.secPerPixel;
		    rect1.obj = curJob.group.append('rect').attr({
		        x: rect1.xStart,
		        y: curJob.y2Start,
		        width: rect1.width,
		        height: curJob.chartHeight,
		        class: "rect currReal"
		    }).style(curJob.chart1Style); //curJob.chart3Style
    		point = rect1.xStart + rect1.width;

		    if(rect1.width < 110){
		    	//curJob.labelAttr.fill = "rgb(225,225,225)";
		    	curJob.labelAttr.fill = "#666666";
		    }
		    else{
		    	curJob.labelAttr.fill = "#666666";
		    }
		    //  SetUp เกินเวลา ///////////////////////////////////////////////////////////////////
		    //  Rect 2
		    if(overSetup > 0){
		        var rect2 = {};                     //  Reset rect.
		        rect2.xStart = point;
		        rect2.min = overSetup;
		        rect2.width = overSetup * 60 * $scope.secPerPixel;
		        rect2.obj = curJob.group.append('rect').attr({
		            x: rect2.xStart,
		            y: curJob.y2Start,
		            width: rect2.width,
		            height: curJob.chartHeight,
		            class: "rect scurrReal", //troke-dash1 
		            id: "running2",
		            fill: "url(#hash2-1)"
		        }).style(curJob.chart4Style); 
		        rect2.text = "";
		        realRunning._rect.push(rect2);      //  Add Running rect 2
		        point = rect2.xStart + rect2.width;
		    }
		    //  Text
		    var txtc = rect1.xStart + ((rect1.width + (overSetup > 0 ? rect2.width : 0)) / 2)  - 43;
		    minTemp = Math.round(realSetup);
		    rect1.text = curJob.group.append("text").text(function(){
		        return "Setup: " + minTemp + "m";
		    }).attr({
		        x: (txtc < rect1.xStart + curJob.labelMarginLeft ? rect1.xStart + curJob.labelMarginLeft : txtc)  , //rect1.xStart + curJob.labelMarginLeft
		        y: curJob.y2Start + curJob.yStartLabel - 30,
		        class: "currReal"
		    }).attr(curJob.labelAttr);
		    realRunning._rect.push(rect1);

		   

		    // return;
		   //  Run ในเวลา ///////////////////////////////////////////////////////////////////
		    //  Rect 
		    if(widthRN > 0){
		        var rect3 = {};                     //  Reset rect.
		        rect3.xStart = point;
		        rect3.min = widthRN;
		        rect3.width = rect3.min * 60 * $scope.secPerPixel;
		        rect3.obj = curJob.group.append('rect').attr({
		            x: rect3.xStart,
		            y: curJob.y2Start,
		            width: rect3.width,
		            height: curJob.chartHeight,
		            class: "rect currReal",
		            id: "running3"
		        }).style(curJob.chart2Style); //curJob.chart3Style
		        point = rect3.xStart + rect3.width;
		         /////  Run เกินเวลา ///////////////////////////////////////////////////////////////////
			    if(overRun > 0){
			        var rect4 = {};                     //  Reset rect.
			        rect4.xStart = point;
			        rect4.min = overRun;
			        rect4.width = rect4.min * 60 * $scope.secPerPixel;
			        rect4.obj = curJob.group.append('rect').attr({
			            x: rect4.xStart,
			            y: curJob.y2Start,
			            width: rect4.width,
			            height: curJob.chartHeight,
			            class: "rect  currReal", //stroke-dash1
			            id: "running4",
			            fill: "url(#hash2-1)"
			        }).style(curJob.chart4Style);
			        rect4.text = "";
			        realRunning._rect.push(rect4);      //  Add Running rect 4
			        point = rect4.xStart + rect4.width;
			    }
		        //  Text
			    if(rect3.width < 110){
			    	curJob.labelAttr.fill = "#666666";
			    }
			    else{
			    	curJob.labelAttr.fill = "#666666";
			    }


		    	var txtc = rect3.xStart + ((rect3.width + (overRun > 0 ? rect4.width : 0)) / 2)  - 43;
		        var minTemp = Math.round(realRun);
		        rect3.text = curJob.group.append("text").text(function(){
		            return "Running: " + minTemp + "m";
		        }).attr({
		            x: (txtc < rect1.xStart + curJob.labelMarginLeft ? rect3.xStart + curJob.labelMarginLeft : txtc)  ,//rect3.xStart + curJob.labelMarginLeft,
		            y: curJob.y2Start + curJob.yStartLabel + 30,
		        	class: "currReal"
		        }).attr(curJob.labelAttr);
		        realRunning._rect.push(rect3);      //  Add Running rect 3 
		    }

		  

		    if(true){
		        var blink = {};
		        blink.rectMin = 5;
		        blink.rectWidth = 3 * 60 * $scope.secPerPixel;
		        blink.xStart = point;
		        blink.obj = curJob.group.append('rect').attr({
		            x: blink.xStart,
		            y: curJob.y2Start,
		            width: blink.rectWidth,
		            height: curJob.chartHeight,
		            class: "rect stroke-dash2 currReal realblink",
		            fill: "url(#hash2-2)"
		        });
		        curJob.blink = blink; 
		    }

		    curJob.real = realRunning;
			//return;
		  ///////////Draw Line and blink///////////////////////////////////////////////////////////
		  	if($scope.currPlanUseTime){
			    var lineX1, lineY1, lineX2, lineY2;
		        lineY1 = curJob.y2Start;
		        lineY2 = curJob.y1Start + curJob.chartHeight;
		        if(widthST > 0){
		            lineX1 = rect1.xStart + rect1.width;
		            lineX2 = curJob.plan._rect[0].xStart;
		            curJob.line1 = curJob.group.append('line')      //  สร้างเส้น 1
		                .attr({
		                    x1: lineX1,
		                    y1: lineY1,
		                    x2: lineX2,
		                    y2: lineY2,
				            class: "currReal"
		                }).style("stroke", "blue");
		        }
		        if(overSetup > 0){
		            lineX1 = rect2.xStart + rect2.width;//realRunning._rect[2].xStart;
		            lineX2 = curJob.plan._rect[0].xStart;
		            curJob.line2 = curJob.group.append('line')      //  สร้างเส้น 2
		                .attr({
		                    x1: lineX1,
		                    y1: lineY1,
		                    x2: lineX2,
		                    y2: lineY2,
				            class: "currReal"
		                }).style("stroke", "red");
		        }
		        if(widthRN > 0){
		            lineX1 = rect3.xStart + rect3.width;
		            lineX2 = curJob.plan._rect[0].xStart + curJob.plan._rect[0].width;
		            curJob.line3 = curJob.group.append('line')      //  สร้างเส้น 3
		                .attr({
		                    x1: lineX1,
		                    y1: lineY1,
		                    x2: lineX2,
		                    y2: lineY2,
				            class: "currReal"
		                }).style("stroke", "blue");
		        }
		        if(overRun > 0){
		            lineX1 = point;
		            lineX2 = curJob.plan._rect[0].xStart + rect3.width;
		            curJob.line4 = curJob.group.append('line')      //  สร้างเส้น 4
		                .attr({
		                    x1: lineX1,
		                    y1: lineY1,
		                    x2: lineX2,
		                    y2: lineY2,
				            class: "currReal"
		                }).style("stroke", "red");
		        }
		    }
		},
		InitJobToday: function(){
			jobToday.svgWidth = $('#chart-jobtoday').width();
		    jobToday.svgHeight = 200;
		    jobToday.chartMarginX = 50;
		    jobToday.chartMarginTop = 10;
		    jobToday.chartMarginTop2 = 25;
		    jobToday.chartHeight = 32;
		    jobToday.labelMarginLeft = 7;
		    jobToday.yStartLabel = 21;
		    jobToday.scaleNumHour = planHour;
		    jobToday.xStart = 10;
		    jobToday.y1Start = 40;
		    jobToday.y1End = jobToday.y1Start + jobToday.chartHeight;
		    jobToday.y2Start = jobToday.y1End + jobToday.chartMarginTop;
		    jobToday.y2End = jobToday.y2Start + jobToday.chartHeight;
		    jobToday.y3Start = jobToday.y2End + jobToday.chartMarginTop2;
		    jobToday.y3End = jobToday.y3Start + jobToday.chartHeight; 
		    jobToday.chartWidth = jobToday.svgWidth - jobToday.chartMarginX;
		    jobToday.secPerPixel = (jobToday.svgWidth - 46) / (jobToday.scaleNumHour * 60 * 60);        //  46 คือ Padding ความคลาดเคลื่อนของสเกล
		    jobToday.labelAttr = { 
		            fill: "#FFF",
		            "font-family": "ThaiSarabun",
		            "font-size": 17,
		            "font-weight": "200" 
		    };
		    jobToday.chart1Style = {
		            fill: "#6D96BA",
		            stroke: "#364b5d",
		            "stroke-width": 1        
		    };
		    jobToday.chart2Style = {
		            fill: "#577894",
		            stroke: "#2b3c4a",
		            "stroke-width": 1
		    };
		    jobToday.chart3Style = {
		            fill: "#6666b5",
		            stroke: "#000085",
		            "stroke-width": 1
		    }; 
		    //  Draw SVG wrapper. 
		    var svgJobToday = d3.select('#chart-jobtoday').append('svg').attr({
		        width: jobToday.svgWidth.toString() + "px",
		        height: jobToday.svgHeight
		    });

		    

		    var defs = svgJobToday.append("svg:defs");
		    var defsPattern1 = defs.append("svg:pattern")       //  Over plan.
		            .attr({
		                id: "hash1-1",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defsPattern1.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#ff4c4c"
		            });
		    var defsPattern2 = defs.append("svg:pattern")       //  Blink on plan.
		            .attr({
		                id: "hash1-2",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defsPattern2.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#6666b5"
		            });
		    var defsPattern3 = defs.append("svg:pattern")       //  Blink over plan.
		            .attr({
		                id: "hash1-3",
		                width: 4,
		                height: 4,
		                patternUnits: "userSpaceOnUse",
		                patternTransform: "rotate(45)"
		            });
		    defsPattern3.append("rect")
		            .attr({
		                width: 2,
		                height: 4,
		                transform: "translate(0,0)",
		                fill: "#ffb7b7"
		            });             
		    jobToday.svg = svgJobToday;
		    jobToday.group = jobToday.svg.append('g').attr({ });    
		},
		DrawJobTodayRuler: function(){
			$('.todayRuler').remove();
			//var tick = $scope.Svg.GetTickScale($scope.scaleNumMin);
		    var xScale = d3.scale.linear()
		                 .domain([0, 24])
		                 .range([jobToday.xStart, jobToday.xStart + jobToday.chartWidth]);
		    var xAxis = d3.svg.axis()
		                .scale(xScale)
		                .orient("top")
		                //.tickValues(tick.arrayData)
		                .tickFormat(function(d, i){
		                     return d + 'h'; //pad((d > 16 ? d - 17 : d + 7),2);
		                });
		    jobToday.ruler = jobToday.svg.append("g")
		                .attr("class", "axis todayRuler")
		                .attr("transform", "translate(0,30)")
		                .call(xAxis);  
		},
		DrawJobTodayPlan: function(){
			$('.todayPlan').remove();
			jobToday.plan = null;
		    jobToday.plan = $scope.Svg.DrawJobTodayBar($scope.todayPlan,'USED_TIME','todayPlan',jobToday.y1Start,jobToday.chart1Style,false);
		},
		DrawJobTodayPlanReal: function(){
			$('.todaypReal').remove();
			jobToday.planReal = null;
			jobToday.planReal = $scope.Svg.DrawJobTodayBar($scope.todayPlanReal,'USED_TIME','todaypReal',jobToday.y2Start,jobToday.chart2Style,false);
		},
		DrawJobTodayReal: function(){
			$('.todayReal').remove();
			jobToday.real = null;
			jobToday.real = $scope.Svg.DrawJobTodayBar($scope.todayPlanReal,'REAL_USED_TIME','todayReal',jobToday.y3Start,jobToday.chart2Style,true);//chart3Style
		},
		DrawJobTodayBar: function(data,col,clas,y,css,flag){
			var point = jobToday.xStart;
			var planPoint = jobToday.xStart;
			var obj = {}; 
    		obj._rect = []; 

    		for(i = 0;i < data.length; i++){
    			var rect = {};
    			var time = 0;
    			if(flag){
    				if(i == (data.length - 1) && $scope.currJobID != ""){
    					time = ($scope.currRealUseTime > $scope.currPlanUseTime ? $scope.currPlanUseTime : $scope.currRealUseTime);
    				}
    				else{
	    				time = (data[i]['REAL_USED_TIME'] > data[i]['USED_TIME'] ? data[i]['USED_TIME'] : data[i]['REAL_USED_TIME']);
	    			}
    			}
    			else{
    				time = data[i][col];
    			}
    			rect.xStart = point;
    			rect.width = time * 60 * jobToday.secPerPixel;
    			rect.obj = jobToday.group.append('rect').attr({
			        x: rect.xStart,
			        y: y,
			        width: rect.width,
			        height: jobToday.chartHeight,
			        class: "rect " + clas,
			        val: data[i]['STEP_ID']
			    }).style(css);
			    point = point + rect.width;
			    planPoint =  planPoint + data[i]['USED_TIME'] * 60 * jobToday.secPerPixel;

			    var over = 0;
			    if(flag && i == (data.length - 1)){
			    	over = $scope.currRealUseTime - $scope.currPlanUseTime;
			    }
			    else{
			    	over = data[i][col] - data[i]['USED_TIME'];
			    }

			    if(flag && over > 0){
			    	var rectOver = {};
			    	rectOver.xStart = point;
	    			rectOver.width = over * 60 * jobToday.secPerPixel;
	    			rectOver.obj = jobToday.group.append('rect').attr({
				        x: rectOver.xStart,
				        y: y,
				        width: rectOver.width,
				        height: jobToday.chartHeight,
				        class: "rect " + clas, //stroke-dash2 
			            fill: "url(#hash1-1)"
				    }).style(curJob.chart4Style) ;
			    	point = point + rectOver.width;


			    	////////////////////////////////////////////////////////////////////////////
			    	var att = curJob.labelAttr;
				    att.fill = "#525252";
				    att["font-size"] = 14,
				    rect.setupText = jobToday.group.append("text").text(function(){
				        return over + 'm'; //minTemp;
				    }).attr({
				        x: rectOver.xStart + jobToday.labelMarginLeft - 5, //(rectOver.xStart + (rectOver.width / 2) - 26) + jobToday.labelMarginLeft,
				        y: y + jobToday.yStartLabel + 25,
				        class: clas,
				        val: data[i]['STEP_ID']
				    }).attr(att);
				    ////////////////////////////////////////////////////////////////////////////
			    }
			    if(flag && i == (data.length - 1)){
			    	var blink = {};
			        blink.rectMin = 2;
			        blink.rectWidth = 15 * 60 * jobToday.secPerPixel;
			        blink.xStart = point;
			        blink.obj = jobToday.group.append('rect').attr({
			            x: blink.xStart,
			            y: jobToday.y3Start,
			            width: blink.rectWidth,
			            height: jobToday.chartHeight,
			            class: "rect stroke-dash2 realblink " + clas,
			            fill: "url(#hash2-2)"
			        });
			        jobToday.blink = blink; 
			    }
			    //  Text
			    if(rect.width < 66){
			    	jobToday.labelAttr.fill = "rgb(225,225,225)";
			    }
			    else{
			    	jobToday.labelAttr.fill = "#FFF";
			    }

			    var ts = rect.xStart + (rect.width / 2) - 26 + ((flag && over > 0 ? rectOver.width / 2 : 0));
			    var minTemp = data[i].JOB_ID;//Math.round(data[i][col]);
			    rect.text = jobToday.group.append("text").text(function(){
			        return minTemp;
			    }).attr({
			        x: (ts < rect.xStart + jobToday.labelMarginLeft ? rect.xStart + jobToday.labelMarginLeft : ts), //jobToday.labelMarginLeft,
			        y: y + jobToday.yStartLabel,
			        class: clas,
			        val: data[i]['STEP_ID']
			    }).attr(jobToday.labelAttr);

			    ////////////////////////////////////////////////////////////////////////////
			    if(flag){
				    var att = jobToday.labelAttr;
				    att.fill = "#525252";
				    att["font-size"] = 14,
				    rect.setupText = jobToday.group.append("text").text(function(){
				        return time + 'm'; //minTemp;
				    }).attr({
				        x: rect.xStart + jobToday.labelMarginLeft - 5, //(rect.xStart + (rect.width / 2) - 26) + jobToday.labelMarginLeft,
				        y: y + jobToday.yStartLabel + 25,
				        class: clas,
				        val: data[i]['STEP_ID']
				    }).attr(att);
				}
			    jobToday.labelAttr["font-size"] = 17;
			    //////////////////////////////////////////////////////////////////

			    if(flag && data[i]['USED_TIME'] > 0){
			    	var lineX1, lineY1, lineX2, lineY2;
			        lineY1 = jobToday.y3Start;
			        lineY2 = jobToday.y2Start + jobToday.chartHeight;
			        
		            lineX1 = rect.xStart + rect.width;
		            lineX2 = planPoint;
		            jobToday.line1 = jobToday.group.append('line')  
		                .attr({
		                    x1: lineX1,
		                    y1: lineY1,
		                    x2: lineX2,
		                    y2: lineY2,
				            class: "todayReal"
		                }).style("stroke", "blue");
		        	if(over > 0){
		        		lineY1 = jobToday.y3Start;
				        lineY2 = jobToday.y2Start + jobToday.chartHeight;
				        
			            lineX1 = rect.xStart + rect.width + (over * 60 * jobToday.secPerPixel);
			            lineX2 = planPoint;
			            jobToday.line2 = jobToday.group.append('line')
			                .attr({
			                    x1: lineX1,
			                    y1: lineY1,
			                    x2: lineX2,
			                    y2: lineY2,
					            class: "todayReal"
			                }).style("stroke", "red");
		        	}
			    }

			    obj._rect.push(rect);
    		}
			return obj;
		},
		GetTickScale: function(scaleNumMin){
		    var tickVal = [];
		    var count = 0;
		    var max = 0;
		    for(i = 0; i < scaleNumMin + 60; i = i + 60){
		        tickVal.push(i);
		        count++;
		        max = i;
		    }
		    var result ={
				arrayData: tickVal,
				maxData: max
			}
		    return result;
		},
		DrawFirst: function(scaleNumMin){
			realSetup = $scope.currRealSetupTime;
			realRun = $scope.currRealRunTime;
			curJob.real = null;
			var point = curJob.xStart;
			var planSetup = $scope.currPlanSetupTime;
			var realRunning = {}; 

    		var widthST = (realSetup > planSetup ? planSetup : realSetup); 
    		var widthRN = (realRun > $scope.currPlanRunTime ? $scope.currPlanRunTime : realRun); 
    		var overSetup = realSetup - $scope.currPlanSetupTime;
    		var overRun = realRun - $scope.currPlanRunTime;
    		realRunning._rect = []; 
    	    //
			var rect1 = {};
		    rect1.xStart = point;
		    rect1.min = widthST;
		    rect1.width = rect1.min * 60 * $scope.secPerPixel;
		    rect1.obj = curJob.group.append('rect').attr({
		        x: rect1.xStart,
		        y: parseInt(curJob.y2Start) + 70,
		        width: rect1.width,
		        height: curJob.chartHeight - 5,
		        class: "rect wow"
		    }).style(curJob.chart1Style); //curJob.chart3Style
    		point = rect1.xStart + rect1.width;

		}
	}
	var opa = 0;
	setInterval(function(){
		$('rect.realblink').css({ opacity: opa });
		opa = (opa == 1 ? 0 : 1);
	},800);
// Side Chart
	
	
	var maxSetupTimeHour = $scope.Prop.sector;
	var maxSetupTimeMin = maxSetupTimeHour * 60;
	var maxSetupTimeSec = maxSetupTimeMin * 60;
	var maxInformTimeHour = $scope.Prop.sector;
	var maxInformTimeMin = maxInformTimeHour * 60;
	var maxInformTimeSec = maxInformTimeMin * 60;
	var colSetup = ["#90ed7d", "#cb7138", "#e3eef9"];
	var colInform = ["#90ed7d", "#cb7138", "#e3eef9"];
	var speedGraph;
	var inform;

	$scope.Chart = {
		InitRunning: function(){
			//$('#chart-running').html('');
			$('#chart-running').css({ width: '100%', height: '230px' });
			$('#chart-running').highcharts({
		        credits: { enabled: false },
		        exporting: { enabled: false },        
		        chart: $scope.PropSpeed.Chart,
		        title: $scope.PropSpeed.Title,
		        pane: $scope.PropSpeed.Pane,
		        yAxis: $scope.PropSpeed.yAxis($scope.speedStd),
		        series: $scope.PropSpeed.Series  
		    });
		},
		UpdateSpeed: function(val){
		 	var chart = $('#chart-running').highcharts();
		 	if(chart){
	            var point = chart.series[0].points[0];

	            point.update(parseInt(val));
	        }
		},
		InitInform: function(){

			$('#chart-inform').css({ width: $scope.siteWidth, height: $scope.siteWidth });
		    var iPassTime = $scope.overMin * 60;//24000;
		    var iTime1 = iPassTime;
		    var iTime2 = maxInformTimeSec - iPassTime;
		    //var color =  (iPassTime > $scope.currPlanSetupTime ? colSetup[1] :  colSetup[0]);
		    while(iTime2 < 0){
		        iTime1 = -iTime2;
		        iTime2 = maxInformTimeSec - iTime1;
		    }
		    inform = $('#chart-inform').highcharts({
		        credits: { enabled: false },
		        exporting: { enabled: false },         
		        chart: $scope.Inform.Chart,
		        title: $scope.Inform.Title,
		        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
		        plotOptions: $scope.Inform.PlotOptions(iPassTime),
		        series: $scope.Inform.Series(iTime1,iTime2,colSetup)
		    });
		},
		UpdateInform: function(){
			if(inform){
    			inform = $('#chart-inform').highcharts();
			    var iPassTime = $scope.overMin * 60;
			    var iTime1, iTime2;
			    iTime1 = iPassTime;
			    iTime2 = maxSetupTimeSec - iPassTime;     
			    while(iTime2 < 0){
			        iTime1 = -iTime2;
			        iTime2 = maxSetupTimeSec - iTime1;
			    }
			    inform.series[0].data[0].update({ y: iTime1 });
			    inform.series[0].data[1].update({ y: iTime2 });
			    //  Update Indicator
			    var _label = $scope.Func.GenerateNavigatorLabel(iPassTime);
			    d3.select('#indi-top text').text(_label[4] + '/' + _label[0] + 'h');
			    d3.select('#indi-right text').text(_label[1] + 'h');
			    d3.select('#indi-bottom text').text(_label[2] + 'h');
			    d3.select('#indi-left text').text(_label[3] + 'h');
			}
		},
		InitSetup: function(){

			$('#chart-setup').css({ width: $scope.siteWidth, height: $scope.siteWidth });
		    var iSetupTime = $scope.currPlanSetupTime;
		    var iPassTime = $scope.currRealSetupTime * 60;
		    var iTime1 = iPassTime;
		    var iTime2 = maxSetupTimeSec - iPassTime;
		    var color =  ($scope.currRealSetupTime > $scope.currPlanSetupTime ? colSetup[1] : colSetup[0]);
		    while(iTime2 < 0){
		        iTime1 = -iTime2;
		        iTime2 = maxSetupTimeSec - iTime1;
		    }
		    $('#chart-setup').highcharts({
		        credits: { enabled: false },
		        exporting: { enabled: false },         
		        chart: $scope.Setup.Chart,
		        title: $scope.Setup.Title,
		        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
		        plotOptions: $scope.Setup.PlotOptions(iPassTime),
		        series: $scope.Setup.Series(iTime1,iTime2,color)
		    });
		    $scope.setup.plan = $scope.Graph.IntToHHmm($scope.currPlanSetupTime);
		    $scope.setup.real = $scope.Graph.IntToHHmm($scope.currRealSetupTime);
		},
		UpdateSetup: function(){
			var chartSetup = $('#chart-setup').highcharts();
			if(chartSetup){
			    var iSetupTime = $scope.currPlanSetupTime;
			    var iSetupTimeSec = iSetupTime * 60;
			    var iPassTime = $scope.currRealSetupTime * 60;
			    var colIdx1 = colSetup[0];
			    var colIdx2 = colSetup[2];
			    var iTime1, iTime2;
			    iTime1 = iPassTime;
			    iTime2 = maxSetupTimeSec - iPassTime;     
			    while(iTime2 < 0){
			        iTime1 = -iTime2;
			        iTime2 = maxSetupTimeSec - iTime1;
			    }
			    if(iPassTime > iSetupTimeSec) colIdx1 = colSetup[1];
			    chartSetup.series[0].data[0].update({ y: iTime1, color: colIdx1 });
			    chartSetup.series[0].data[1].update({ y: iTime2, color: colIdx2 });
			    //  Update Indicator
			    var _label = $scope.Func.GenerateNavigatorLabel($scope.currRealSetupTime * 60);
			    d3.select('#indi-top text').text(_label[4] + '/' + _label[0] + 'h');
			    d3.select('#indi-right text').text(_label[1] + 'h');
			    d3.select('#indi-bottom text').text(_label[2] + 'h');
			    d3.select('#indi-left text').text(_label[3] + 'h');
			    //  Update Line Indicator.
			    var opacity = $scope.Func.GetIndicatorLineOpacity((iSetupTime / 60), _label);
			    d3.select('#indi-line').style({ opacity: opacity });

		   		$scope.setup.plan = $scope.Graph.IntToHHmm($scope.currPlanSetupTime);
		    	$scope.setup.real = $scope.Graph.IntToHHmm($scope.currRealSetupTime);
			}
		}
	}

	$scope.Graph = {
		DrawSpeedGraph:function(){
			//var machineInfo = {"stMachID":"2022","iStatus":1,"iSpeed":0,"stJobID":"5808431","stJobDesc":"307035-23  ฉลาก M-150 (หัวหมาก) 80 แกรม","cdInfo":{"bOpenDialog":false,"stMachID":"","stJobID":"","stJobDesc":"","iSetupTime":0,"iCountDown":0,"iPassTime":0,"stStartTime":"","stStepID":"","stStepDesc":"","iStdSpeed":-999,"stRYGCode":"001","informStatus":{"stMachID":"2022","bInform":false,"dtInformTime":"2015-09-30T15:29:58.6748593+07:00","stInformTime":"2015-09-30 15:29:58","iPassTime":0,"analysis":{"iPeriodFlag":1,"dtStartTiming":"2015-09-30T18:46:58.9729416+07:00"}}},"speedGraph":{"stMachID":"2022","stJobID":null,"stJobDesc":null,"lsSpeedInfo":[{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443620820,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443620880,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443620940,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621000,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621060,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621120,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621180,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621240,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621300,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621360,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621420,"stStaColor":"#E50000"},{"iStatus":0,"iProduceSpeed":0,"lTimestamp":1443621480,"stStaColor":"#000000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621540,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621600,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621660,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621720,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621780,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621840,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621900,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443621960,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622020,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622080,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622140,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622200,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622260,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622320,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622380,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622440,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622500,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622560,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622620,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622680,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622740,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622800,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622860,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622920,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443622980,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623040,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623100,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623160,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623220,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623280,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623340,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623400,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623460,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623520,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623580,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623640,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623700,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623760,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623820,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623880,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443623940,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443624000,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443624060,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":0,"lTimestamp":1443635460,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443635520,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443635580,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443635640,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443635700,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443635760,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443635820,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443635880,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443635940,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636000,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636060,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636120,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636180,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636240,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636300,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636360,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636420,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636480,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636540,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443636600,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443636660,"stStaColor":"#00E500"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443636720,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443636780,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443636840,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443636900,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443636960,"stStaColor":"#E50000"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637020,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637080,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637140,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637200,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443637260,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637320,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637380,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637440,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637500,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637560,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637620,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637680,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637740,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637800,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443637860,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637920,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13700,"lTimestamp":1443637980,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13600,"lTimestamp":1443638040,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":13100,"lTimestamp":1443638100,"stStaColor":"#00E500"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638160,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638220,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638280,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638340,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638400,"stStaColor":"#E50000"},{"iStatus":1,"iProduceSpeed":4600,"lTimestamp":1443638460,"stStaColor":"#E50000"},{"iStatus":3,"iProduceSpeed":4600,"lTimestamp":1443638520,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":4600,"lTimestamp":1443638580,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":4600,"lTimestamp":1443638640,"stStaColor":"#00E500"},{"iStatus":3,"iProduceSpeed":4600,"lTimestamp":1443638700,"stStaColor":"#00E500"},{"iStatus":1,"iProduceSpeed":200,"lTimestamp":1443638760,"stStaColor":"#E50000"}],"cdInfo":{"bOpenDialog":false,"stMachID":"","stJobID":"","stJobDesc":"","iSetupTime":0,"iCountDown":0,"iPassTime":0,"stStartTime":"","stStepID":"","stStepDesc":"","iStdSpeed":-999,"stRYGCode":"000","informStatus":{"stMachID":"","bInform":false,"dtInformTime":"2015-09-30T11:40:58.3809594+07:00","stInformTime":"2015-09-30 11:40:58","iPassTime":0,"analysis":{"iPeriodFlag":0,"dtStartTiming":"0001-01-01T00:00:00"}}}}};
			var val = $scope.SpeedHis;
			var graph = [];
			var series = [];
		    var serie = {};
		    var numPoint = val.length;//machineInfo.speedGraph.lsSpeedInfo.length;
		    if(numPoint < 1) return;        //  Data is exist.
		    //serie.cdInfo = machineInfo.speedGraph.cdInfo;      //  Add CountdownInfo to Serie.
		    for(var iIdx=0;iIdx < numPoint;iIdx++){
		        var point = {};
		        var speedInfo = val[iIdx];
		        point.x = (speedInfo.LAST_SEC * 1000) - 60000;
		        point.y = (speedInfo.STATUS == -1 ? 0 : speedInfo.CURRENT_SPEED);

		        var color = "#FFF";
		        if(speedInfo.STATUS == 3){ color = "#00E500"; }
		        else if(speedInfo.STATUS == 2){ color = "#E5E500"; }
		        else  if(speedInfo.STATUS == 1){ color = "#E50000"; }
		        else  if(speedInfo.STATUS == 0){ color = "#000000"; }

		        point.segmentColor = color;
		        //if(val.CURRENT_SPEED === -999 || speedInfo.iProduceSpeed === -999) point.y = null;
		        graph.push(point);      //  Add point to Graph.
		    }
		    serie.data = graph;     //  Add Graph to Serie.
		    serie.name = "Speed";   //  Set graph legend.
		    series.push(serie);     //  Add Serie to Series (Array)

		 ////
			var data = series;
			var plotLineY;
		    if($scope.speedStd != 0){                    
		        plotLineY = $scope.SpeedGraph.PlotLineY($scope.speedStd);
		        var serieTarget = {     //  สร้าง series โดยมีจุดที่ แกน X มีค่าเท่ากับจุดแรกของเส้น serie หลัก, แกน Y มีค่าเท่ากับสปีดมาตรฐานแต่ซ่อนการแสดงผลไว้ 
		                            name: 'Standard', 
		                            type: 'scatter', 
		                            marker: { enabled: false },
		                            showInLegend: false,
		                            data: [[data[0].data[0].x, $scope.speedStd]] 
		                        };
		        data.push(serieTarget);     //  เพิ่ม serie ในข้อมูลการสร้างกราฟ
		    }

		 ////
			var plotBandX = null;
		     var stStartTime = $scope.currStartTime;
		    if(stStartTime != "" && $scope.currRealSetupTime > 0){
		        var dtStartTime = kendo.parseDate(stStartTime, "yyyy-MM-dd HH:mm:ss");
		        var timeFrom = dtStartTime.getTime() - (dtStartTime.getTimezoneOffset() * 60000);
		        var timeTo = timeFrom + (parseInt($scope.currRealSetupTime) * 60000) - 60000;
		        var timeToNoOffset = dtStartTime.getTime() + parseInt($scope.currRealSetupTime) * 60000;
		        var stLabelStart = kendo.toString(new Date(dtStartTime.getTime()), "HH:mm");
		        var stLabelEnd = kendo.toString(new Date(timeToNoOffset), "HH:mm");
		        var stLabel = "Setup Time: &nbsp;" + stLabelStart + " - " + stLabelEnd;
		        plotBandX = $scope.SpeedGraph.PlotBandX(stLabel,timeFrom,timeTo);
		    }

	        speedGraph = new Highcharts.Chart({
		        credits: { enabled: false },
		        title: { text: '' },
		        chart: $scope.SpeedGraph.Chart,
		        colors: ['#058dc7'],  
		        xAxis: {
		            type: 'datetime',
		            plotBands: plotBandX,
		            minorTickInterval: 900000,
             		tickInterval: 900000,
				    lineColor: '#000',
				    lineWidth: 1,
				    tickWidth: 1,
				    tickColor: '#000',
				    gridLineWidth: 1.3,
				    minorgridLineWidth: 1,
				    min: ($scope.speedLastUpdate - 18000) * 1000
		        },
		        yAxis: {
		            title: {
		                text: 'Speed (Sheet/Hour)'
		            },
		            plotLines: plotLineY,
		            minorTickInterval: 'auto',
				    lineColor: '#000',
				    lineWidth: 1,
				    tickWidth: 1,
				    tickColor: '#000',
				    gridLineWidth:1.3,
				    minorgridLineWidth: 1,
				    tickInterval: 4000,
				    min: 0,
				    max: 16000,
				    opposite: true
		        },
		        legend: $scope.SpeedGraph.Legend,
		        exporting: { enabled: false },
		        tooltip: $scope.SpeedGraph.Tooltip,
		        plotOptions: $scope.SpeedGraph.PlotOptions,
		        series: data
		    });
			FillHeadColor();
			runalert();
		},
		UpdateSpeedGraph:function(time,speed,status){
			if($scope.speedLastUpdate != time){
		        var color = "#FFF";
		        if(status == 3){ color = "#00E500"; }
		        else if(status == 2){ color = "#E5E500"; }
		        else  if(status == 1){ color = "#E50000"; }
		        else  if(status == 0){ color = "#000000"; }
				
				var point = {};
		        point.segmentColor = color;
				point.x = time * 1000;
		        point.y = speed;

				var plotBandX = null;
				var stStartTime = $scope.currStartTime;
				var timeFrom,timeTo,stLabel;
			    if(stStartTime != "" && $scope.currRealSetupTime > 0){
			        var dtStartTime = kendo.parseDate(stStartTime, "yyyy-MM-dd HH:mm:ss");
			        timeFrom = dtStartTime.getTime() - (dtStartTime.getTimezoneOffset() * 60000);
			        timeTo = timeFrom + (parseInt($scope.currRealSetupTime) * 60000) - 60000;
			        var timeToNoOffset = dtStartTime.getTime() + parseInt($scope.currRealSetupTime) * 60000;
			        var stLabelStart = kendo.toString(new Date(dtStartTime.getTime()), "HH:mm");
			        var stLabelEnd = kendo.toString(new Date(timeToNoOffset), "HH:mm");
			        stLabel = "Setup Time: &nbsp;" + stLabelStart + " - " + stLabelEnd;
		        	plotBandX = $scope.SpeedGraph.PlotBandX(stLabel,timeFrom,timeTo);
			    }

		        speedGraph.series[0].addPoint(point, true, true,true);  
		        speedGraph.xAxis[0].update({
				    min: ($scope.speedLastUpdate - 18000) * 1000,
				    plotBands: plotBandX
				});
				//
				$scope.speedLastUpdate = time;

				$scope.SpeedHis.push({CURRENT_SPEED: speed,LAST_SEC: time,STATUS: status});
				runalert();
				//FillHeadColor();
				//speedGraph.series[0].data[0].segmentColor
		    }
		},
		IntToHHmm: function(val){
			var hours = Math.floor( val / 60);          
		    var minutes = val % 60;
			return pad(hours,2) + '.' + pad(minutes,2);
		},
		ClearAlert: function(){
			$scope.overMin = 0;
			$scope.overtime = false;
	  		clearInterval(overtime);
			overtime = null;
			overtimeHour = 0;
			overtimeMin = 0;
			overtimeSec = 0;
		}
	}

	var overtime = null;
	var overtimeHour = 0;
	var overtimeMin = 0;
	var overtimeSec = 0;
	function runalert(){
		var d = speedGraph.series[0].data;
		var dd = true;
		for (var i = d.length - 1; i > d.length - 16; i--) {
			if((d[i].segmentColor == '#00E500' || d[i].segmentColor == '#E5E500') || $scope.stopAlert >= (d[i].x / 1000)){
				i = 0;
				dd = false;
			}
		}

		// for (var i = d.length - 1; i > 0; i--) {
		// 	if(d[i].segmentColor == '#E5E500'){
		// 		i = 0;
		// 		dd = false;
		// 	} else if(d[i].segmentColor != '#E50000'){
		// 		i = 0;
		// 	}
		// }

		if($scope.statusID == "2") { dd = false; }

		if(dd){
			if($scope.overtime){ return; }
			var url = $scope.serviceHost + "Msm/ashx/overtime.ashx?mach=" + $scope.machID;
			$http.get(url).success(function(data){
				if(data < 0){
					var find = jQuery.grep(d, function (dd) { return dd.segmentColor == "#E50000" });
					data = find.length;
				}
				$scope.overMin = parseInt(data);
				overtimeMin = $scope.overMin % 60;
				overtimeHour = parseInt($scope.overMin / 60);

				$('#inform-label-top span').html(pad(overtimeHour,2) + ':' + pad(overtimeMin,2) + ':' + pad(overtimeSec,2));
				$scope.overtime = true;

				if(!inform){ $scope.Chart.InitInform(); }
				overtime = setInterval(function(){
					overtimeSec++;
					if(overtimeSec == 60){
						overtimeSec = 0;
						overtimeMin++;
						if(overtimeMin == 60){ overtimeMin = 0; overtimeHour++;}
						$scope.overMin = (overtimeHour * 60) + overtimeMin;
					}
					$('#inform-label-top span').html(pad(overtimeHour,2) + ':' + pad(overtimeMin,2) + ':' + pad(overtimeSec,2));
					$scope.Chart.UpdateInform();
				},1000);
			});
		}
		else{
			$scope.overMin = 0;
			$scope.overtime = false;
	  		clearInterval(overtime);
			overtime = null;
			overtimeHour = 0;
			overtimeMin = 0;
			overtimeSec = 0;
		}
	}
	function pad(str, max) {
	  if(!str){ str = "0"; }
	  str = str.toString();
	  return str.length < max ? pad("0" + str, max) : str;
	}
	function FillHeadColor(){
	    setInterval(function(){
	        var ele = $('#wrapper-speed-graph span');
	        var ePath = $('path[fill="#ffff99"][stroke="#7f7f00"]')[0];
	        if(ele && ePath){
	            var left = ele.css('left').replace('px','');
	            var path = ePath.getBoundingClientRect();
	            if(left > path.left){
	                if(ele){
	                    left = left - 12;
	                    var width = (ele.width() > path.width && ele.width() < 150 ? ele.width() : path.width);
	                    var pleft = (ele.width() > path.width ? path.left - ((ele.width() - path.width) / 2) : path.left);

	                    ele.css('left', parseInt(pleft) + 'px');
	                    ele.css('width', width + 'px');
	               }
	            }
	        }
	    },20);
	}
}

//[{"cdInfo":{"bOpenDialog":false,"stMachID":"","stJobID":"","stJobDesc":"","iSetupTime":0,"iCountDown":0,"iPassTime":0,"stStartTime":"","stStepID":"","stStepDesc":"","iStdSpeed":-999,"stRYGCode":"000","informStatus":{"stMachID":"","bInform":false,"dtInformTime":"2015-09-30T11:40:58.3809594+07:00","stInformTime":"2015-09-30 11:40:58","iPassTime":0,"analysis":{"iPeriodFlag":0,"dtStartTiming":"0001-01-01T00:00:00"}}},"data":[{"x":1443616200000,"y":11500,"segmentColor":"#00E500"},{"x":1443616260000,"y":11500,"segmentColor":"#00E500"},{"x":1443616320000,"y":11400,"segmentColor":"#00E500"},{"x":1443616380000,"y":11400,"segmentColor":"#00E500"},{"x":1443616440000,"y":11400,"segmentColor":"#00E500"},{"x":1443616500000,"y":11600,"segmentColor":"#00E500"},{"x":1443616560000,"y":11700,"segmentColor":"#00E500"},{"x":1443616620000,"y":11700,"segmentColor":"#00E500"},{"x":1443616680000,"y":11700,"segmentColor":"#00E500"},{"x":1443616740000,"y":4600,"segmentColor":"#00E500"},{"x":1443616800000,"y":4600,"segmentColor":"#E50000"},{"x":1443616860000,"y":4600,"segmentColor":"#E50000"},{"x":1443616920000,"y":4600,"segmentColor":"#E50000"},{"x":1443616980000,"y":4600,"segmentColor":"#E50000"},{"x":1443617040000,"y":4600,"segmentColor":"#E50000"},{"x":1443617100000,"y":4600,"segmentColor":"#E50000"},{"x":1443617160000,"y":4600,"segmentColor":"#E50000"},{"x":1443617220000,"y":4600,"segmentColor":"#E50000"},{"x":1443617280000,"y":4600,"segmentColor":"#E50000"},{"x":1443617340000,"y":4600,"segmentColor":"#00E500"},{"x":1443617400000,"y":4600,"segmentColor":"#00E500"},{"x":1443617460000,"y":4600,"segmentColor":"#00E500"},{"x":1443617520000,"y":4600,"segmentColor":"#E50000"},{"x":1443617580000,"y":4600,"segmentColor":"#E50000"},{"x":1443617640000,"y":4600,"segmentColor":"#E50000"},{"x":1443617700000,"y":4600,"segmentColor":"#E50000"},{"x":1443617760000,"y":4600,"segmentColor":"#E50000"},{"x":1443617820000,"y":4600,"segmentColor":"#E50000"},{"x":1443617880000,"y":0,"segmentColor":"#000000"},{"x":1443617940000,"y":0,"segmentColor":"#000000"},{"x":1443618000000,"y":4600,"segmentColor":"#E50000"},{"x":1443618060000,"y":4600,"segmentColor":"#E50000"},{"x":1443618120000,"y":4600,"segmentColor":"#E50000"},{"x":1443618180000,"y":4600,"segmentColor":"#E50000"},{"x":1443618240000,"y":4100,"segmentColor":"#E50000"},{"x":1443618300000,"y":4100,"segmentColor":"#E50000"},{"x":1443618360000,"y":4600,"segmentColor":"#E50000"},{"x":1443618420000,"y":4600,"segmentColor":"#E50000"},{"x":1443618480000,"y":4600,"segmentColor":"#E50000"},{"x":1443618540000,"y":11400,"segmentColor":"#00E500"},{"x":1443618600000,"y":11400,"segmentColor":"#00E500"},{"x":1443618660000,"y":4600,"segmentColor":"#00E500"},{"x":1443618720000,"y":4600,"segmentColor":"#00E500"},{"x":1443618780000,"y":4600,"segmentColor":"#00E500"},{"x":1443618840000,"y":4600,"segmentColor":"#00E500"},{"x":1443618900000,"y":4600,"segmentColor":"#00E500"},{"x":1443618960000,"y":10400,"segmentColor":"#00E500"},{"x":1443619020000,"y":10400,"segmentColor":"#00E500"},{"x":1443619080000,"y":10400,"segmentColor":"#00E500"},{"x":1443619140000,"y":10400,"segmentColor":"#00E500"},{"x":1443619200000,"y":10400,"segmentColor":"#00E500"},{"x":1443619260000,"y":0,"segmentColor":"#E50000"},{"x":1443619320000,"y":4600,"segmentColor":"#E50000"},{"x":1443619380000,"y":11400,"segmentColor":"#00E500"},{"x":1443619440000,"y":11400,"segmentColor":"#00E500"},{"x":1443619500000,"y":12200,"segmentColor":"#00E500"},{"x":1443619560000,"y":12300,"segmentColor":"#00E500"},{"x":1443619620000,"y":12200,"segmentColor":"#00E500"},{"x":1443619680000,"y":12200,"segmentColor":"#00E500"},{"x":1443619740000,"y":12200,"segmentColor":"#00E500"},{"x":1443619800000,"y":12200,"segmentColor":"#00E500"},{"x":1443619860000,"y":4600,"segmentColor":"#E50000"},{"x":1443619920000,"y":0,"segmentColor":"#E50000"},{"x":1443619980000,"y":0,"segmentColor":"#E50000"},{"x":1443620040000,"y":0,"segmentColor":"#E50000"},{"x":1443620100000,"y":0,"segmentColor":"#E50000"},{"x":1443620160000,"y":0,"segmentColor":"#E50000"},{"x":1443620220000,"y":0,"segmentColor":"#E50000"},{"x":1443620280000,"y":0,"segmentColor":"#E50000"},{"x":1443620340000,"y":0,"segmentColor":"#E50000"},{"x":1443620400000,"y":0,"segmentColor":"#E50000"},{"x":1443620460000,"y":1200,"segmentColor":"#E50000"},{"x":1443620520000,"y":1200,"segmentColor":"#E50000"},{"x":1443620580000,"y":1200,"segmentColor":"#E50000"},{"x":1443620640000,"y":0,"segmentColor":"#E50000"},{"x":1443620700000,"y":0,"segmentColor":"#E50000"},{"x":1443620760000,"y":0,"segmentColor":"#E50000"},{"x":1443620820000,"y":0,"segmentColor":"#E50000"},{"x":1443620880000,"y":0,"segmentColor":"#E50000"},{"x":1443620940000,"y":0,"segmentColor":"#E50000"},{"x":1443621000000,"y":0,"segmentColor":"#E50000"},{"x":1443621060000,"y":0,"segmentColor":"#E50000"},{"x":1443621120000,"y":0,"segmentColor":"#E50000"},{"x":1443621180000,"y":0,"segmentColor":"#E50000"},{"x":1443621240000,"y":0,"segmentColor":"#E50000"},{"x":1443621300000,"y":0,"segm…":"#000000"},{"x":1443628740000,"y":0,"segmentColor":"#000000"},{"x":1443628800000,"y":12800,"segmentColor":"#00E500"},{"x":1443628860000,"y":13100,"segmentColor":"#00E500"},{"x":1443628920000,"y":13100,"segmentColor":"#00E500"},{"x":1443628980000,"y":4600,"segmentColor":"#E50000"},{"x":1443629040000,"y":4600,"segmentColor":"#E50000"},{"x":1443629100000,"y":4600,"segmentColor":"#E50000"},{"x":1443629160000,"y":4600,"segmentColor":"#E50000"},{"x":1443629220000,"y":4600,"segmentColor":"#E50000"},{"x":1443629280000,"y":4600,"segmentColor":"#E50000"},{"x":1443629340000,"y":4600,"segmentColor":"#E50000"},{"x":1443629400000,"y":12300,"segmentColor":"#00E500"},{"x":1443629460000,"y":12300,"segmentColor":"#00E500"},{"x":1443629520000,"y":12300,"segmentColor":"#00E500"},{"x":1443629580000,"y":12300,"segmentColor":"#00E500"},{"x":1443629640000,"y":12300,"segmentColor":"#00E500"},{"x":1443629700000,"y":12400,"segmentColor":"#00E500"},{"x":1443629760000,"y":12800,"segmentColor":"#00E500"},{"x":1443629820000,"y":12800,"segmentColor":"#00E500"},{"x":1443629880000,"y":12800,"segmentColor":"#00E500"},{"x":1443629940000,"y":12800,"segmentColor":"#00E500"},{"x":1443630000000,"y":13700,"segmentColor":"#00E500"},{"x":1443630060000,"y":13700,"segmentColor":"#00E500"},{"x":1443630120000,"y":13700,"segmentColor":"#00E500"},{"x":1443630180000,"y":4600,"segmentColor":"#00E500"},{"x":1443630240000,"y":13700,"segmentColor":"#00E500"},{"x":1443630300000,"y":13700,"segmentColor":"#00E500"},{"x":1443630360000,"y":3700,"segmentColor":"#E50000"},{"x":1443630420000,"y":3700,"segmentColor":"#E50000"},{"x":1443630480000,"y":8400,"segmentColor":"#00E500"},{"x":1443630540000,"y":8400,"segmentColor":"#00E500"},{"x":1443630600000,"y":13700,"segmentColor":"#00E500"},{"x":1443630660000,"y":13700,"segmentColor":"#00E500"},{"x":1443630720000,"y":13700,"segmentColor":"#00E500"},{"x":1443630780000,"y":13700,"segmentColor":"#00E500"},{"x":1443630840000,"y":13700,"segmentColor":"#00E500"},{"x":1443630900000,"y":13700,"segmentColor":"#00E500"},{"x":1443630960000,"y":13700,"segmentColor":"#00E500"},{"x":1443631020000,"y":13700,"segmentColor":"#00E500"},{"x":1443631080000,"y":13700,"segmentColor":"#00E500"},{"x":1443631140000,"y":13700,"segmentColor":"#00E500"},{"x":1443631200000,"y":13700,"segmentColor":"#00E500"},{"x":1443631260000,"y":13700,"segmentColor":"#00E500"},{"x":1443631320000,"y":0,"segmentColor":"#E50000"},{"x":1443631380000,"y":0,"segmentColor":"#E50000"},{"x":1443631440000,"y":0,"segmentColor":"#E50000"},{"x":1443631500000,"y":200,"segmentColor":"#E50000"},{"x":1443631560000,"y":200,"segmentColor":"#E50000"},{"x":1443631620000,"y":12800,"segmentColor":"#00E500"},{"x":1443631680000,"y":11800,"segmentColor":"#00E500"},{"x":1443631740000,"y":11800,"segmentColor":"#00E500"},{"x":1443631800000,"y":13700,"segmentColor":"#00E500"},{"x":1443631860000,"y":13700,"segmentColor":"#00E500"},{"x":1443631920000,"y":13700,"segmentColor":"#00E500"},{"x":1443631980000,"y":13700,"segmentColor":"#00E500"},{"x":1443632040000,"y":13600,"segmentColor":"#00E500"},{"x":1443632100000,"y":13600,"segmentColor":"#00E500"},{"x":1443632160000,"y":13600,"segmentColor":"#00E500"},{"x":1443632220000,"y":4600,"segmentColor":"#E50000"},{"x":1443632280000,"y":6100,"segmentColor":"#00E500"},{"x":1443632340000,"y":13700,"segmentColor":"#00E500"},{"x":1443632400000,"y":13700,"segmentColor":"#00E500"},{"x":1443632460000,"y":13700,"segmentColor":"#00E500"},{"x":1443632520000,"y":13700,"segmentColor":"#00E500"},{"x":1443632580000,"y":13700,"segmentColor":"#00E500"},{"x":1443632640000,"y":13700,"segmentColor":"#00E500"},{"x":1443632700000,"y":13700,"segmentColor":"#00E500"},{"x":1443632760000,"y":13600,"segmentColor":"#00E500"},{"x":1443632820000,"y":13700,"segmentColor":"#00E500"},{"x":1443632880000,"y":13700,"segmentColor":"#00E500"},{"x":1443632940000,"y":13700,"segmentColor":"#00E500"},{"x":1443633000000,"y":13700,"segmentColor":"#00E500"},{"x":1443633060000,"y":13700,"segmentColor":"#00E500"},{"x":1443633120000,"y":13600,"segmentColor":"#00E500"},{"x":1443633180000,"y":13600,"segmentColor":"#00E500"},{"x":1443633240000,"y":13700,"segmentColor":"#00E500"},{"x":1443633300000,"y":13700,"segmentColor":"#00E500"},{"x":1443633360000,"y":13700,"segmentColor":"#00E500"},{"x":1443633420000,"y":13700,"segmentColor":"#00E500"},{"x":1443633480000,"y":13700,"segmentColor":"#00E500"},{"x":1443633540000,"y":13700,"segmentColor":"#00E500"},{"x":1443633600000,"y":13700,"segmentColor":"#00E500"},{"x":1443633660000,"y":13700,"segmentColor":"#00E500"},{"x":1443633720000,"y":13700,"segmentColor":"#00E500"},{"x":1443633780000,"y":13700,"segmentColor":"#00E500"},{"x":1443633840000,"y":13700,"segmentColor":"#00E500"},{"x":1443633900000,"y":13700,"segmentColor":"#00E500"},{"x":1443633960000,"y":13700,"segmentColor":"#00E500"},{"x":1443634020000,"y":13700,"segmentColor":"#00E500"},{"x":1443634080000,"y":1400,"segmentColor":"#E50000"},{"x":1443634140000,"y":3900,"segmentColor":"#E50000"}],"name":"Speed"}]