requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap.min",
		"jasny-bootstrap": "jasny-bootstrap.min"
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

require(["toc-viewer", "bootstrap", "jasny-bootstrap"], function () {

	var v = $(".toc-viewer").TOCViewer();
	
	function sizeToFit () {
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
	
	$(window).resize(sizeToFit);
	
	$(".task-steps").addClass("solo");
	
	$(".captivate-buttons input").change(onCaptivateButton);
	
	sizeToFit();
	
	setTimeout(function () { $(".task-steps").addClass("animated"); }, 0);

	//var inst = v.TOCViewer("instance");
	//inst.doit();

	$("#captivate-iframe").affix({
		offset: {
			top: function () { return $(".task-container").offset().top - $("#search-form").outerHeight(true); },
			bottom: function () { return $(".footer").outerHeight() - $("#search-form").outerHeight(true); }
		}
	});

/*
var $body   = $(document.body);
var navHeight = $('.navbar').outerHeight(true) + 10;

$body.scrollspy({
	target: '#leftCol',
	offset: navHeight
});
*/

});