requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"jasny-bootstrap": "jasny-bootstrap.min",
		"holder": "holder.min",
		"joyride": "jquery.joyride-2.1",
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
		},
		"joyride": {
			export: "$",
			deps: ['jquery']
		},
	},
});

// NOTE: Couldn't use embed-responsive-4by3 for the iframe (even though it made sizing automatic) because it didn't (easily) work with affix's fixed positioning

require(["holder", "toc-viewer", "bootstrap", "jasny-bootstrap", "search-results", "joyride", "coach-marks"], function () {

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
				onDoWatchIt();
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
	
	function onDoWatchIt () {
		$(".task-steps.solo").removeClass("solo").addClass("dual").css("margin-left", 0);
		
		$(".task-demo.hidden").removeClass("hidden");
		
		sizeToFit();
		
		/*
		setTimeout(function () {
			window.cp.play();
		}, 1500);
		*/
	}
	
	function onDoSearch () {
		var sr = $(".search-results-container").SearchResults("instance");
		sr.doit();

		$(".go-to-task").off("click");
		
		$(".go-to-task").click(onGoToTask);
		
		$("#taskpane").addClass("hidden");
		$("#homepane").addClass("hidden");
		$("#searchpane").removeClass("hidden");
		$("body").css("padding-top", 80);
		
		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").removeClass("hidden");
	}
	
	function onGoToTask (event) {
		$('#previewModal').modal('hide');
			
		event.stopPropagation();
		
		$("#homepane").addClass("hidden");
		$("#searchpane").addClass("hidden");
		$("#taskpane").removeClass("hidden");

		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").addClass("hidden");
		$("body").css("padding-top", 50);

		$(".task-steps").removeClass("animated");
		
		sizeToFit();
		
		// delay; animate after sizing
		setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);
	}
	
	function onHomeButton () {
		console.log("home");
		
		$("#searchpane").addClass("hidden");
		$("#taskpane").addClass("hidden");
		$("#homepane").removeClass("hidden");
		
		$("#toc-button").addClass("hidden");
		$(".back-to-search").addClass("hidden");
		$("body").css("padding-top", 50);
		
		$("#search-form").addClass("hidden");
	}

	function checkForCaptivate () {
		if (window.frames[0].cpAPIInterface) {
			cp = window.frames[0].cpAPIInterface;
			window.cp = cp;
			cp_events = window.frames[0].cpAPIEventEmitter;
			onCaptivateLoaded();
		} else {
			setTimeout(checkForCaptivate, 100);
		}
	}
	
	function onCaptivateLoaded () {
		window.cp.pause();
		
		// NOTE: this doesn't seem to fire from within an iFrame:
		cp_events.addEventListener("CPAPI_MOVIESTART", function () { console.log("movie started!"); });

		//cp_events.addEventListener("CPAPI_SLIDEENTER", onSlideEntered);
		//cp_events.addEventListener("CPAPI_MOVIESTOP", onMovieStop);
	}
	
	function onShowFeatures () {
		$("#coach-marks").CoachMarks().CoachMarks("instance").open();
	}
	
	$('[data-toggle="popover"]').popover({ html: true });
	
	$(window).resize(sizeToFit);
	
	sizeToFit();
	
	$(".hidden-on-startup").removeClass("hidden");
	
	$(".task-steps").addClass("solo");
	
	$(".captivate-buttons input").change(onCaptivateButton);
	$("#header-play").click(onDoWatchIt);
	$(".search-button").click(onDoSearch);
	$("#show-popular").click(onDoSearch);
	$("#home-button").click(onHomeButton);
	$("#back-button").click(onHomeButton);
	$(".navmenu-nav li").click(onDoSearch);
	$("#learn-more").click(onGoToTask);
	
	// manage z-index of side-menu with scrolling content
	$("#side-menu").on("shown.bs.offcanvas", function () { $("#side-menu").css( { "z-index":  1 } ); });
	$("#side-menu").on("show.bs.offcanvas", function () { $("#side-menu").css( { display: "block" } ); });
	$("#side-menu").on("hide.bs.offcanvas", function () { $("#side-menu").css( { "z-index": -1 } ); });
	$("#side-menu").on("hidden.bs.offcanvas", function () { $("#side-menu").css( { display: "none" } ); });
		
	$("#feature-tour").click(onShowFeatures);
	
	$("body").on("hide.bs.modal", function () { $("video")[0].pause(); });
	
	//var inst = v.TOCViewer("instance");
	//inst.doit();
	
	var m = $(window).height() - $("#top-part").outerHeight() - $("#bottom-part").outerHeight() - $("#top-part").offset().top;
	if (m > 0) {
		$("#top-part").css("margin-bottom", m);
	}

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
	
	checkForCaptivate();
});