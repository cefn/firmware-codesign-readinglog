var seekNext = false;

/** Trigger change to hash (cross-browser). */
function loadHash(hash)
{
  if(hash != undefined) {
	var strBrowser = navigator.userAgent.toLowerCase();

	if (strBrowser.indexOf('chrome') > 0 || strBrowser.indexOf('safari') > 0) {
		this.location.href = "#" + hash;
	}
	else {
		this.window.location.hash = "#" + hash;
	}
  }
}

function labelLoaded(hash){	
	
	var matchMaker = function(string){
		return function(item){
			return item.name.indexOf(string) != -1;
		};
	};
	
	var disableSeek = function(){ seekNext = false; };
	
	if(seekNext){ //time taken to do the tween to the target label
		var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker(hash), 0); //search from start to find label matching hash
		TweenLite.fromTo(MUDSLIDE.timeline, 1, {time:MUDSLIDE.timeline.time()}, {time:label.time, onComplete:disableSeek});
	}
	else{
		MUDSLIDE.timeline.tweenTo(hash);
	}
	
}

//onload event
$(function(){

	//set up keyboard eventing
	$(document).keydown(function(e){
		
		var matchMaker = function(string){
			return function(item){
				return item.name.indexOf(string) != -1;
			};
		};
		
		if(e.which == 32){
			//SPACEBAR - navigate to next pause
			var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker("pause"));
			loadHash(label.name);
			return false;
		}
		if (e.which == 37) { 
			//LEFT ARROW - navigate back to last pause
			var label = MUDSLIDE.prevLabelMatching(MUDSLIDE.timeline, matchMaker("pause"));
			loadHash(label.name);
			return false;
		}
		if (e.which == 39) { 
			//RIGHT ARROW - navigate on to next pause
			var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker("pause"));
			loadHash(label.name);
			return false;
		}
		
	});
	
	//set up event handling for hashchange
	$(window).hashchange(function(){
		
		if(location.hash && location.hash.length > 1){
			//trigger navigation
			labelLoaded(location.hash.substring(1));		
		}
		else{
			//load initial content if no hash specified
			labelLoaded("pause-0");
		}
		
	});

	//trigger hashchange when loaded, in case the page was loaded with a hash
	seekNext = true;
	$(window).hashchange();
	
});
