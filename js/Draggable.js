; "use strict";

function Draggable(target) {
	var isDragging = false,
		originX, originY,
		lastX, lastY,
		draggable;
	
	function onMouseDown(e) {
		originX = lastX = e.clientX;
		originY = lastY = e.clientY;
		
		draggable = e.target;
	}
	
	function onMouseMove(e) {
		var x = e.clientX,
			y = e.clientY,
			data;
		
		if (!draggable || lastX === x && lastY === y) {
			return;
		}
			
		if (!isDragging) {
			data = {
				target: draggable,
				ctrlKey: e.ctrlKey,
				shiftKey: e.shiftKey,
				x: originX,
				y: originY
			};
			
			target.dispatchEvent(createEvent("dragon", data));
			
			isDragging = true;
		}
		
		data = {
			target: draggable,
			destination: e.target,
			dragX: x - originX,
			dragY: y - originY,
			moveX: x - lastX,
			moveY: y - lastY
		};
		
		lastX = x;
		lastY = y;
		
		target.dispatchEvent(createEvent("drag", data));
	}
	
	function onMouseUp(e) {
		var x = e.clientX,
			y = e.clientY,
			data = {
				target: draggable,
				destination: e.target,
				dragX: x - originX,
				dragY: y - originY,
				moveX: x - lastX,
				moveY: y - lastY
			};
		
		draggable = undefined;
		
		if (!isDragging) {
			return;
		}
		
		target.dispatchEvent(createEvent("dragoff", data));
		
		isDragging = false;
	}
	
	function initEvent() {
		target.addEventListener("mousedown", function(e) {
			if (e.button === 0) {
				onMouseDown(e);
			}
			
			e.preventDefault();
		});
		target.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		
		target.addEventListener('touchstart', function (e) {
			onMouseDown(e.touches[0]);
			
			e.preventDefault();
		});
		target.addEventListener('touchmove', function (e) {
			onMouseMove(e.touches[0]);		
		});
		document.addEventListener('touchend', function (e) {
			if (e.touches.length === 0) onMouseUp(e.changedTouches[0]);
		});
	}
	
	function createEvent(type, data) {
		var event = document.createEvent("CustomEvent", true, true);
		
		event.initCustomEvent(type, true, true, data || null);
		
		return event;
	}
	
	initEvent();
};