define(["holder", "jquery.ui"], function (Holder) {

	$.widget("que.SearchResults", {

		options: {},

		_create: function () {
		},
		
		doit: function () {
			this.element.empty();
			
			var n = Math.floor(Math.random() * 25) + 1;
			
			for (var i = 0; i < n; i++) {
				var index = Math.floor(Math.random() * this.options.toc.length);

				var el = this.addResult(index);
				
				el.animate( { _dummy: 0 }, { duration: i * 100, complete: function () { $(this).css("visibility", "visible").addClass("animated fadeInUp"); } });
			}
			
			Holder.run();			
		},
		
		addResult: function (index) {
			var title = this.options.toc[index].title;

			var s = '<div class="search-result col-sm-4 col-md-3"><div class="thumbnail task-preview"><div class="caption"><h3>' + title + '</h3><div class="btn-group btn-group-justified"><a class="btn btn-primary do-watch-it" role="button">Watch It</a><a class="btn btn-success do-try-it" role="button">Try It</a></div></div></div></div>';
			
			var el = $(s);

			el.css("visibility", "hidden");
			
			if (Math.random() < .1) {
				$("<div>", { class: "marker-new" }).prependTo(el.find(".task-preview"));
			}
			
			if (Math.random() < .1) {
				$("<img>", { class: "checkmark", src: "images/checkmark.png" }).appendTo(el);
			}
			
			el.find(".task-preview").click($.proxy(this.showPreview, this, index));

			el.find(".do-watch-it").click(function (event) { event.stopPropagation(); el.trigger("do-watch-it", index); });
			el.find(".do-try-it").click(function (event) { event.stopPropagation(); el.trigger("do-try-it", index); });

			this.element.append(el);
			
			return el;		
		},
		
		showPreview: function (index) {
			var title = this.options.toc[index].title;

			$("#previewModal").find("h3").text(title);

			$("#previewModal").find(".do-watch-it").off("click").click(function (event) { event.stopPropagation(); $(event.target).trigger("do-watch-it", index); });
			$("#previewModal").find(".do-try-it").off("click").click(function (event) { event.stopPropagation(); $(event.target).trigger("do-try-it", index); });
			$("#previewModal").find("#learn-more").off("click").click(function (event) { event.stopPropagation(); $(event.target).trigger("go-to-task", index); });

			$('#previewModal').modal('show');
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
		}
	});
});
