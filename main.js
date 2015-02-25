requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"jasny-bootstrap": "jasny-bootstrap.min",
		"holder": "holder.min"
	},
	
	shim: {
		"jquery": {
			export: "$",
		},
		"jquery.ui": {
			export: "$",
		},
		"bootstrap": {
			export: "$",
			deps: ['jquery']
		},
		"jasny-bootstrap": {
			export: "$",
			deps: ['jquery']
		}
	},
});

// NOTE: Couldn't use embed-responsive-4by3 for the iframe (even though it made sizing automatic) because it didn't (easily) work with affix's fixed positioning

require(["holder", "toc-viewer", "bootstrap", "jasny-bootstrap", "search-results"], function () {

	var v = $(".toc-viewer").TOCViewer();
	$(".search-results-container").SearchResults();
	
	function sizeToFit () {
		var screenHeight = $(window).height();
		
		$(".screenheight").height(screenHeight - 50);
		
		var bh = $("#main-bar").height();
		var wh = $(window).innerHeight() - bh;
		
		var w = $(".task-demo").width();
		var h = w * .75;
		
		var container_width = $(".task-demo").width();
		var container_left = $(".task-steps").outerWidth();
		
		$("#captivate-iframe").css( { left: container_left + 15, width: container_width, maxHeight: wh, height: h } );
		
		container_width = $(".task-container").width();
		w = $(".task-steps").width();
		var margin = (container_width - w) * .5;
		$(".task-steps.solo").css("margin-left", margin);
	}
	
	function onCaptivateButton (event) {				
		var watchit = $("#watch-button").prop("checked");
		var tryit = $("#try-button").prop("checked");
		
		if ($(event.target).is($("#watch-button"))) {
			if (watchit) {
				$("#try-button").prop("checked", false);
				$("#try-button").parents("label").removeClass("active");
				
				$(".task-steps.solo").removeClass("solo").addClass("dual").css("margin-left", 0);
				
				$(".task-demo.hidden").removeClass("hidden");
				
				sizeToFit();
			}
		} else if ($(event.target).is($("#try-button"))) {
			if (tryit) {
				$("#watch-button").prop("checked", false);
				$("#watch-button").parents("label").removeClass("active");
			}
		}
		
		if (!watchit && !tryit) {
			$(".task-steps").addClass("solo").removeClass("dual");
			$(".task-demo").addClass("hidden");
			
			sizeToFit();
		}
	}
	
	function onDoSearch () {
		var sr = $(".search-results-container").SearchResults("instance");
		sr.doit();

		$(".task-preview").click(onGoToTask);
		
		$("#taskpane").addClass("hidden");
		$("#homepane").addClass("hidden");
		$("#searchpane").removeClass("hidden");
	}
	
	function onGoToTask () {
		$("#homepane").addClass("hidden");
		$("#searchpane").addClass("hidden");
		$("#taskpane").removeClass("hidden");

		$(".task-steps").removeClass("animated");
		
		sizeToFit();
		
		// delay; animate after sizing
		setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);
	}
	
	function onHomeButton () {
		$("#searchpane").addClass("hidden");
		$("#taskpane").addClass("hidden");
		$("#homepane").removeClass("hidden");
	}
	
	$(window).resize(sizeToFit);
	
	sizeToFit();
	
	$(".hidden-on-startup").removeClass("hidden");
	
	$(".task-steps").addClass("solo");
	
	$(".captivate-buttons input").change(onCaptivateButton);
	$(".search-button").click(onDoSearch);
	$("#home-button").click(onHomeButton);
	
	//var inst = v.TOCViewer("instance");
	//inst.doit();

	$("#captivate-iframe").affix({
		offset: {
			top: function () { 
				return $(".task-container").offset().top - $("#search-form").outerHeight(false);
			},
			bottom: function () {
				return $(".footer").outerHeight() - $("#search-form").outerHeight(false);
			}
		}
	});
});