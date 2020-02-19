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
	}
}

$(document)
	.ready(function(){
		layout.resize();
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
	});