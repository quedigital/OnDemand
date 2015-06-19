requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"jasny-bootstrap": "jasny-bootstrap.min",
		"holder": "holder.min",
		"joyride": "jquery.joyride-2.1",
		//"toc-data": "../google_hangouts/toc-data"
		"toc-data": "../habitat_test/toc-data"
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

require(["domready", "toc-data", "holder", "toc-viewer", "bootstrap", "jasny-bootstrap", "search-results", "joyride", "coach-marks"], function (domReady, tocData) {

	$.urlParam = function(name){
		var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
		if (results==null){
			return null;
		}
		else{
			return results[1] || 0;
		}
	}

	domReady(function () {
		sizeToFit();
	});

	function sizeToFit () {
		var screenHeight = $(window).height();
		
		$(".screenheight").css("min-height", screenHeight - 50);
		
		var bh = $("#main-bar").height();
		var wh = $(window).innerHeight() - bh;
		
		var w = $(".task-demo").width();
		var h = w * .75;
		
		var container_width = $(".task-demo").width();
		var container_left = $(".task-steps").outerWidth();
		
		$(".task-demo iframe").css( { left: container_left + 15, width: container_width, maxHeight: wh, height: h } );
		
		container_width = $(".task-container").width();
		w = $(".task-steps").width();
		var margin = (container_width - w) * .5;
		$(".task-steps.solo").css("margin-left", margin);

		// give the task steps a bottom margin so the Captivate can be seen as we scroll to the last step
		$(".task-steps").css("margin-bottom", h * .5);

		var a = $("#welcome-search").outerHeight();
		var b = $("#start-to-finish").outerHeight();
		if (a < b) {
			$("#welcome-search").outerHeight(b);
		} else if (b < a) {
			$("#start-to-finish").outerHeight(a);
		}
	}
	
	function onWatchOrTryButton (event) {						
		if ($(event.target).is($("#watch-button"))) {
			$("#try-button").prop("checked", false);
			$("#try-button").parents("label").removeClass("active");
		} else if ($(event.target).is($("#try-button"))) {
			$("#watch-button").prop("checked", false);
			$("#watch-button").parents("label").removeClass("active");
		}

		var watchit = $("#watch-button").prop("checked");
		var tryit = $("#try-button").prop("checked");
		
		if (!watchit && !tryit) {
			$(".task-steps").addClass("solo").removeClass("dual");
			$(".task-demo").addClass("hidden");
			
			sizeToFit();
		} else if (watchit) {
			onDoWatchIt(event, false);
		} else if (tryit) {
			onDoTryIt(event, false);
		}
	}

    function setCaptivateMapping (keys) {
        captivateMapping = keys;
    }

    function removeCaptivate () {
		$(".task-demo iframe").remove();
	}

	function loadCaptivate (url) {
		removeCaptivate();

		var iframe = $("<iframe>").addClass("tutorial").attr({ frameborder: 0, src: url });

		$(".task-demo").append(iframe);

        $(".task-demo iframe").affix({
            offset: {
                top: function () {
                    return $(".task-container").offset().top - $("#search-form").outerHeight(false);
                },
                bottom: function () {
                    return $(".footer").outerHeight() - $("#search-form").outerHeight(false);
                }
            }
        });
	}

	function getCaptivateFrameReady () {
		if (event)
			event.stopPropagation();

		if ($("#taskpane").hasClass("hidden")) {
			onGoToTask(event);
		}

		$(".task-steps.solo").removeClass("solo").addClass("dual").css("margin-left", 0);

		$(".task-demo.hidden").removeClass("hidden");

		sizeToFit();

		if (scrollTo != false) {
            var t = $(".task-steps").offset().top - 50;
            $("html, body").animate({ scrollTop: t }, 1000);
		}
	}

	function onDoWatchIt (event, scrollTo) {
		getCaptivateFrameReady();

        playIt("watch");
	}

	function onDoTryIt (event, scrollTo) {
		getCaptivateFrameReady();

        playIt("try");
	}

	function playIt (type) {
        currentType = type;

		var item = toc[currentIndex];

		// NOTE: this is now assuming we're using the Que player (ie, not Captivate anymore)

		// TODO: this path will need to be changed at Production time

		var path;

		if (window.location.hostname == "localhost")
			path = "../Authoring/Player/index.html?" + item[type].params;
		else
			path = "player/index.html?" + item[type].params;

		loadCaptivate(path);

		var keys = item[type].keys;

		setCaptivateMapping(keys);

		checkForCaptivate();
	}

	function onDoSearch () {
		$(window).scrollTop(0);
		
		var sr = $(".search-results-container").SearchResults("instance");
		sr.doit(toc);

		$(".go-to-task").off("click");
//		$(".do-watch-it").off("click");
		
		$(".go-to-task").click(onGoToTask);
//		$(".do-watch-it").click(onDoWatchIt);
		
		$("#taskpane").addClass("hidden");
		$("#homepane").addClass("hidden");
		$("#progress").removeClass("hidden");
		$("#searchpane").removeClass("hidden");
		$("body").css("padding-top", 80);
		
		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").removeClass("hidden");
	}
	
	function onGoToTask (event) {
		$('#previewModal').modal('hide');
		
		$("#homepane").addClass("hidden");
		$("#searchpane").addClass("hidden");
		$("#taskpane").removeClass("hidden");

		$("#progress").removeClass("hidden");

		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").addClass("hidden");
		$("body").css("padding-top", 50);

		$(".task-desc h2").text(toc[currentIndex].title);

		var html = toc[currentIndex].html;

        $(".steps").load(html, onStepsLoaded);

		$(".task-steps").removeClass("animated");
		
		sizeToFit();
		
		// delay; animate after sizing
		setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);
	}
	
	function onHomeButton () {
		$("#searchpane").addClass("hidden");
		$("#taskpane").addClass("hidden");
		$("#homepane").removeClass("hidden");
		
		$("#toc-button").removeClass("hidden");
		$(".back-to-search").addClass("hidden");
		$("body").css("padding-top", 50);
		
		$("#search-form").addClass("hidden");
		$("#progress").removeClass("hidden");
	}

	function checkForCaptivate () {
		if (window.frames[0].cpAPIInterface) {
			cp = window.frames[0].cpAPIInterface;
			window.cp = cp;
			cp_events = window.frames[0].cpAPIEventEmitter;
            cp.pause();

			onCaptivateLoaded();
		} else {
			setTimeout(checkForCaptivate, 100);
		}
	}
	
	function onCaptivateLoaded () {
        sizeToFit();

		//window.cp.pause();
		
		// NOTE: this doesn't seem to fire from within an iFrame:
		cp_events.addEventListener("CPAPI_MOVIESTART", function () { console.log("movie started!"); });

		cp_events.addEventListener("CPAPI_SLIDEENTER", onSlideEntered);
		cp_events.addEventListener("CPAPI_MOVIESTOP", onMovieStop);

		cp_events.addEventListener("QUE_COMPLETE", onLessonComplete);

        setTimeout(function () {
	        cp.start();
	        cp.play();
        }, 1500);
	}

    function onStepsLoaded () {
        $('[data-toggle="popover"]').popover({ html: true });
    }

    function onMovieStop () {
        var slide = getCurrentSlide();

	    var numSlides = getNumberOfSlides();

	    if (slide >= numSlides || numSlides == undefined) {
            onLessonComplete();
        }
    }

    function getCurrentSlide () {
        return cp.getCurrentSlideIndex();
    }

    function getNumberOfSlides () {
	    if (cp && cp.getNumberOfSlides) {
		    return cp.getNumberOfSlides();
	    } if (captivateMapping)
            return captivateMapping.length;
	    else
	        return undefined;
    }

    function onLessonComplete () {
        setTimeout(showSuccessMessage, 1000);
    }

    function showSuccessMessage () {
        var audio = $("#lesson-complete-audio")[0];
        audio.play();

        toc[currentIndex][currentType].completed = true;
    }

    function onShowFeatures () {
		$("#coach-marks").CoachMarks().CoachMarks("instance").open();
	}
	
	function onShowProgress () {
		$(".my-progress").toggleClass("showing");
		
		if ($(".my-progress").hasClass("showing")) {
			$(".my-progress").css("transform", "translateX(0)");
			$("#searchpane #left-side").removeClass("col-xs-12").addClass("col-xs-9");
			$("#searchpane #my-progress-clone-holder").removeClass("hidden").addClass("col-xs-3");
		} else {
			$(".my-progress").css("transform", "translateX(500px)");
			$("#searchpane #left-side").removeClass("col-xs-9").addClass("col-xs-12");
			$("#searchpane #my-progress-clone-holder").removeClass("col-xs-3").addClass("hidden");
		}
	}

	function onSlideEntered (event) {
		// for Captivate: (and it required the captivateMapping, since removed)
		//var slide = event.Data.slideNumber;

		var key = event.key;

        var screenHeight = $(window).height();

        var centerPoint = screenHeight * .5;

		var stepDOM = $(".step[data-key='" + key + "'");

		$(".current").removeClass("current");

		if (stepDOM.length) {
			var gotoDOM = stepDOM.find("p");

			if (gotoDOM && gotoDOM.length) {
				gotoDOM.addClass("current");

				var a = $("body").scrollTop();
				var t = gotoDOM.offset().top;
				var b = t - centerPoint;

				// don't scroll if it's already up the vertical center
				if ((t - a) > centerPoint) {
					$("body").animate({scrollTop: b}, 2000);
				}
			}
		}
	}

	function buildUIforTOC () {
		var m = $("#contents-menu ul");

		m.empty();

		for (var i = 0; i < toc.length; i++) {
			var t = toc[i];
			var li = $("<li>", { class: "bob" });
			var a = $("<a>", { text: t.title });
			a.appendTo(li);
			li.click($.proxy(onClickTaskFromMenu, this, i));
			li.appendTo(m);
		}
	}

	function onClickTaskFromMenu (index) {
		$("#contents-menu").offcanvas('hide');

		currentIndex = index;

		onGoToTask();
	}

	function onSearchDoWatchIt (event, index) {
		currentIndex = index;

		onDoWatchIt(event, true);
	}

	function onSearchDoTryIt (event, index) {
		currentIndex = index;

		onDoTryIt(event, true);
	}

	function onSearchGoToTask (event, index) {
		currentIndex = index;

		onGoToTask(event);
	}

	var path = $.urlParam("content");
	var datafile = decodeURI(path);

	require([datafile], onLoadedTOC);

	var currentIndex = 1, currentType = undefined;

	var toc;

	function initialize () {
		var v = $(".toc-viewer").TOCViewer();
		$(".search-results-container").SearchResults();
		var sr = $(".search-results-container").SearchResults("instance");
		sr.option("toc", toc);

		buildUIforTOC();
	}

	function onLoadedTOC (tocData) {
		toc = tocData;

		initialize();
	}

	$(window).resize(sizeToFit);
		
	$(".hidden-on-startup").removeClass("hidden");
	
	$(".task-steps").addClass("solo");
	
	$(".captivate-buttons input").change(onWatchOrTryButton);
	$("#header-play").click(onDoWatchIt);
	$(".search-button").click(onDoSearch);
	$("#show-popular").click(onDoSearch);
	$("#home-button").click(onHomeButton);
	$("#back-button").click(onHomeButton);
	//$(".navmenu-nav li").click(onDoSearch);
//	$("#learn-more").click(onGoToTask);
//	$("#progress").click(onShowProgress);
	$(".go-to-task").click(onGoToTask);
	
	// manage z-index of side-menu with scrolling content
	$("#side-menu").on("shown.bs.offcanvas", function () { $("#side-menu").css( { "z-index":  1 } ); });
	$("#side-menu").on("show.bs.offcanvas", function () { $("#side-menu").css( { display: "block" } ); });
	$("#side-menu").on("hide.bs.offcanvas", function () { $("#side-menu").css( { "z-index": -1 } ); });
	$("#side-menu").on("hidden.bs.offcanvas", function () { $("#side-menu").css( { display: "none" } ); });
		
	$("#help").click(onShowFeatures);
	
	$("body").on("hide.bs.modal", function () { $("video")[0].pause(); });

	$("body").on("do-watch-it", onSearchDoWatchIt);
	$("body").on("do-try-it", onSearchDoTryIt);
	$("body").on("go-to-task", onSearchGoToTask);

	//$("#accordion").clone().appendTo("#my-progress-clone-holder");
	
	//var inst = v.TOCViewer("instance");
	//inst.doit();
});