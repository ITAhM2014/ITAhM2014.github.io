; "use strict";

const TRAFFIC_INTERVAL = 3000;

function parse (link, message) {
	const result = {};

	if ("ifOperStatus" in link) {
		result.status = link.ifOperStatus === 1? 1: -1;
	}

	if (result.status === 1) {
		if ("option" in line) {
			result.color = line.option.color;
		}
		
		if ("ifSpeed" in link && link.ifSpeed > 0) {
			if ("ifInBPS" in link) {
				result.in = Math.round(link.ifInBPS *10 / ("speed" in link && link.speed > 0? link.speed: link.ifSpeed)) *10;
			}

			if ("ifOutBPS" in link) {
				result.out = Math.round(link.ifOutBPS *10 / ("speed" in link && link.speed > 0? link.speed: link.ifSpeed)) *10;
			}
		}
	}

	return result;
}

self.onmessage = e => {
	const traffic = e.data;
	var line, ar, id1, id2, message;

	for (let id in traffic) {
		ar = id.split(".");

		if (ar.length != 3 || ar[0] != "line") {
			continue;
		}

		id1 = "node."+ ar[1];
		id2 = "node."+ ar[2];

		line = traffic[id];
	
		if (Array.isArray(line[id1])) {
			message = {
				id: id,
				link: []
			};

			line[id1].forEach((link, i) => {
				if (link) {
					message.link[i] = parse(link, message);
				}
				else if (line[id2][i]) {
					message.link[i] = parse(line[id2][i]);
				}
			});
		}
		else if (line[id1]) {
			message = {
				id: id,
				link: parse(line[id1])
			};
		}
		else if (line[id2]) {
			message = {
				id: id,
				link: parse(line[id2])
			};
		}

		postMessage(message);
	}

	setTimeout(postMessage.bind(self, null), TRAFFIC_INTERVAL);
};

postMessage(null);