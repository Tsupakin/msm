/*
 *  Script:     -
 *  Copyright:  2015 - Kaweesarn Srivanlop
 *  Company:    Ingeni Systems Co.,Ltd.
 *  License:    GPL v2 or BSD (3-point)
 */

Highcharts.theme = {
	colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
	chart: {
		borderWidth: 0,
		plotBackgroundColor: 'rgba(255, 255, 255, .9)',
		plotShadow: true,
		plotBorderWidth: 1
	},
	title: {
		style: {
			color: '#333',
			font: 'bold 24px dosismedium, "Trebuchet MS", Verdana, sans-serif',
		}
	},
	subtitle: {
		style: {
			color: '#666',
			font: 'bold 18px dosismedium, "Trebuchet MS", Verdana, sans-serif',
		}
	},
	xAxis: {
		gridLineWidth: 1,
		lineColor: '#333',
		tickColor: '#333',
		labels: {
			style: {
				color: '#333',
				font: '12px dosismedium, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '16px',
				fontFamily: 'dosismedium, "Trebuchet MS", Verdana, sans-serif'
			}
		}
	},
	yAxis: {
		minorTickInterval: 'auto',
		lineColor: '#333',
		lineWidth: 1,
		tickWidth: 1,
		tickColor: '#333',
		labels: {
			style: {
				color: '#333',
				font: '12px dosismedium, Trebuchet MS, Verdana, sans-serif'
			}
		},
		title: {
			style: {
				color: '#333',
				fontWeight: 'bold',
				fontSize: '16px',
				fontFamily: 'dosismedium, "Trebuchet MS", Verdana, sans-serif'
			}
		}
	},
	legend: {
		itemStyle: {
			font: '14pt dosismedium, Trebuchet MS, Verdana, sans-serif',
			color: 'black'

		},
		itemHoverStyle: {
			color: '#039'
		},
		itemHiddenStyle: {
			color: 'gray'
		}
	},
	labels: {
		style: {
			color: '#99b'
		}
	},

	navigation: {
		buttonOptions: {
			theme: {
				stroke: '#CCCCCC'
			}
		}
	}
};

// Apply the theme
//var highchartsOptions = Highcharts.setOptions(Highcharts.theme);

// Make a copy of the defaults, call this line before any other setOptions call
var HCDefaults = $.extend(true, {}, Highcharts.getOptions(), {});
