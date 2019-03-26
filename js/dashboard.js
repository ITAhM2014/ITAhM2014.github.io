; "use strict";

const TRAFFIC_INTERVAL = 3000;

self.onmessage = e => {
	const traffic = e.data;
	var line, ar, id1, id2, data, message;

	for (let id in traffic) {
		message = {
			id: id,
			status: 0,
		};

		ar = id.split(".");

		if (ar.length != 3 || ar[0] != "line") {
			continue;
		}

		id1 = "node."+ ar[1];
		id2 = "node."+ ar[2];

		line = traffic[id];
	
		if (id1 in line) {
			data = line[id1];
			
			if ("ifOperStatus" in data) {
				message.status = line[id1].ifOperStatus === 1? 1: -1;
			}
		}
		else if (id2 in line) {
			data = line[id2];
			
			if ("ifOperStatus" in data) {
				message.status = line[id2].ifOperStatus === 1? 1: -1;
			}
		}
		
		if (message.status === 1) {
			if ("option" in line) {
				message.color = line.option.color;
			}
			
			if ("ifSpeed" in data && data.ifSpeed > 0) {
				if ("ifInBPS" in data) {
					message.in = Math.round(data.ifInBPS *10 / ("speed" in data && data.speed > 0? data.speed: data.ifSpeed)) *10;
				}

				if ("ifOutBPS" in data) {
					message.out = Math.round(data.ifOutBPS *10 / ("speed" in data && data.speed > 0? data.speed: data.ifSpeed)) *10;
				}
			}
		}

		postMessage(message);
	}

	setTimeout(postMessage.bind(self, null), TRAFFIC_INTERVAL);
};

postMessage(null);