app.propertiesController = function($scope){
	$scope.Prop ={
		sector: 4,
		hourSector: 1
	} 

	$scope.PropSpeed = {
		Chart: {
        type: "gauge",
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        borderWidth: 0,
        backgroundColor: "transparent"
    	},
	    Title: {
	      text: "",
	      style:{
	        "font-size": "26px",
	        "fontFamily": "ThaiSarabun",
	        "font-weight": "bold",
	        "color": "#596750"
	      },
	      y: 40
	    },
	    Pane: {
	      startAngle: -140,
	      endAngle: 140,
	      background: [{                   
	        backgroundColor: "white"
	      }, {
	        borderWidth: 8,
	        borderColor: "#566c81",
	        outerRadius: "107%",
	        innerRadius: "108%"
	      }]
	    },
	    yAxis: function(speedStd){
	     return { min: 0,
			      max: 18000,
			      lineColor: "#566c81",
			      lineWidth: 3,
			      minorTickInterval: "auto",
			      minorTickWidth: 1,
			      minorTickLength: 12,
			      minorTickPosition: "inside",
			      minorTickColor: "#566c81",
			      tickPixelInterval: 30,
			      tickWidth: 2,
			      tickPosition: "inside",
			      tickLength: 17,
			      tickColor: "#566c81",
			      labels: {
			        step: 2,
			        rotation: "auto",
			        style: {
			            fontSize: "12px",
			            color: "#566c81"
			        },
			        distance: -30
			      },
			      title: {
			        y: 20,
			        text: "แผ่น/ชม.",
			        style:{
			            fontSize: "18px",
			            fontFamily: "ThaiSarabun",
			            color: "#566c81"
			        }
			      },
			      plotBands: [{
			        from: 0,
			        to: speedStd,
			        color: "#F05253"    //  red
			      }, {
			        from: speedStd,
			        to: 18000,
			        color: "#80C342"    //  green
			      }]
			    };
	    },
	    Series: [{
	      name: "Running",
	      data: [0],
	      tooltip: {
	        valueSuffix: " แผ่น/ชม."
	      },
	      dataLabels:{
	        enabled: true,
	        style:{
	          fontSize: "20px",
	          fontFamily: "ThaiSarabun",
	          color: "#80C342",
	          textShadow: "none"
	        },
	        formatter: function(){
	          return Highcharts.numberFormat(this.y, 0, 0, ',');
	        },
	        y: -125
	      },
	      dial:{
	        backgroundColor: "#566c81"
	      },
	      pivot:{
	        backgroundColor: "#566c81"
	      }
	    }]
	};

	$scope.Inform = {
		Chart: {
			backgroundColor: "none",
      plotBackgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: false,
      spacing: [25, 30, 25, 30]
		},
		Title: {
			text: '',
      align: 'center',
      verticalAlign: 'middle',
      y: 70,
      style:{
        fontSize: '13px',
        fontFamily: "ThaiSarabun"
      }
		},
		PlotOptions: function(iPassTime){
			return {
				pie: {
	        dataLabels: {
	          enabled: false,
	          distance: -50,
	          style: {
	            fontWeight: 'bold',
	            color: 'white',
	            textShadow: '0px 1px 2px black'
	          }
	        },
	        center: ['50%', '50%']
	      },
	      series:{
	        events:{
	          afterAnimate: function(){
	            $scope.Func.CreateNavigatorForDonutChart(this,iPassTime);
	          }
	        }
	      }
	    }
		},
		Series: function(iTime1,iTime2,colInform){
			return [{
	      type: 'pie',
	      name: 'แจ้งปัญหา',
	      innerSize: '50%',
	      data: [
	        {
	          name: 'ผ่านไปแล้ว',
	          y: iTime1,
	          legendIndex: 0,
	          color: colInform[1]
	        },
	        {
	          name: 'เวลาก่อนครบรอบ',
	          y: iTime2,
	          legendIndex: 1,
	          color: colInform[2]
	        }
	      ]           
	    }];
	  }
	}
	$scope.Setup = {
		Chart: {
			backgroundColor: "none",
		      plotBackgroundColor: null,
		      plotBorderWidth: 0,
		      plotShadow: false,
		      spacing: [25, 30, 25, 30]
				},
				Title: {
					text: '',
		      align: 'center',
		      verticalAlign: 'middle',
		      y: 70,
		      style:{
		        fontSize: '13px',
		        fontFamily: "ThaiSarabun"
		      }
		},
		PlotOptions: function(iPassTime){
			return {
				pie: {
	        dataLabels: {
	          enabled: false,
	          distance: -50,
	          style: {
	            fontWeight: 'bold',
	            color: 'white',
	            textShadow: '0px 1px 2px black'
	          }
	        },
	        center: ['50%', '50%']
	      },
	      series:{
	        events:{
	          afterAnimate: function(){
	            $scope.Func.CreateNavigatorForDonutChart(this,iPassTime,1);
	          }
	        }
	      }
	    }
		},
		Series: function(iTime1,iTime2,color){
			return [{
		      type: 'pie',
		      name: 'Setup Time',
		      innerSize: '50%',
		      data: [
	        {
	          name: 'ผ่านไปแล้ว',
	          y: iTime1,
	          legendIndex: 0,
	          color: color
	        },
	        {
	          name: 'เวลาก่อนครบรอบ',
	          y: iTime2,
	          legendIndex: 1,
	          color: "#e3eef9"
	        }
	      ]           
	    }];
	  }
	}
	$scope.SpeedGraph = {
		PlotLineY: function(stdSpeed){
			return [{
                label: {
                    text: 'Speed Target = ' + Highcharts.numberFormat(stdSpeed, 0, 0, ','),
                    style: {
                        fontFamily: 'dosismedium, "Trebuchet MS", Verdana, sans-serif',
                        fontSize: '14px',                            
                        color: '#333'
                    }
                },
                color: '#86a8c9',       
                dashStyle: 'longdashdot',       
                value: stdSpeed,     
                width: 2,       
                zIndex: 3            
            }];
		},
		PlotBandX: function(stLabel,timeFrom,timeTo){
			return [{  
                  color: '#ffff99', 
                  from: timeFrom, 
                  to: timeTo,
                  borderWidth: 2,
                  borderColor: "#7f7f00",
                  zIndex: 0,
                  label: {
                      text: stLabel,
                      align: 'center',
                      x: 5,
                      y: -5,
                      useHTML: true,
                      style: {
                          fontFamily: 'dosismedium, "Trebuchet MS", Verdana, sans-serif',
	                fontSize: '14px',
                          color: "#4c4c00"//,
                          //backgroundColor: "#ffff99"
                      }
                  }
             }];
		},
		Chart: {
			backgroundColor: "none",
			renderTo: 'wrapper-speed-graph',
			type: 'coloredline',
			zoomType: 'x',
			height: $('#wrapper-speed-graph').height(),
			marginTop: 20,
			marginRight: 40
    	},
	    Legend: {
		     enabled: false,
		     align: 'right',
		     x: -20
		},
	    Tooltip: {
		    crosshairs: true,
		    shared: true
		},
    	PlotOptions: {
	        series: {
		        marker: {
		          enabled: false
		        }                   
	        }                   
	    }
	}

	$scope.Func = {
		CreateNavigatorForDonutChart: function(obj,iPassTime,setup){
	    var ren = obj.chart.renderer;
	    var centerX = obj.center[0] + obj.chart.spacing[3];
	    var centerY = obj.center[1] + obj.chart.spacing[0];
	    var lengthInnerRad = obj.center[3] / 2;
	    var chartWidth, chartSpace = 10;
	    if(obj.chart.plotHeight < obj.chart.plotWidth){
	        chartWidth = obj.chart.plotHeight;
	    }else{
	        chartWidth = obj.chart.plotWidth;
	    }
	    var lengthRad = (chartWidth / 2) - chartSpace;
	    var lineAttr = {
	        'stroke-width': 1,
	        stroke: 'white',
	        dashstyle: 'solid',
	        zIndex: 4        
	    };  
	    var labelAttr = {
	        zIndex: 4
	    };
	    var labelCSS = {
	        color: '#666', 
	        fontSize: '14px'
	    };
	    //  Draw indicator line
	    //  Top
	    ren.path(['M', centerX, centerY - lengthRad, 'L', centerX, centerY - lengthInnerRad])
	            .attr(lineAttr)
	            .add();
	    //  Bottom
	    ren.path(['M', centerX, centerY + lengthInnerRad, 'L', centerX, centerY + lengthRad])
	            .attr(lineAttr)
	            .add();
	    //  Left
	    ren.path(['M', centerX - lengthRad, centerY, 'L', centerX - lengthInnerRad, centerY])
	            .attr(lineAttr)
	            .add();
	    //  Right
	    ren.path(['M', centerX + lengthInnerRad, centerY, 'L', centerX + lengthRad, centerY])
	            .attr(lineAttr)
	            .add();
	    //  Draw label
	    var _label = $scope.Func.GenerateNavigatorLabel(iPassTime);
	    //  Top
	    ren.label(_label[4] + '/' + _label[0] + 'h', centerX - 18, centerY - lengthRad - 24)
	            .attr(labelAttr)
	            .attr({ id: 'indi-top' })
	            .css(labelCSS)
	            .add();
	    //  Bottom
	    ren.label(_label[2] + 'h', centerX - 12, centerY + lengthRad)
	            .attr(labelAttr)
	            .attr({ id: 'indi-bottom' })
	            .css(labelCSS)
	            .add();    
	    //  Left
	    ren.label(_label[3] + 'h', centerX - lengthRad - 28, centerY - 13)
	            .attr(labelAttr)
	            .attr({ id: 'indi-left' })
	            .css(labelCSS)
	            .add();    
	    //  Right
	    ren.label(_label[1] + 'h', centerX + lengthRad + 2, centerY - 13)
	            .attr(labelAttr)
	            .attr({ id: 'indi-right' })
	            .css(labelCSS)
	            .add();

			if(!setup) return;       //  Draw Setup Line
	    //  Calculation
	    var iSetupTime = $scope.currPlanSetupTime;
	    var degSetup = 360 / maxSetupTimeMin * iSetupTime;      //  Degree start from Top (The rotation appears to be clockwise)
	    var sinZeta = parseFloat(Math.sin(degSetup * Math.PI / 180).toFixed(15));
	    var cosZeta = parseFloat(Math.cos(degSetup * Math.PI / 180).toFixed(15));
	    var pointX = lengthRad * sinZeta;       //  r * sin(@)
	    var pointY = lengthRad * cosZeta;       //  r * cos(@)
	    var pointInnerX = lengthInnerRad * sinZeta;
	    var pointInnerY = lengthInnerRad * cosZeta;
	    pointX = centerX + pointX;
	    pointY = centerY - pointY;
	    pointInnerX = centerX + pointInnerX;
	    pointInnerY = centerY - pointInnerY;
	    var opacity = $scope.Func.GetIndicatorLineOpacity((iSetupTime / 60), _label);
	    //  Draw Setup Line
	    var lineSetupAttr = {
	        'stroke-width': 3,
	        stroke: '#b70000',
	        dashstyle: 'solid',
	        zIndex: 4,
	        opacity: opacity
	    };      
	    ren.path(['M', pointInnerX, pointInnerY, 'L', pointX, pointY])
	            .attr(lineSetupAttr)
	            .attr({ id: 'indi-line' })
	            .add();  	            
		},
		GetIndicatorLineOpacity: function(iSetupTimeHour, _label){
	    if((iSetupTimeHour >= _label[0]) && (iSetupTimeHour <= _label[4])) 
	        return 1;
	    else return 0;  
		},
		GenerateNavigatorLabel: function(iPassTime){
		    var result = [];
		    
	        var iPassTime = iPassTime;
	        var hourCircle = $scope.Prop.sector * $scope.Prop.hourSector * 60 * 60;
	        var round = Math.floor(iPassTime / hourCircle);
	        for(var idx=0; idx <= $scope.Prop.sector; idx++){
	            var member = (round * $scope.Prop.sector) + idx; 
	            result.push(member);
	        }   
		    return result;
		}
	}

	var maxSetupTimeHour = $scope.Prop.sector;
	var maxSetupTimeMin = maxSetupTimeHour * 60;
}