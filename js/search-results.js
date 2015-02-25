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
				
				el.hide().animate( { _dummy: 0 }, { duration: i * 100, complete: function () { $(this).show().addClass("animated fadeInUp"); } });
			}
			
			Holder.run();			
		},
		
		addResult: function () {
			var title = titles[Math.floor(Math.random() * titles.length)];
			
			var s = '<div class="col-sm-4 col-md-2"><div class="thumbnail task-preview"><img data-src="holder.js/100%x200" alt="Generic placeholder thumbnail"><div class="caption"><h3>' + title + '</h3><p>This is a thumbnail content area.</p><div class="text-center"><div class="btn-group"><a class="btn btn-primary watch-it-link" role="button">Watch It</a><a class="btn btn-success" role="button">Try It</a></div></div></div></div></div>';
			
			var el = $(s);
			
			this.element.append(el);
			
			return el;		
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
