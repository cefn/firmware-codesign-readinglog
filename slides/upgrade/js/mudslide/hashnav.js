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

	if(hash=="autoplay"){
		disableSeek(); //causes it to tween, not skip
		MUDSLIDE.timeline.seek(0); //moves to beginning
		//hash = MUDSLIDE.prevLabelMatching(MUDSLIDE.timeline, matchMaker("pause"), MUDSLIDE.timeline.duration()); //search from end to find final pause
		hash = "pause-0";
	}

	if(hash=="auto"){
		disableSeek(); //causes it to tween, not skip
		MUDSLIDE.timeline.seek("pause-0"); //moves to beginning
		//hash = MUDSLIDE.prevLabelMatching(MUDSLIDE.timeline, matchMaker("pause"), MUDSLIDE.timeline.duration()); //search from end to find final pause
		hash = MUDSLIDE.timeline.duration();
	}
		
	if(seekNext){ //time taken to do the tween to the target label
		var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker(hash), 0); //search from start to find label matching hash
		if(label){
			TweenLite.fromTo(MUDSLIDE.timeline, 1, {time:MUDSLIDE.timeline.time()}, {time:label.time, onComplete:disableSeek});
		}
	}
	else{		
		MUDSLIDE.timeline.tweenTo(hash);
	}
	
}

//onload event
$(function(){
	
	var ctrlPressed = false;
	var shiftPressed = false;

	$(document).keyup(function(e){
		if(e.keyCode == 17){ //ctrl key
			ctrlPressed = false;
		}		
		else if(e.keyCode == 16){ //shift key
			shiftPressed = false;
		}		
    });

	//set up keyboard eventing
	$(document).keydown(function(e){
		
		var matchMaker = function(string){
			return function(item){
				return item.name.indexOf(string) != -1;
			};
		};
				
		if(e.keyCode == 17){ //ctrl key
			ctrlPressed = true;
		}
		else if(e.keyCode == 16){ //shift key
			shiftPressed = true;
		}
		else {
			
			if(ctrlPressed){
				seekNext = true;
			}
			else{
				seekNext = false;
			}
			
			var pattern = "pause";
			if(shiftPressed){
				pattern = "scene";
			}
			
			if(e.which == 32){
				//SPACEBAR - navigate to next pause
				var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker(pattern));
				loadHash(label.name);
				return false;
			}
			else if (e.which == 37) { 
				//LEFT ARROW - navigate back to last pause
				var label = MUDSLIDE.prevLabelMatching(MUDSLIDE.timeline, matchMaker(pattern));
				loadHash(label.name);
				return false;
			}
			else if (e.which == 39) { 
				//RIGHT ARROW - navigate on to next pause
				var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker(pattern));
				loadHash(label.name);
				return false;
			}
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
