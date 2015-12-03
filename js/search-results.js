define(["lunr", "jquery.ui"], function (lunr) {

	$.widget("que.SearchResults", {

		options: {},

		_create: function () {
			this.element.find("#searchAgain").click($.proxy(this.onSearchAgain, this));
			this.element.find("#backButton").click($.proxy(this.onGoBack, this));
		},

		setSearchIndex: function (data) {
			this.searchIndex = lunr.Index.load(data);
		},

		doSearch: function (term) {
			if (!this.searchIndex) return;

			this.element.find("#searchTerm").val(term);

			var results = this.searchIndex.search(term);

			var container = this.element.find(".search-results-container");

			this.element.find(".search-results-container").empty();

			for (var i = 0; i < results.length; i++) {
				var r = results[i];

				var index = parseInt(r.ref);

				var el = this.addResult(index);
				
				//el.animate( { _dummy: 0 }, { duration: i * 100, complete: function () { $(this).css("visibility", "visible").addClass("animated fadeInUp"); } });
			}

			var t = results.length + " result";
			if (results.length != 1) t += "s";

			this.element.find("#result-count").text(t);
		},

		onSearchAgain: function () {
			var term = this.element.find("#searchTerm").val();

			this.doSearch(term);
		},

		addResult: function (index) {
			var title = this.options.toc[index].title;
			var desc = this.options.toc[index].intro;

			var el = $("<div>", { class: "search-result" });

			var t = $("<p>", { class: "title", text: title } );
			var d = $("<p>", { class: "desc", text: desc } );
			
			el.append(t).append(d);

			t.click(function (event) {
				$(this).trigger("go-to-task", index);
			});

			//el.css("visibility", "hidden");
			
			/*
			if (Math.random() < .1) {
				$("<div>", { class: "marker-new" }).prependTo(el.find(".task-preview"));
			}
			*/
			
			if (this.options.toc[index].watched || this.options.toc[index].tried) {
				$("<img>", { class: "checkmark", src: "images/checkmark.png" }).appendTo(el);
			}
			
			//el.find(".task-preview").click($.proxy(this.showPreview, this, index));

			//el.find(".do-watch-it").click(function (event) { event.stopPropagation(); el.trigger("do-watch-it", index); });
			//el.find(".do-try-it").click(function (event) { event.stopPropagation(); el.trigger("do-try-it", index); });

			this.element.find(".search-results-container").append(el);
			
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
		},

		onGoBack: function (event) {
			$(event.target).trigger("go-back");
		}
	});
});
