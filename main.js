requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.3.min",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"jasny-bootstrap": "jasny-bootstrap.min",
		"holder": "holder.min",
		"joyride": "jquery.joyride-2.1",
		"jquery-json": "jquery.json.min"
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
		"jquery-json": {
			export: "$",
			deps: ['jquery']
		}
	},
});

// NOTE: Couldn't use embed-responsive-4by3 for the iframe (even though it made sizing automatic) because it didn't (easily) work with affix's fixed positioning

require(["domready", "holder", "toc-viewer", "bootstrap", "jquery-json", "jasny-bootstrap", "search-results", "joyride", "coach-marks"], function (domReady) {

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

		var holder = $(".demo-holder");

		var container_width = holder.find(".task-demo").width();
		var container_left = holder.find(".task-steps").outerWidth();

//		holder.find(".task-demo iframe").css({left: container_left + 15, width: container_width, maxHeight: wh, height: h});
		holder.find(".task-demo iframe").css({width: container_width, maxHeight: wh, height: h});

		holder.css("min-height", h);
		$(".task-demo").css("min-height", h);

		/*
		container_width = $(".task-container").width();

		w = which.find(".task-steps").width();
		var margin = (container_width - w) * .5;

		$(".task-steps.solo").css("margin-left", margin);

		// give the task steps a bottom margin so the Captivate can be seen as we scroll to the last step
		//$(".task-steps").css("margin-bottom", h * .5);
		*/

		var a = $("#welcome-search").outerHeight();
		var b = $("#start-to-finish").outerHeight();
		if (a < b) {
			$("#welcome-search").outerHeight(b);
		} else if (b < a) {
			$("#start-to-finish").outerHeight(a);
		}
	}
	
    function setCaptivateMapping (keys) {
        captivateMapping = keys;
    }

    function removeCaptivate (type) {
		$("iframe.tutorial." + type).remove();
	}

	function loadCaptivate (type, url) {
		removeCaptivate(type);

		var iframe = $("<iframe>").addClass("tutorial " + type).attr({ frameborder: 0, src: url });

		$("#tab-" + type).empty().append(iframe);

		//$(".task-demo").prepend(iframe);

		// NOTE: I wish these numbers weren't so kludgy; they don't bode well

		/*
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
        */
	}

	function getCaptivateFrameReady () {
		if (event)
			event.stopPropagation();

		if ($("#taskpane").hasClass("hidden")) {
			onGoToCurrentTask(event);
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
		console.log("play it");

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
		
		$(".go-to-current-task").click(onGoToCurrentTask);
//		$(".do-watch-it").click(onDoWatchIt);
		
		$("#taskpane").addClass("hidden");
		$("#homepane").addClass("hidden");
		$("#progress").removeClass("hidden");
		$("#searchpane").removeClass("hidden");
		//$("body").css("padding-top", 80);
		
		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").removeClass("hidden");
	}

	function setCurrentIndex (index) {
		currentIndex = index;

		$("li.entry").removeClass("current");
		$("li.entry[data-index=" + currentIndex + "]").addClass("current");
	}
	
	function onGoToCurrentTask (event) {
		$('#previewModal').modal('hide');
		
		$("#homepane").addClass("hidden");
		$("#searchpane").addClass("hidden");
		$("#taskpane").removeClass("hidden");

		$("#progress").removeClass("hidden");

		$("#toc-button").removeClass("hidden");
		$("#search-form").removeClass("hidden");
		$(".back-to-search").addClass("hidden");
		//$("body").css("padding-top", 50);

		$(window).scrollTop(0);

		$(".task-desc h2").text(toc[currentIndex].title);
		$("a.navbar-brand .title").html("Back to <span class='title'>" + title + "</span> Home");

		var html = toc[currentIndex].html;

        $(".steps").load(html, onStepsLoaded);

		$(".banner.selected").removeClass("selected");
		$(".banner.watch").addClass("selected");

		//$(".task-steps").removeClass("animated");
		
		// delay; animate after sizing
		//setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);

		showNextTask(1);

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

		type = "try";

		if (window.location.hostname == "localhost")
			path = "../Authoring/Player/index.html?" + item[type].params;
		else
			path = "player/index.html?" + item[type].params;

		loadCaptivate(type, path);

		var keys = item[type].keys;
		setCaptivateMapping(keys);

		checkForCaptivate();
	}
	
	function onHomeButton () {
		$("#searchpane").addClass("hidden");
		$("#taskpane").addClass("hidden");
		$("#homepane").removeClass("hidden");
		
		$("#toc-button").removeClass("hidden");
		$(".back-to-search").addClass("hidden");
		//$("body").css("padding-top", 50);
		
		$("#search-form").addClass("hidden");
		$("#progress").removeClass("hidden");

		$("a.navbar-brand .title").text(title);

		showNextTask(0);
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

				cp_events[index].addEventListener("CPAPI_SLIDEENTER", onSlideEntered);
				cp_events[index].addEventListener("CPAPI_MOVIESTOP", onMovieStop);

				cp_events[index].addEventListener("QUE_COMPLETE", onLessonComplete);
				break;
			case 1:
				// NOTE: this doesn't seem to fire from within an iFrame:
//				cp_events[index].addEventListener("CPAPI_MOVIESTART", function () { console.log("movie started!"); });

				cp_events[index].addEventListener("CPAPI_SLIDEENTER", onSlideEntered);
				cp_events[index].addEventListener("CPAPI_MOVIESTOP", onMovieStop);

				cp_events[index].addEventListener("QUE_COMPLETE", onLessonComplete);
				break;
		}

		setTimeout(function () {
			cp[index].pause();
		}, 0);
	}

    function onStepsLoaded () {
        $('[data-toggle="popover"]').popover({ html: true });

	    loadLeadParagraph();

	    activatePageLinks();
    }

	function loadLeadParagraph () {
		var p = $(".steps p").first();

		$(".task-desc .lead").empty().append(p.clone());

		$(".button-holder").css("min-height", $(".task-desc").outerHeight());
	}

	function activatePageLinks () {
		$(".step").click(onClickStep);
	}

	function onClickStep (event) {
		var t = $(event.target);

		var key = t.data("key");

		event.stopImmediatePropagation();
		event.preventDefault();

		if (currentType == "watch") {
			cp[0].gotoSlide(key);
		} else {
			cp[1].gotoSlide(key);
		}
	}

    function onMovieStop () {
        var slide = getCurrentSlide(0);

	    var numSlides = getNumberOfSlides(0);

	    if (slide >= numSlides || numSlides == undefined) {
            onLessonComplete();
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

    function onLessonComplete () {
	    saveStatus(currentIndex, currentType, true);

        setTimeout(showSuccessMessage, 1000, 0);
    }

	function showSuccessMessage (index) {
        var audio = $("#lesson-complete-audio")[0];
        audio.play();

		var type = index == 0 ? "watch" : "try";
    }

	function saveStatus (index, type, status) {
		switch (type) {
			case "watch":
				toc[index]["watched"] = status;
				break;
			case "try":
				toc[index]["tried"] = status;
				break;
		}

		refreshStatusUI();

		saveTOCStatus();
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
		var m = $("#contents-menu-list");

		m.empty();

		var li = $("<li>", { class: "entry header" });
		var a = $("<p>");
		a.appendTo(li);

		var watched = $("<div>", { class: "watched checkable" });
		watched.append('<i class="fa fa-eye">');
		watched.appendTo(li);
		var tried = $("<div>", { class: "tried checkable" });
		tried.append('<i class="fa fa-hand-o-left">');
		tried.appendTo(li);

//		li.addClass("chapter");
		li.appendTo(m);

		for (var i = 0; i < toc.length; i++) {
			var t = toc[i];
			var li = $("<li>", { class: "entry" }).attr("data-index", i);
			var a = $("<a>", { text: t.title });
			a.appendTo(li);

			var watched = $("<div>", { class: "watched checkable" });
			if (toc[i].watched) {
				watched.append("<i class='fa fa-check'>");
			}
			watched.appendTo(li);

			var tried = $("<div>", { class: "tried checkable" });
			if (toc[i].tried) {
				tried.append("<i class='fa fa-check'>");
			}
			tried.appendTo(li);

			if (t.html) {
				li.click($.proxy(onClickTaskFromMenu, this, i));
			} else {
				li.addClass("chapter");
			}
			li.appendTo(m);
		}
	}

	function showNextTask (offset) {
		if (offset == undefined) offset = 1;

		var found = false;

		for (var i = currentIndex + offset; i < toc.length; i++) {
			var t = toc[i];
			if (t.html) {
				$(".next-task-title").text(t.title);
				found = true;
				break;
			}
		}

		$(".next-task-title").parent().css("display", found ? "block" : "none");
		$("#next-task-ad").css("display", found ? "block" : "none");

		found = false;

		for (var i = currentIndex + offset - 2; i >= 0; i--) {
			var t = toc[i];
			if (t.html) {
				$(".prev-task-title").text(t.title);
				found = true;
				break;
			}
		}

		$(".prev-task-title").parent().css("display", found ? "block" : "none");
	}

	function getNextTaskTitle () {
		for (var i = currentIndex + 1; i < toc.length; i++) {
			var t = toc[i];
			if (t && t.html) {
				return t.title;
			}
		}
	}

	function onGoToNextTask () {
		for (var i = currentIndex + 1; i < toc.length; i++) {
			var t = toc[i];
			if (t && t.html) {
				setCurrentIndex(i);
				onGoToCurrentTask();
				break;
			}
		}
	}

	function onGoToPrevTask () {
		for (var i = currentIndex - 1; i >= 0; i--) {
			var t = toc[i];
			if (t && t.html) {
				setCurrentIndex(i);
				onGoToCurrentTask();
				break;
			}
		}
	}

	function onClickTaskFromMenu (index) {
		$("#contents-menu").offcanvas('hide');

		setCurrentIndex(index);

		onGoToCurrentTask();
	}

	function onSearchDoWatchIt (event, index) {
		setCurrentIndex(index);

		onDoWatchIt(event, true);
	}

	function onSearchDoTryIt (event, index) {
		setCurrentIndex(index);

		onDoTryIt(event, true);
	}

	function onSearchGoToTask (event, index) {
		setCurrentIndex(index);

		onGoToCurrentTask(event);
	}

	function onClickTab (event) {
		var tab = $(event.target);
		currentType = tab.attr("data-type");
	}

	function getFolderName (path) {
		var s = path.split("/");
		if (s.length) return s[0];

		return "undefined";
	}

	var cp = [], cp_events = [];

	var path = $.urlParam("content");
	var datafile = decodeURI(path);

	var foldername = getFolderName(datafile);

	require([datafile], onLoadedTOC);

	var currentIndex, currentType = "watch";

	var toc, title;

	function initialize () {
		var v = $(".toc-viewer").TOCViewer();
		$(".search-results-container").SearchResults();
		var sr = $(".search-results-container").SearchResults("instance");
		sr.option("toc", toc);

		$(".project-title").text(title);
		$("a.navbar-brand .title").text(title);

		loadTOCStatus();

		buildUIforTOC();

		setCurrentIndex(1);

		showNextTask(0);
	}

	function onLoadedTOC (metadata) {
		toc = metadata.toc;
		title = metadata.title;

		initialize();
	}

	function saveTOCStatus () {
		var savedStatus = [];

		for (var i = 0; i < toc.length; i++) {
			if (!savedStatus[i])
				savedStatus[i] = {};

			savedStatus[i].watched = toc[i].watched;
			savedStatus[i].tried = toc[i].tried;
		}

		var data = localStorage.getItem(foldername);
		if (!data) {
			data = {};
		} else {
			data = $.evalJSON(data);
		}

		data.status = savedStatus;

		localStorage.setItem(foldername, $.toJSON(data));
	}

	function loadTOCStatus () {
		var data = localStorage.getItem(foldername);
		if (data) {
			data = $.evalJSON(data);
		}

		for (var i = 0; i < toc.length; i++) {
			if (data && data.status[i]) {
				toc[i].watched = data.status[i].watched;
				toc[i].tried = data.status[i].tried;
			} else {
				toc[i].watched = false;
				toc[i].tried = false;
			}
		}
	}

	function refreshStatusUI () {
		for (var i = 0; i < toc.length; i++) {
			var el = $("li[data-index=" + i + "]");
			el.find(".watched i").remove();
			if (toc[i].watched) {
				el.find(".watched").append("<i class='fa fa-check'>");
			}

			el.find(".tried i").remove();
			if (toc[i].tried) {
				el.find(".tried").append("<i class='fa fa-check'>");
			}
		}
	}

	function pauseBoth () {
		cp[0].pause();
		cp[1].pause();
	}

	$(window).resize(sizeToFit);
		
	$(".hidden-on-startup").removeClass("hidden");
	
	//$(".task-steps").addClass("solo");

	$(".search-button").click(onDoSearch);

	$("#show-popular").click(onDoSearch);
	$(".home-button").click(onHomeButton);
	$("#back-button").click(onHomeButton);
	//$(".navmenu-nav li").click(onDoSearch);
//	$("#learn-more").click(onGoToTask);
//	$("#progress").click(onShowProgress);
	$(".go-to-current-task").click(onGoToCurrentTask);
	$(".go-to-next-task").click(onGoToNextTask)
	$(".go-to-prev-task").click(onGoToPrevTask)

	$("#watch-try-tabs a[data-toggle='tab']").on("shown.bs.tab", onClickTab);

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

	$(".nav-tabs a").on("show.bs.tab", pauseBoth);

	//$("#accordion").clone().appendTo("#my-progress-clone-holder");
	
	//var inst = v.TOCViewer("instance");
	//inst.doit();
});