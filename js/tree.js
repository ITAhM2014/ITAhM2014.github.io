; "use strict";

function Tree() {
	this.initialize(arguments);
}

Tree.prototype = {
	initialize: function (args) {
		this.tree = args[0] && document.getElementById(args[0]);

		if (!this.tree || this.tree.nodeName.toLowerCase() !== "ul") {
			throw "Tree의 container는 항상 ul 노드 이어야 합니다.";
		}

		this.tree.className = "tree";

		this.pre = args[0] +"_";
		this.id = 0;
	},
	add: function (text, parent) {
		const
			item = document.createElement("li"),
			span = document.createElement("span");

		span.textContent = text;
		item.appendChild(span);

		if (!parent) {
			parent = this.tree;
		}
		else {
			const ul = parent.querySelector("ul");

			if (ul) {
				parent = ul;
			}
			else {
				const
					label = document.createElement("label"),
					checkbox = document.createElement("input");

				checkbox.type = "checkbox";
				checkbox.id = this.pre + this.id++;

				label.htmlFor = checkbox.id;

				parent.insertBefore(label, parent.querySelector("span"));
				parent.insertBefore(checkbox, label);

				parent = parent.appendChild(document.createElement("ul"));
			}
		}
		
		return parent.appendChild(item);
	}
};