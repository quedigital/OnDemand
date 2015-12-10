define(["imagesloaded", "jquery.ui"], function (imagesLoaded) {
	
	var arrows = {
					"n": { url: "images/coach-arrow-n.png", size: [72, 130] },
					"ne": { url: "images/coach-arrow-ne.png", size: [29, 46] },
					"s": { url: "images/coach-arrow-s.png", size: [72, 130] },
					"e": { url: "images/coach-arrow-e.png", size: [130, 90] }
				};

	$.fn.textWidth = function(){
		var html_org = $(this).html();
		var html_calc = '<span>' + html_org + '</span>';
		$(this).html(html_calc);
		var width = $(this).find('span:first').width();
		$(this).html(html_org);
		return width;
	};

	function sortBySortOrder (a, b) {
		var sa = $(a).attr("data-coach-order");
		var sb = $(b).attr("data-coach-order");

		if (sa == undefined && sb == undefined) return -1;
		else if (sa == undefined) return 1;
		else if (sb == undefined) return -1;
		else return (sa - sb);
	}

	$.widget("que.CoachMarks", {

		options: {},

		_create: function () {
			this.fontsLoaded = false;

			WebFont.load({
				google: {
					families: ['Permanent Marker']
				},
				active: $.proxy(this.onFontsActive, this)
			});

			this.markcontainer = $("<div>", { class: "coach markcontainer" });
			this.element.append(this.markcontainer);

			this.markholder = $("<div>", { class: "markholder" });
			this.markcontainer.append(this.markholder);

			this.buttons = $("<div>", { class: "button-holder" } );
			this.element.append(this.buttons);

			this.endButton = $("<button>", { class: "end-button btn btn-info", text: "End Tour" });
			this.endButton.click($.proxy(this.onClickEnd, this));
			this.buttons.append(this.endButton);

			this.nextButton = $("<button>", { class: "next-button btn btn-success", text: "Next" });
			this.nextButton.click($.proxy(this.onClickNext, this));
			this.buttons.append(this.nextButton);

			this.element.click($.proxy(this.onClick, this));

			this.markcontainer.hide(0);
			this.buttons.hide(0);
		},
		
		refresh: function (params) {
			this.markholder.empty();
			this.marks = [];

			this.setupDynamics();
			
			var all = $.find("[data-coach]");
			for (var i = 0; i < all.length; i++) {
				var mark = all[i];
				var p = $(mark).attr("data-coach-preorder");
				if (p) {
					$(mark).attr("data-coach-order", p);
				}
			}

			all = all.sort(sortBySortOrder);

			for (var i = 0; i < all.length; i++) {
				var mark = all[i];

				this.createCoachMark(mark, params);
			}

			imagesLoaded(this.element, $.proxy(this.onImagesLoaded, this));
		},

		showCurrentElement: function () {
			if (!this.fontsLoaded) return;

			this.element.find(".animated").removeClass("animated zoomIn slideInUp");

			this.element.show(0);
			this.markcontainer.show(0);
			this.buttons.show(0);

			if (this.currentIndex == this.marks.length - 1) {
				this.nextButton.hide(0);
			} else {
				this.nextButton.show(0);
			}

			for (var i = 0; i < this.marks.length; i++) {
				var mark = this.marks[i];

				if (i == this.currentIndex) {
					mark.unit.show(0);

					switch (mark.pos) {
						case "bottom":
							mark.unit.position( { my: "center top", at: "center bottom", of: mark.el, collision: "fit" } );

							if (mark.arrow) {
								mark.arrow.position( { my: "center top", at: "center bottom", of: mark.el, collision: "fit" } );
								mark.text.position( { my: "center top", at: "center bottom", of: mark.arrow, collision: "fit" } );
							} else {
								mark.text.position( { my: "center top", at: "center bottom", of: mark.el, collision: "fit" } );
							}

							this.buttons.position( { my: "center top", at: "center bottom+15", of: mark.text, collision: "fit" } );

							break;
						case "top":
							mark.unit.position( { my: "center bottom", at: "center top", of: mark.el, collision: "fit" } );

							if (mark.arrow) {
								mark.arrow.position( { my: "center bottom", at: "center top", of: mark.el, collision: "fit" } );
								mark.text.position( { my: "center bottom", at: "center top", of: mark.arrow, collision: "fit" } );
							} else {
								mark.text.position( { my: "center bottom", at: "center top", of: mark.el, collision: "fit" } );
							}

							this.buttons.position( { my: "center bottom", at: "center top-15", of: mark.text, collision: "fit" } );

							break;
						case "left":
							mark.unit.position( { my: "right center", at: "left center", of: mark.el, collision: "fit" } );

							if (mark.arrow) {
								mark.arrow.position( { my: "right center", at: "left center", of: mark.el, collision: "fit" } );
								mark.text.position( { my: "right center", at: "left center", of: mark.arrow, collision: "fit" } );
							} else {
								mark.text.position( { my: "right center", at: "left center", of: mark.el, collision: "fit" } );
							}

							this.buttons.position( { my: "center top", at: "center bottom+15", of: mark.text, collision: "fit" } );

							break;
					}

					mark.unit.hide(0);
					mark.unit.addClass("animated zoomIn");
					mark.unit.show(0);

					this.buttons.hide(0);
					this.buttons.addClass("animated slideInUp");
					this.buttons.show(0);
				} else {
					mark.unit.hide(0);
				}
			}
		},

		setupDynamics: function () {
			var sortOrder = $("[data-coach]").length + 1;

			for (var i = 0; i < this.options.dynamics.length; i++) {
				var d = this.options.dynamics[i];
				var el = $("body").find(d.selector);
				if (el.length) {
					el.attr("data-coach", d.text);
					el.attr("data-coach-set", d.set);
					el.attr("data-coach-pos", d.pos);
					el.attr("data-coach-order", sortOrder++);
				}
			}
		},

		// redraw current step after all images are loaded
		onImagesLoaded: function () {
			this.showCurrentElement();
		},

		// redraw current step after all fonts are rendered
		onFontsActive: function () {
			this.fontsLoaded = true;

			this.showCurrentElement();
		},

		onClickNext: function (event) {
			event.stopPropagation();

			this.gotoNext();
		},

		onClickEnd: function (event) {
			event.stopPropagation();

			this.close();
		},

		gotoNext: function () {
			if (this.currentIndex < this.marks.length - 1) {
				this.currentIndex++;

				this.showCurrentElement();
			} else {
				this.close();
			}
		},

		open: function (params) {
			this.currentIndex = 0;

			this.refresh(params);

			this.element.hide(0);
			this.element.show("fade");

			this.preventScroll();
		},

		close: function () {
			this.element.hide("fade");

			this.enableScroll();
		},
		
		onClick: function () {
			this.close();
		},
		
		createCoachMark: function (el, params) {
			el = $(el);

			if (params.set) {
				if (el.attr("data-coach-set") && el.attr("data-coach-set") != params.set) return;
			}

			var unit = $("<div>", { class: "mark-unit" });
			this.markholder.append(unit);

			var rect = el[0].getBoundingClientRect();

			var text = $("<div>", { class: "coach text" });
			unit.append(text);
			
			var t = el.attr("data-coach");
			var pos = el.attr("data-coach-pos");
			var arrowPreference = el.attr("data-coach-arrow");

			//var min_w = 150, max_w = 300;
			//var w = "auto";
			//var w = Math.min(Math.max(rect.width, min_w), max_w);

			text.html(t);//.width(w);

			var arrowPreference;

			switch (pos) {
				case "bottom":
					if (!arrowPreference) arrowPreference = "n";
					break;
				case "top":
					if (!arrowPreference) arrowPreference = "s";
					break;
				case "left":
					if (!arrowPreference) arrowPreference = "e";
					break;
			}

			if (arrowPreference != "none") {
				var ar = arrows[arrowPreference];

				var arrow = $("<img>", {class: "coach arrow", src: ar.url});
				arrow.appendTo(unit);
			}

			var obj = { el: el, unit: unit, text: text, arrow: arrow, pos: pos };

			this.marks.push(obj);
		},
		
		doit: function () {
			console.log("ok, I'll do it!");
		},

		_destroy: function () {
		},

		_setOption: function ( key, value ) {
			switch (key) {
				default:
					this.options[key] = value;
					break;
			}

			this._super( "_setOption", key, value );
		},

		preventScroll: function () {
			window.onwheel = preventDefault;
		},

		enableScroll: function () {
			window.onwheel = null;
		}
	});

	function preventDefault (e) {
		e = e || window.event;
		if (e.preventDefault)
			e.preventDefault();
		e.returnValue = false;
	}
});
