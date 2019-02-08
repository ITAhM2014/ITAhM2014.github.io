;"use strict";

/**
 * @namespace
 */
var ITAhM = ITAhM || {};

(function (window, undefined) {
	
	ITAhM.QueryParser = function () {
		this.initialize();
	};
	
	ITAhM.ChartData = function (data) {
		this.initialize(data);
	};

	ITAhM.ChartSummaryData = function (data) {
		this.initialize(data);
	};
	
	ITAhM.Path = function (container) {
		this.initialize(container);
	};
	
	ITAhM.Calendar = function (calendar, handler) {
		this.initialize(calendar, handler);
	};
	
	ITAhM.Color = function (r, g, b) {
		this.initialize(r, g, b);
	};
	
	ITAhM.QueryParser.prototype = {
		map: {},
		
		initialize: function () {
			var queries,
				pair;
				
			if (!location.search) {
				return;
			}
			
			queries = location.search.substring(1).split("&");
			
			for (var i=0, length=queries.length; i<length; i++) {
				pair = queries[i].split("=");
				
				if (pair.length === 2) {
					this.map[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
				}
			}
		},
		
		get: function (key) {
			return this.map[key];
		}		
	};
	
	ITAhM.ChartSummaryData.prototype = {
		initialize: function (data) {
			this.data = data;
		},
		
		next: function (date) {
			return date.setHours(date.getHours() +1, 0, 0, 0);
		},
		
		buildData: function (start, end) {
			var keys = [],
				tmp = [],
				date = new Date(start),
				mills, value, high, low, max = [], min = [];
			
			mills = date.setMinutes(0, 0, 0);
			
			do {
				value = this.data[mills];
				
				//if (value)
				// TODO 안정화되면 지워도 됨
				if (value && !isNaN(value.max) && !isNaN(value.min)) {
					tmp[tmp.length] = mills;
					
					max[max.length] = value.max;
					min[min.length] = value.min;
				}
				else if (tmp.length > 0){
					keys[keys.length] = tmp;
					
					tmp = [];
				}
			} while ((mills = this.next(date)) < end);
			
			if (tmp.length > 0) {
				keys[keys.length] = tmp;
			}
			
			high = Math.max.apply(undefined, max);
			low = Math.min.apply(undefined, min);
			
			if (high === low) {
				high++;
				low--;
			}
			
			return keys.length > 0? {
				high: high,
				low: low,
				keys: keys
			}: undefined;
		},
		
		get: function (date) {
			return this.data[date];
		}
	};
	
	ITAhM.ChartSummaryData.prototype.parseData = ITAhM.ChartSummaryData.prototype.buildData;
		
	ITAhM.ChartData.prototype = {
		initialize: function (data) {
			this.data = data;
		},
		
		parseData: function (start, end) {
			var key = [],
				date = new Date(start),
				mills = date.setSeconds(0, 0);
			do {
				if (!isNaN(this.data[mills])) {
					key[key.length] = mills;
				}
			} while ((mills = date.setMinutes(date.getMinutes() + 1)) <= end);
			
			return key;
		},
		
		get: function (date) {
			return this.data[date];
		}
	};

	//Path object
	ITAhM.Path.prototype = {
		initialize: function (container) {
			this.container = container;
			this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
			this.beginPath();
		},
		
		moveTo: function (x, y) {
			this.distance[this.distance.length] = "M"+ x +" "+ y;
			
			return this;
		},
		
		lineTo: function (x, y) {
			this.distance[this.distance.length] = "L"+ x +" "+ y;
			
			return this;
		},
		
		v: function (y) {
			this.distance[this.distance.length] = "V"+ y;
			
			return this;
		},
		
		draw: function () {
			this.container.appendChild(this.path);
			
			this.path.setAttributeNS(null, "d", this.distance.join(" "));
		},
		
		set: function (key, value) {
			this.path.setAttributeNS(null, key, value);
		},
		
		beginPath: function () {
			this.distance = [];
		},
		
		closePath: function () {
			this.distance[this.distance.length] = "Z"
		}
	};
	
	ITAhM.Calendar.prototype = {
		initialize: function (id, handler) {
			var nav = document.createElement("nav");
			
			this.calendar = document.getElementById(id);
			this.body = document.createElement("div");
			this.date = document.createElement("div");
			 
			this.year = document.createElement("span");
			this.month = document.createElement("select");
			this.btnPrev = document.createElement("span");
			this.btnCur = document.createElement("span");
			this.btnNext = document.createElement("span");
			
			this.callback = handler;
			this.header = document.createElement("div");
			this.calendar.classList.add("calendar");
			
			//event
			this.month.onchange = function () {
				this.move(new Date(this.year.textContent, this.month.value));
			}.bind(this);
			
			this.btnPrev.onclick = function () {
				this.move(new Date(this.year.textContent, Number(this.month.value) -1));
			}.bind(this);
			
			this.btnCur.onclick = function () {
				var date = new Date();
				
				date.setHours(0, 0, 0, 0);
				
				this.callback(date);
				
				this.move(date);
			}.bind(this);
			
			this.btnNext.onclick = function () {
				this.move(new Date(this.year.textContent, Number(this.month.value) +1));
			}.bind(this);
			
			// header
			this.header.appendChild(this.date);
			this.header.appendChild(nav);
			
			this.date.appendChild(this.year);
			this.date.appendChild(this.month);
			
			for (var i=0, opt; i<12;) {
				opt = document.createElement("option");
				
				opt.value = i++;
				opt.text = i<10? "0" + i: i;
				
				this.month.appendChild(opt);
			}
			
			nav.appendChild(this.btnPrev);
			nav.appendChild(this.btnCur);
			nav.appendChild(this.btnNext);
			
			this.calendar.appendChild(this.header);
			
			// body
			var ul = document.createElement("ul"),
				dayArray = ["일", "월", "화", "수", "목", "금", "토"];
			
			for (var j=0; j<7; j++) {
				ul.appendChild(document.createElement("li")).textContent = dayArray[j];
			}
			
			this.body.appendChild(ul);
			
			for (var i=0; i<6; i++) {
				ul = document.createElement("ul");
				
				for (var j=0; j<7; j++) {
					ul.appendChild(document.createElement("li"));
				}
				
				this.body.appendChild(ul);
			}
			
			this.calendar.appendChild(this.body);
			
			this.move(new Date());
		},
		
		move: function (date, select) {
			this.year.textContent = date.getFullYear();
			this.month.value = date.getMonth();
			
			date.setHours(0, 0, 0, 0);
			
			if (this.selected) {
				this.selected.classList.remove("selected");
				
				this.selected = undefined;
			}
			
			this.build(date, select? date.getDate(): 0);
		},
		
		select: function (col) {
			col.classList.add("selected");
			
			if (this.selected) {
				this.selected.classList.remove("selected");
			}
			
			this.selected = col;
		},
		
		build: function (date, select) {
			var today = new Date(),
				year = date.getFullYear(),
				month = date.getMonth(),
				dateArray = new Array(6*7).fill(0),
				index, lastDate;
			
			date.setDate(1);
			index = date.getDay();
			
			date.setMonth(month +1, 0);
			lastDate = date.getDate();
			
			for (var i=1; i <= lastDate; i++, index++) {
				dateArray[index] = i;
			}
			
			today = today.setHours(0, 0, 0, 0);
			if (this.today) {
				this.today.classList.remove("today");
				
				this.today = undefined;
			}
			
			for (var i=0, _i=dateArray.length, index=0, col, row = this.body.childNodes[1]; i<_i; i++) {
				col = row.childNodes[index];
				
				if (dateArray[i]) {
					date = new Date(year, month, dateArray[i], 0, 0, 0, 0);
					
					if (date.getTime() === today) {
						this.today = col;
						
						col.classList.add("today");
					}
					
					col.textContent = dateArray[i];
					
					if (dateArray[i] === select) {
						this.select(col);
					}
					
					col.classList.add("valid");
					col.onclick = function (col, date) {
						this.select(col);
						
						this.callback(date);
					}.bind(this, col, date);
				}
				else {
					col.textContent = "";
					col.className = "";
					col.onclick = undefined;
				}
				
				if (++index > 6) {
					index = 0;
					
					row = row.nextSibling;
				}
			}
		}
		
	};

	ITAhM.Color.prototype = {
		initialize: function (r, g, b) {
			this.r = r;
			this.g = g;
			this.b = b;
		},
		
		toString: function () {
			return "#"+ this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
		},
		
		alpha: function (alpha) {
			return "rgba("+ this.r +"," + this.g +","+ this.b +","+ alpha + ")";
		}
		
	};
	
}) (window);