define(["jquery.ui"], function () {
	
	var arrows = {
					"n": { url: "images/coach-arrow-n.png", size: [72, 130] },
					"ne": { url: "images/coach-arrow-ne.png", size: [29, 46] }
				};

	$.fn.textWidth = function(){
		var html_org = $(this).html();
		var html_calc = '<span>' + html_org + '</span>';
		$(this).html(html_calc);
		var width = $(this).find('span:first').width();
		$(this).html(html_org);
		return width;
	};

	$.widget("que.CoachMarks", {

		options: {},

		_create: function () {
			this.markcontainer = $("<div>", { class: "coach markcontainer" });
			this.element.append(this.markcontainer);
			
			this.element.click($.proxy(this.onClick, this));
			
			this.refresh();
		},
		
		refresh: function () {
			this.markcontainer.empty();
			
			var all = $.find("[data-coach]");
			for (var i = 0; i < all.length; i++) {
				this.createCoachMark(all[i]);
			}			
		},
		
		open: function () {
			this.refresh();
			
			this.element.show();
		},
		
		onClick: function () {
			this.element.hide();
		},
		
		createCoachMark: function (el) {
			el = $(el);
			
			var rect = el[0].getBoundingClientRect();
			this.mark = $("<div>", { class: "coach mark" });
			this.markcontainer.append(this.mark);
			
			var text = el.attr("data-coach");
			var pos = el.attr("data-coach-pos");
			var arrowPreference = el.attr("data-coach-arrow");
			
			this.mark.html(text);
			
			var ar, arrowX, arrowY;
			
			var min_w = 150;
			
			switch (pos) {
				case "bottom":
					if (!arrowPreference) arrowPreference = "n";
					ar = arrows[arrowPreference];
					var w = Math.max(rect.width, min_w);
					var x = rect.left + rect.width * .5 - w * .5;
					var y = rect.bottom + ar.size[1];
					arrowX = w * .5;
					arrowY = -ar.size[1];
					switch (arrowPreference) {
						case "n":
							arrowX = ar.size[0] * .5;
							arrowY = 0;
							this.mark.css({ paddingTop: ar.size[1] });
							break;
						case "ne":
							arrowX = -ar.size[0];
							arrowY = -ar.size[1] + 10;
							break;
					}
					
					//this.mark.css({ left: x, top: y, width: w });
					this.mark.css({ width: w });
					break;
				case "left":
					if (!arrowPreference) arrowPreference = "n";
					ar = arrows[arrowPreference];
					var w = Math.max(rect.width, min_w);
					var x = rect.left + rect.width * .5 - w * .5;
					var y = rect.bottom + ar.size[1];
					arrowX = rect.width * .5 + 10;
					arrowY = -ar.size[1];
					this.mark.css({ left: x, top: y, width: w });
					break;				
			}
			
			var img = $("<img>", { src: ar.url }).css( { left: arrowX, top: arrowY } );
			img.appendTo(this.mark);
			
			switch (pos) {
				case "bottom":
					this.mark.position( { my: "center top", at: "center bottom", of: el, collision: "none" } );
					break;
			}
		},
		
		doit: function () {
			console.log("ok, I'll do it!");
		},

		_destroy: function () {
		},

		_setOption: function ( key, value ) {
			switch (key) {
				default:
					//this.options[ key ] = value;
					break;
			}

			this._super( "_setOption", key, value );
		}
	});
});
