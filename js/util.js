;"use strict";

function setValueAsDate(e, d) {
	if ("valueAsDate" in e) {
		d = new Date(d.getTime());
		
		d.setHours(9, 0, 0, 0);
		
		e.valueAsDate = d;
	}
	else {
		var mm = d.getMonth() +1,
			dd = d.getDate();
		
		e.value = [d.getFullYear(), mm > 9? mm: "0"+ mm, dd > 9? dd: "0"+ dd].join('-');
	}
}

function getValueAsDate(e) {
	var date;
	
	if ("valueAsDate" in e) {
		date = e.valueAsDate;
	}
	else {
		date = new Date(e.value);
	}
	
	date.setHours(0, 0, 0, 0);
	
	return date;
}

function addClass(e, className) {
	var cls = e.getAttribute("class"),
		classList = cls? cls.split(" "): [];
	
	for (var i=1, _i=arguments.length; i<_i; i++) {
		if (classList.indexOf(className) === -1) {
			classList.push(className);
		}
	}
	
	e.setAttribute("class", classList.join(" "));
}

function removeClass(e, className) {
	var cls = e.getAttribute("class"),
		classList = cls? cls.split(" "): [],
		index;
	
	for (var i=1; i<arguments.length; i++) {
		className = arguments[i];
		
		index = classList.indexOf(className);
		
		if (index !== -1) {
			classList.splice(index, 1);
		}
	}
	
	e.setAttribute("class", classList.join(" "));
}

function hasClass(e, className) {
	var cls = e.getAttribute("class"),
		classList = cls? cls.split(" "): [];
	
	for (var i=1; i<arguments.length; i++) {
		if (classList.indexOf(arguments[i]) == -1) {
			return false;
		}
	}
	
	return true;
}

function isIPv4(s) {
    return s.match(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)? true: false;
}

const REGEXP_IPV4 = new RegExp("^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\."
	+ "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\."
	+ "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\."
	+ "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

function IP2Int(s) {
	const o = REGEXP_IPV4.exec(s);
	
	if(o === null || o.length != 5) return 0xffffffff;
	
	var n = 0;
	for(let i=1; i<5; i++) {
		n <<= 8;
		n |= o[i];
	}
	
	return n >>> 0;
}