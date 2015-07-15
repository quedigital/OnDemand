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

		var types = ["watch", "try"];

		for  (var i = 0; i < types.length; i++) {
			var which = $("." + types[i]);

			var container_width = which.find(".task-demo").width();
			var container_left = which.find(".task-steps").outerWidth();

			which.find(".task-demo iframe").css({left: container_left + 15, width: container_width, maxHeight: wh, height: h});

			$(".row." + types[i]).css("min-height", h);

			/*
			container_width = $(".task-container").width();

			w = which.find(".task-steps").width();
			var margin = (container_width - w) * .5;

			$(".task-steps.solo").css("margin-left", margin);

			// give the task steps a bottom margin so the Captivate can be seen as we scroll to the last step
			//$(".task-steps").css("margin-bottom", h * .5);
			*/
		}

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

    function removeCaptivate (type) {
		$("div." + type).find(".task-demo iframe").remove();
	}

	function loadCaptivate (type, url) {
		removeCaptivate(type);

		var iframe = $("<iframe>").addClass("tutorial").attr({ frameborder: 0, src: url });

		var holder = $("div." + type);

		holder.find(".task-demo").append(iframe);

		// NOTE: I wish these numbers weren't so kludgy; they don't bode well

        iframe.affix({
            offset: {
                top: function () {
//	                return $(".task-container").offset().top - $("#search-form").outerHeight(false);
	                return $(".row." + type).offset().top - $("#search-form").outerHeight(false) - 10;
                },
                bottom: function () {
	                if (type == "watch") {
		                var t = $(".row.try-header").position().top - $("#search-form").outerHeight(true) - 80;
		                return t;
	                } else {
		                return $(".footer").outerHeight() - $("#search-form").outerHeight(false);
	                }
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

		loadCaptivate(type, path);

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

		$(window).scrollTop(0);

		$(".task-desc h2").text(toc[currentIndex].title);

		var html = toc[currentIndex].html;

        $(".steps").load(html, onStepsLoaded);

		//$(".task-steps").removeClass("animated");
		
		// delay; animate after sizing
		//setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);

		loadPlayers();
	}

	function removePlayers () {
		for (var i = 0; i < 2; i++) {
			if (cp_events[i] && cp_events[i].removeEventListener) {
				cp_events[i].removeEventListener("CPAPI_SLIDEENTER");
				cp_events[i].removeEventListener("CPAPI_MOVIESTOP");

				cp_events[i].removeEventListener("QUE_COMPLETE");
			}
		}

		cp_events = [];
		cp = []
		window.cp = [];
	}

	function loadPlayers () {
		removePlayers();

		var item = toc[currentIndex];

		// NOTE: this is now assuming we're using the Que player (ie, not Captivate anymore)

		// TODO: this path will need to be changed at Production time

		var type = "watch";

		var path;

		if (window.location.hostname == "localhost")
			path = "../Authoring/Player/index.html?" + item[type].params;
		else
			path = "player/index.html?" + item[type].params;

		loadCaptivate(type, path);

		var keys = item[type].keys;

		setCaptivateMapping(keys);

		checkForCaptivate();

		var type = "try";

		var path;

		if (window.location.hostname == "localhost")
			path = "../Authoring/Player/index.html?" + item[type].params;
		else
			path = "player/index.html?" + item[type].params;

		loadCaptivate(type, path);
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
		if (cp[0] == undefined && window.frames[0] && window.frames[0].cpAPIInterface) {
			cp[0] = window.frames[0].cpAPIInterface;
			window.cp = cp;
			cp_events[0] = window.frames[0].cpAPIEventEmitter;
			cp[0].pause();

			onCaptivateLoaded(0);
		}

		if (cp[1] == undefined && window.frames[1] && window.frames[1].cpAPIInterface) {
			cp[1] = window.frames[1].cpAPIInterface;
			window.cp = cp;
			cp_events[1] = window.frames[1].cpAPIEventEmitter;
			cp[1].pause();

			onCaptivateLoaded(1);
		}

		if (cp[0] == undefined || cp[1] == undefined) {
			setTimeout(checkForCaptivate, 100);
		}
	}
	
	function onCaptivateLoaded (index) {
        sizeToFit();

		switch (index) {
			case 0:
				// NOTE: this doesn't seem to fire from within an iFrame:
//				cp_events[index].addEventListener("CPAPI_MOVIESTART", function () { console.log("movie started!"); });

				cp_events[index].addEventListener("CPAPI_SLIDEENTER", onWatchSlideEntered);
				cp_events[index].addEventListener("CPAPI_MOVIESTOP", onWatchMovieStop);

				cp_events[index].addEventListener("QUE_COMPLETE", onWatchLessonComplete);
				break;
			case 1:
				// NOTE: this doesn't seem to fire from within an iFrame:
//				cp_events[index].addEventListener("CPAPI_MOVIESTART", function () { console.log("movie started!"); });

				cp_events[index].addEventListener("CPAPI_SLIDEENTER", onTrySlideEntered);
				cp_events[index].addEventListener("CPAPI_MOVIESTOP", onTryMovieStop);

				cp_events[index].addEventListener("QUE_COMPLETE", onTryLessonComplete);
				break;
		}

		setTimeout(function () {
			cp[index].pause();
		}, 0);

        /*
		setTimeout(function () {
	        cp.start();
	        cp.play();
        }, 1500);
        */
	}

    function onStepsLoaded () {
        $('[data-toggle="popover"]').popover({ html: true });

	    loadLeadParagraph();

	    activatePageLinks();
    }

	function loadLeadParagraph () {
		var p = $(".steps p").first();

		$(".task-desc .lead").empty().append(p.clone());
	}

	function activatePageLinks () {
		$(".step").click(onClickStep);
	}

	function onClickStep (event) {
		var t = $(event.target);

		var key = t.data("key");

		event.stopImmediatePropagation();
		event.preventDefault();

		var row = t.parents(".row");
		var type;
		if (row.hasClass("watch")) {
			type = "watch";
			cp[0].gotoSlide(key);
		} else {
			type = "try";
			cp[1].gotoSlide(key);
		}
	}

    function onWatchMovieStop () {
        var slide = getCurrentSlide(0);

	    var numSlides = getNumberOfSlides(0);

	    if (slide >= numSlides || numSlides == undefined) {
            onWatchLessonComplete();
        }
    }

	function onTryMovieStop () {
		var slide = getCurrentSlide(1);

		var numSlides = getNumberOfSlides(1);

		if (slide >= numSlides || numSlides == undefined) {
			onTryLessonComplete();
		}
	}

	function getCurrentSlide (index) {
        return cp[index].getCurrentSlideIndex();
    }

    function getNumberOfSlides (index) {
	    if (cp[index] && cp[index].getNumberOfSlides) {
		    return cp[index].getNumberOfSlides();
	    } if (captivateMapping)
            return captivateMapping.length;
	    else
	        return undefined;
    }

    function onWatchLessonComplete () {
        setTimeout(showSuccessMessage, 1000, 0);
    }

	function onTryLessonComplete () {
		setTimeout(showSuccessMessage, 1000, 1);
	}

	function showSuccessMessage (index) {
        var audio = $("#lesson-complete-audio")[0];
        audio.play();

		var type = index == 0 ? "watch" : "try";

        toc[currentIndex][type].completed = true;
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

	function onWatchSlideEntered (event) {
		// for Captivate: (and it required the captivateMapping, since removed)
		//var slide = event.Data.slideNumber;

		var key = event.key;

        var screenHeight = $(window).height();

        var centerPoint = screenHeight * .5;

		var stepDOM = $(".watch .step[data-key='" + key + "'");

		$(".watch .current").removeClass("current");

		if (stepDOM.length) {
			var gotoDOM = stepDOM;//stepDOM.find("p");

			if (gotoDOM && gotoDOM.length) {
				gotoDOM.addClass("current");

				var a = $("body").scrollTop();
				var t = gotoDOM.offset().top;
				var b = t - centerPoint;

				/*
				// don't scroll if it's already past the vertical center, unless it's off-screen
				if ((t - a) > centerPoint) {
					$("body").animate({scrollTop: b}, 2000);
				} else if (t - a < 0) {
					$("body").animate({scrollTop: b}, 2000);
				}
				*/
			}
		}
	}

	function onTrySlideEntered (event) {
		// for Captivate: (and it required the captivateMapping, since removed)
		//var slide = event.Data.slideNumber;

		var key = event.key;

		var screenHeight = $(window).height();

		var centerPoint = screenHeight * .5;

		var stepDOM = $(".try .step[data-key='" + key + "'");

		$(".try .current").removeClass("current");

		if (stepDOM.length) {
			var gotoDOM = stepDOM;//stepDOM.find("p");

			if (gotoDOM && gotoDOM.length) {
				gotoDOM.addClass("current");

				var a = $("body").scrollTop();
				var t = gotoDOM.offset().top;
				var b = t - centerPoint;

				/*
				 // don't scroll if it's already past the vertical center, unless it's off-screen
				 if ((t - a) > centerPoint) {
				 $("body").animate({scrollTop: b}, 2000);
				 } else if (t - a < 0) {
				 $("body").animate({scrollTop: b}, 2000);
				 }
				 */
			}
		}
	}

	function buildUIforTOC () {
		var m = $("#contents-menu ul");

		m.empty();

		for (var i = 0; i < toc.length; i++) {
			var t = toc[i];
			var li = $("<li>", { class: "entry" });
			var a = $("<a>", { text: t.title });
			a.appendTo(li);
			if (t.html) {
				li.click($.proxy(onClickTaskFromMenu, this, i));
			} else {
				li.addClass("chapter");
			}
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

	var cp = [], cp_events = [];

	var path = $.urlParam("content");
	var datafile = decodeURI(path);

	require([datafile], onLoadedTOC);

	var currentIndex = 1, currentType = undefined;

	var toc, title;

	function initialize () {
		var v = $(".toc-viewer").TOCViewer();
		$(".search-results-container").SearchResults();
		var sr = $(".search-results-container").SearchResults("instance");
		sr.option("toc", toc);

		$(".project-title").text(title);

		buildUIforTOC();
	}

	function onLoadedTOC (metadata) {
		toc = metadata.toc;
		title = metadata.title;

		initialize();
	}

	$(window).resize(sizeToFit);
		
	$(".hidden-on-startup").removeClass("hidden");
	
	//$(".task-steps").addClass("solo");
	
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