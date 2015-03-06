define(["holder", "jquery.ui"], function (Holder) {

	var titles = [
					"Opening and Viewing Disks",
					"Viewing and Opening Documents",
					"Changing the Window View",
					"Arranging Files and Folders in Icons View",
					"Working with Files and Folders in List View",
					"Viewing Files with Cover Flow View",
					"Working with Files and Folders in Columns View",
					"Viewing Files Using Quick Look",
					"Going to Common or Recent Places",
				];

	$.widget("que.SearchResults", {

		options: {},

		_create: function () {
		},
		
		doit: function () {
			this.element.empty();
			
			var n = Math.floor(Math.random() * 25) + 1;
			
			for (var i = 0; i < n; i++) {
				var el = this.addResult();
				
				el.animate( { _dummy: 0 }, { duration: i * 100, complete: function () { $(this).css("visibility", "visible").addClass("animated fadeInUp"); } });
			}
			
			Holder.run();			
		},
		
		addResult: function () {
			var title = titles[Math.floor(Math.random() * titles.length)];
			
			var s = '<div class="search-result col-sm-4 col-md-2"><div class="thumbnail task-preview"><div class="caption"><h3>' + title + '</h3><div class="btn-group btn-group-justified"><a class="btn btn-primary do-watch-it" role="button">Watch It</a><a class="btn btn-success do-watch-it" role="button">Try It</a></div></div></div></div>';			
			
			var el = $(s);
			
			el.css("visibility", "hidden");
			
			if (Math.random() < .1) {
				$("<div>", { class: "marker-new" }).prependTo(el.find(".task-preview"));
			}
			
			if (Math.random() < .1) {
				$("<img>", { class: "checkmark", src: "images/checkmark.png" }).appendTo(el);
			}
			
			el.find(".task-preview").click($.proxy(this.showPreview, this, title));
			
			this.element.append(el);
			
			return el;		
		},
		
		showPreview: function (title) {
			$("#previewModal").find("h3").text(title);
			
			$('#previewModal').modal('show');
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
