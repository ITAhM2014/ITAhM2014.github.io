;"use strict";

/**
 * @namespace
 */
var ITAhM = ITAhM || {};

Array.prototype.fill = Array.prototype.fill || function (val) {
	for (var i=0; i<this.length; i++) {
		this[i] = val;
	}
	
	return this;
};

(function (window, undefined) {
	
	ITAhM.util = {
		enterpriseFromOID: function (oid) {
			var match = /^1\.3\.6\.1\.4\.1\.(\d+)/.exec(oid);
			
			if (match) {
				return ITAhM.snmp.enterprise[match[1]] || match[1];
			}
		},
		
		toBytesString: function (bytes) {
			var unit = ["Bytes", "KBytes", "MBytes", "GBytes", "TBytes"];
			
			for(var i=0, _i=unit.length -1; i<_i; i++) {
				if (bytes > 999) {
					bytes /= 1024;
				}
				else {
					break;
				}
			}
			
			return bytes.toFixed(2) + unit[i];
		},
		
		toBPSString: function (bandwidth) {
			if (isNaN(bandwidth)) {
				return "0bps";
			}
			
			var unit = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];
			
			for(var i=0, _i=unit.length -1; i<_i; i++) {
				if (bandwidth > 999) {
					bandwidth /= 1000;
				}
				else {
					break;
				}
			}
			
			return bandwidth.toFixed(2) + unit[i];
		},
		
		toUptimeString: function (dateMills) {
			var uptime = dateMills /1000,
				days, hours, minutes, seconds;
			
			days = Math.floor(uptime /24 /3600);
			uptime -= days *24 *3600;
			
			hours = Math.floor((uptime /3600));
			uptime -= hours * 3600;
			
			minutes = Math.floor((uptime /60));
			uptime -= minutes * 60;
		
			return days +" days " + hours +" hours " + minutes +" minutes " + Math.floor(uptime) +" seconds";
		},
		
		/**
		 * @param date Date object not integer (mills) 
		 */
		toDateFormatString: function (date) {
			var language = navigator.language;
			
			language = undefined;
			
			if (language === "ko") {
				var format = [date.getMonth() +1, "월", " ", date.getDate(), "일"],
					hour = date.getHours();
				
				if (hour > 0) {
					format.push(" ", hour, "시");
				}
				
				return format.join("");
			}
			else if (language === "en"){
				var day = date.getDate(),
					hour = date.getHours(),
					MONTH_NAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			
				return MONTH_NAME[date.getMonth()] + (day === 1? "" : " "+ (day > 9? "": "0")+ day +", "+ (hour > 9? "": "0") + hour);
			}
			else {
				var month = date.getMonth() +1,
					day = date.getDate(),
					hour = date.getHours();
				
				if (month === 0 && day === 1 && hour === 0) {
					return date.getFullYear();
				}
				else {
					var min = date.getMinutes();
					
					if (min === 0) {
						return [month<10? "0": "", month, "-", day<10? "0": "", day, hour<10? " 0":" ", hour].join("");
					}
					else {
						return [hour<10? " 0":" ", hour, ":", min > 9? min: "0"+ min].join("");
					}
				}				
			}
		},
		
		toDateString: function (date) {
			var year = date.getFullYear(),
				month = date.getMonth() + 1,
				day  = date.getDate();
			
			return year +"-"+ (month > 9? "": "0") + month +"-"+ (day > 9? "": "0") + day;
		},
		
		toDateTimeString: function (date) {
			var year = date.getFullYear(),
				month = date.getMonth() + 1,
				day  = date.getDate(),
				h = date.getHours(),
				m = date.getMinutes(),
				s = date.getSeconds();
			
			return year +"-"+ (month > 9? "": "0") + month +"-"+ (day > 9? "": "0") + day +" "
				+ (h > 9? "": "0") + h +":"+ (m > 9? "": "0") + m +":"+ (s > 9? "": "0") + s;
		},
		
		toTimeString: function (mills) {
			var date = new Date(mills),
				hh = date.getHours(),
				mm = date.getMinutes(),
				ss = date.getSeconds();
			
			return (hh > 9? "": "0") + hh +":"+ (mm > 9? "": "0") + mm +":"+ (ss > 9? "": "0") + ss;
		},
		
		download: function(blob, fileName) {
			if (window.navigator.msSaveBlob) {
				window.navigator.msSaveBlob(blob, fileName);
			}
			else {
				var a = document.createElement("a"),
					event = document.createEvent("MouseEvent");
					
				a.setAttribute("download", fileName);
				a.setAttribute("href", URL.createObjectURL(blob));
				
				event.initEvent("click", true, true);
				a.dispatchEvent(event);
			}
		},
		
		createCustomEvent: function (type, data) {
			var event = document.createEvent("CustomEvent");
			
			event.initCustomEvent(type, true, true, data);
			
			return event;
		},
		
		createCSVData: function (data, keys, summary) {
			var row, block, date, dateMills, value;
			
			if (summary) {
				row = ["index,date,max,avg,min"];
				
				for (var i=0, _i=keys.length; i<_i; i++) {
					block = keys[i];
					
					for (var j=0, _j=block.length; j<_j; j++) {
						dateMills = block[j];
						date = new Date(dateMills);
						value = data[dateMills];
						
						row[row.length] = [j, ITAhM.util.toDateTimeString(date), value.max, value.avg, value.min].join(",");
					}
				}
			}
			else {
				row = ["index,date,value"];
				
				for (var i=0, _i=keys.length; i<_i; i++) {
					block = keys[i];
					
					for (var j=0, _j=block.length; j<_j; j++) {
						dateMills = block[j];
						date = new Date(dateMills);
						
						row[row.length] = [j, date.toISOString().slice(0, 10) + " "+ date.toTimeString().slice(0, 8), data[dateMills]].join(",");
					}
				}
			}
			
			return row.join("\n");
		},
		
		getNetwork: function (ip, mask) {
			var ipArray = ip.split("."),
				maskArray = mask.split("."),
				length = ipArray.length;
			
			for (var i=0; i<length; i++) {
				ipArray[i] = ipArray[i] & maskArray[i];
			}
			
			return ipArray[i].join(".");
		}
		
	};
	
}) (window);

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