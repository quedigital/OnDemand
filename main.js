requirejs.config({
	baseUrl: "js",
	paths: {
		"jquery": "jquery-2.1.4",
		"jquery.ui": "jquery-ui.min",
		"bootstrap": "bootstrap",
		"jasny-bootstrap": "jasny-bootstrap.min",
		"holder": "holder.min",
		"joyride": "jquery.joyride-2.1",
		"jquery-json": "jquery.json.min",
		"lunr": "lunr.min",
		"imagesloaded": "imagesloaded.pkgd.min"
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

require(["domready", "imagesloaded", "holder", "toc-viewer", "bootstrap", "jquery-json", "jasny-bootstrap", "search-results", "joyride", "coach-marks"], function (domReady, imagesLoaded) {

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
		var screenWidth = $(window).width();
		
		$(".screenheight").css("min-height", screenHeight - 50);
		
		var bh = $("#header-nav").height();
		var wh = $(window).innerHeight() - bh - $("#watch-try-tabs").height() - 15;
		
		var w = $(".task-demo").width();
		var h = w * .75;

		var holder = $(".demo-holder");

		var container_width = holder.find(".task-demo").width();
		var container_left = holder.find(".task-steps").outerWidth();

		holder.css("min-height", "");
		holder.css("min-height", $("#video-holder").height() + 15);

		// go single-column with widths less than 992px

		var narrow = false;

		if (screenWidth < 992) {
			$(".task-demo").css("min-height", h);
			holder.find(".task-demo iframe").css({width: container_width, height: h});
			narrow = true;
		} else {
			$(".task-demo").css("min-height", "");
			$(".task-demo").css("min-height", $(".demo-holder").height());
			holder.find(".task-demo iframe").css({width: container_width, maxHeight: wh, height: h});
		}

		var a = $("#welcome-search").outerHeight();
		var b = $("#start-to-finish").outerHeight();
		if (a < b) {
			$("#welcome-search").outerHeight(b);
		} else if (b < a) {
			$("#start-to-finish").outerHeight(a);
		}

		$(window).off(".affix");
		$("#video-holder").removeClass("affix affix-top affix-bottom").removeData("bs.affix");

		if (!narrow) {
			//var t = $("#video-holder").parent().offset().top - $("#header-nav").outerHeight(false);
			var t = $("#header-nav").outerHeight(true);
			var b = $(".footer").outerHeight() + 15;

			$("#video-holder").affix({
				offset: {
					top: function () {
						return t;
					},
					bottom: function () {
						return b;
					}
				}
			});
		}

		$("#coach-marks").CoachMarks().CoachMarks("onResize");
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

	function onDoWatchIt (event, scrollTo) {
		event.stopPropagation();

		onGoToNextTask(event, "watch");
	}

	function onDoTryIt (event) {
		event.stopPropagation();

		onGoToNextTask(event, "try");
	}

	function onDoSearch () {
		$(window).scrollTop(0);

		var term = $("#query").val();
		
		var sr = $("#searchpane").SearchResults("instance");
		sr.doSearch(term);

		$(".go-to-task").off("click");
//		$(".do-watch-it").off("click");
		
		$(".go-to-current-task").click(onGoToCurrentTask);
//		$(".do-watch-it").click(onDoWatchIt);

		setScreen("search");
	}

	function setCurrentIndex (index) {
		currentIndex = index;

		$("li.entry").removeClass("current");
		$("li.entry[data-index=" + currentIndex + "]").addClass("current");
	}
	
	function onGoToCurrentTask (event, type) {
		//$("body").css("padding-top", 50);

		$(window).scrollTop(0);

		$(".task-desc h2").text(toc[currentIndex].title);

		var html = toc[currentIndex].html;

        $(".steps").load(html, onStepsLoaded);

		$(".banner.selected").removeClass("selected");
		$(".banner.watch").addClass("selected");

		//$(".task-steps").removeClass("animated");
		
		// delay; animate after sizing
		//setTimeout(function () { $(".task-steps").addClass("animated"); }, 10);

		showNextTask(1);

		loadPlayers();

		refreshStatusUI();

		if (type != undefined) {
			var tabHref = "#tab-" + type;
			$("a[href='" + tabHref + "']").tab('show');
		}

		setScreen("task");
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
			path = "../Authoring/Player2/index.html?" + item[type].params;
		else
			path = "player2/index.html?" + item[type].params;

		loadCaptivate(type, path);

		type = "try";

		if (window.location.hostname == "localhost")
			path = "../Authoring/Player2/index.html?" + item[type].params;
		else
			path = "player2/index.html?" + item[type].params;

		loadCaptivate(type, path);

		var keys = item[type].keys;
		setCaptivateMapping(keys);

		checkForCaptivate();
	}
	
	function onHomeButton () {
		setScreen("home");

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
			cp[0].gotoStep(key);
		} else {
			cp[1].gotoStep(key);
		}
	}

    function onMovieStop () {
        var slide = getCurrentStep(0);

	    var numSlides = getNumberOfSlides(0);

	    if (slide >= numSlides || numSlides == undefined) {
            onLessonComplete();
        }
    }

	function getCurrentStep (index) {
        return cp[index].getCurrentStepIndex();
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

	    highlightSlide(undefined);
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

    function onShowFeatures (event) {
	    if (event)
	        event.preventDefault();

	    var coach = $("#coach-marks").CoachMarks().CoachMarks("instance");

	    var dynamics = [
		    { selector: "h2.task-name", text: "Here's the name of the task you're learning", pos: "bottom", set: "task" },
		    { selector: "ol.steps", text: "Follow along with the numbered steps", pos: "top", set: "task" },
		    { selector: "#watch-try-tabs", text: "Choose to watch or try the task", pos: "left", set: "task" },
		    { selector: "#video-holder", text: "This is the screen you'll interact with", pos: "left", set: "task" },
		    { selector: "button.go-to-next-task", text: "Go on to another task", pos: "bottom", set: "task" }
	    ];

	    coach.option("dynamics", dynamics);

        coach.open( { set: currentScreen } );
	}

	function onHelpContact (event) {
		event.preventDefault();

		window.open("http://www.quepublishing.com/about/contact_us/", "_blank");
	}

	function onHelpFAQ (event) {
		event.preventDefault();

		var options = {};

		$('#myModal').modal(options);
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
		var key = event.key;

		highlightSlide(key);
	}

	function highlightSlide (key) {
        var screenHeight = $(window).height();

        var centerPoint = screenHeight * .5;

		var stepDOM = $("[data-key=" + key + "]");

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
		watched.append($('<span>', { text: "Watched It " }));
		watched.append('<i class="fa fa-eye">');
		watched.appendTo(li);
		var tried = $("<div>", { class: "tried checkable" });
		tried.append($('<span>', { text: "Tried It " }));
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

		if (currentIndex == 1)
			$("#next-task-label").text("First Up");
		else
			$("#next-task-label").text("Next Up");

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

		$("a[href='#tab-watch']").tab('show');
	}

	function getNextTaskTitle () {
		for (var i = currentIndex + 1; i < toc.length; i++) {
			var t = toc[i];
			if (t && t.html) {
				return t.title;
			}
		}
	}

	function onGoToNextTask (event, type) {
		for (var i = currentIndex + 1; i < toc.length; i++) {
			var t = toc[i];
			if (t && t.html) {
				setCurrentIndex(i);
				onGoToCurrentTask(event, type);
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

	function onClearSearch () {
		$("#query").val("");
	}

	function onGoBack (event) {
		setScreen(lastScreen);
	}

	function onClickTab (event) {
		var tab = $(event.target);
		currentType = tab.attr("data-type");

		// when switching tabs, highlight the current slide for that type of viewer
		var index;
		switch (currentType) {
			case "watch":
				index = 0;
				break;
			case "try":
				index = 1;
				break;
		}

		// if we've stepped through a task, show our current step
		if (cp_events[index]) {
			var onStep = cp_events[index].onCurrentStep(cp_events[index].getCurrentStepIndex());
			if (!onStep) {
				highlightSlide(undefined);
			}
		}
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

	var searchfile = foldername + "/search_index.js";

	require([searchfile], onLoadedSearchIndex);

	var currentIndex, currentType = "watch";

	var toc, title, savedParams = {};

	function initialize () {
		var v = $(".toc-viewer").TOCViewer();

		$("#searchpane").SearchResults();
		var sr = $("#searchpane").SearchResults("instance");
		sr.option("toc", toc);

		$(".project-title").text(title);
		$("a.navbar-brand .title").text(title);

		loadTOCStatus();

		setScreen("home");

		buildUIforTOC();

		setCurrentIndex(1);

		showNextTask(0);
	}

	function onLoadedTOC (metadata) {
		toc = metadata.toc;
		title = metadata.title;

		initialize();
	}

	function onLoadedSearchIndex (data) {
		$("#searchpane").SearchResults();
		var sr = $("#searchpane").SearchResults("instance");
		sr.setSearchIndex(data);
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
		data.params = savedParams;

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

		if (data && data.params)
			savedParams = data.params;
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

		if (toc[currentIndex].watched) {
			$("#watch-try-tabs .check-mark.watch").show(0);
		} else {
			$("#watch-try-tabs .check-mark.watch").hide(0);
		}

		if (toc[currentIndex].tried) {
			$("#watch-try-tabs .check-mark.try").show(0);
		} else {
			$("#watch-try-tabs .check-mark.try").hide(0);
		}
	}

	function pauseBoth () {
		if (cp[0])
			cp[0].pause();

		if (cp[1])
			cp[1].pause();
	}

	function showFeaturesDelayed () {
		// wait for the new screen to load
		imagesLoaded($("body"), function () {
			onShowFeatures();

			if (!savedParams.seenHelp)
				savedParams.seenHelp = {};
			savedParams.seenHelp[currentScreen] = true;
		});
	}

	function setScreen (newScreen) {
		switch (newScreen) {
			case "home":
				$("#homepane").removeClass("hidden");
				$("#searchpane").addClass("hidden");
				$("#taskpane").addClass("hidden");

				$("a.navbar-brand .title").text(title);
				break;
			case "task":
				$("#homepane").addClass("hidden");
				$("#taskpane").removeClass("hidden");
				$("#searchpane").addClass("hidden");

				$("a.navbar-brand .title").html("Back to <span class='title'>" + title + "</span> Home");
				break;
			case "search":
				$("#searchpane").removeClass("hidden");
				$("#taskpane").addClass("hidden");
				$("#homepane").addClass("hidden");

				$("a.navbar-brand .title").html("Back to <span class='title'>" + title + "</span> Home");
				break;
		}

		if (newScreen != currentScreen) {
			lastScreen = currentScreen;
			currentScreen = newScreen;
		}

		if (!savedParams.seenHelp || savedParams.seenHelp[currentScreen] != true) {
			setTimeout(showFeaturesDelayed, 500);
		}
	}

	var currentScreen = lastScreen = undefined;

//	setScreen("home");

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

	$("#clear-search-button").click(onClearSearch);

	$("#watch-try-tabs a[data-toggle='tab']").on("shown.bs.tab", onClickTab);

	// manage z-index of side-menu with scrolling content
	$("#side-menu").on("shown.bs.offcanvas", function () { $("#side-menu").css( { "z-index":  1 } ); });
	$("#side-menu").on("show.bs.offcanvas", function () { $("#side-menu").css( { display: "block" } ); });
	$("#side-menu").on("hide.bs.offcanvas", function () { $("#side-menu").css( { "z-index": -1 } ); });
	$("#side-menu").on("hidden.bs.offcanvas", function () { $("#side-menu").css( { display: "none" } ); });
		
	$("#help-tour").click(onShowFeatures);
	$("#help-contact").click(onHelpContact);
	$("#help-faq").click(onHelpFAQ);
	
	/*
	$("body").on("do-watch-it", onSearchDoWatchIt);
	$("body").on("do-try-it", onSearchDoTryIt);
	*/
	$("body").on("go-to-task", onSearchGoToTask);
	$("body").on("go-back", onGoBack);

	$(".do-watch-it").click(onDoWatchIt);
	$(".do-try-it").click(onDoTryIt);

	$(".nav-tabs a").on("show.bs.tab", pauseBoth);

	//$("#accordion").clone().appendTo("#my-progress-clone-holder");
	
	//var inst = v.TOCViewer("instance");
	//inst.doit();
});