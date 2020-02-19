function getReqQuery(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


Array.prototype.average = function () {
    var sum = 0;
    var j = 0;
    for (var i = 0; i < this.length; i++) {
        if (isFinite(this[i])) {
            sum = sum + parseFloat(this[i]);
            j++;
        }
    }
    if (j === 0) { return 0; }
    else { return sum / j; }
}

Array.prototype.sum = function () {
    var sum = 0;
    var j = 0;
    for (var i = 0; i < this.length; i++) {
        if (isFinite(this[i])) {
            sum = sum + parseFloat(this[i]);
            j++;
        }
    }
    if (j === 0) { return 0; }
    else { return sum; }
}

// String.prototype.pad = function(len){
//     str = this.toString();
//     return str.length < len ? pad("0" + str, len) : str;
// }


jQuery.cookie = function (name, value, options) {
   if (typeof value != 'undefined') { // name and value given, set cookie
       options = options || {};
       if (value === null) {
           value = '';
           options.expires = -1;
       }
       var expires = '';
       if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
           var date;
           if (typeof options.expires == 'number') {
               date = new Date();
               date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
           } else {
               date = options.expires;
           }
           expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
       }
       var path = options.path ? '; path=' + options.path : '';
       var domain = options.domain ? '; domain=' + options.domain : '';
       var secure = options.secure ? '; secure' : '';
       document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
   } else { // only name given, get cookie
       var cookieValue = null;
       if (document.cookie && document.cookie != '') {
           var cookies = document.cookie.split(';');
           for (var i = 0; i < cookies.length; i++) {
               var cookie = jQuery.trim(cookies[i]);
               // Does this cookie string begin with the name we want?
               if (cookie.substring(0, name.length + 1) == (name + '=')) {
                   cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                   break;
               }
           }
       }
       return cookieValue;
   }
}

//  	setInterval(function () {
//  	   if ($.cookie("KPORTAL") == null) {
//  	       window.location.href = 'http://' + window.location.host + '/' + window.location.pathname.split('/')[1] + '/login.aspx?mode=logout';
//  	   }
//  	}, 10000);
//  	var socket = io.connect('http://192.168.55.44:3001/');

//  	if (socket) {
//  	   socket.on('hi', function (message) {
//  	       socket.emit('reg', { user: $.cookie("KPORTAL"), url: window.location.pathname + window.location.search });
//  	   });
//  	   socket.on('rec', function (msg) {

//  	   });
//  	}



// var kprData = jQuery.grep(data, function (d) { return d.COMP_SHT_DESC == "ห้างฯ" });
