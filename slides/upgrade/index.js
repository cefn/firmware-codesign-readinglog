/** This framework for HTML5 presentations aims to make it possible to edit presentations in a static
 * form with a WYSIWYG HTML editor, whilst additionally permitting animations, multimedia and tweens
 * to be determined, by defining (CSS) selectors for HTML elements, and associating tweens with them. 
 * 
 * The static form which might be WYSIWYG-edited corresponds to the layout of scenes when all actors 
 * have been placed on stage. When launched in a browser, these scenes are augmented by the execution
 * of javascript to construct interactive, key- and mouse-driven animations. The Greensock TweenLite.from 
 * model is used to then define the way in which actors arrive on stage, by defining their starting CSS
 * configuration.
 * 
 * Slides 
 */
var MUDSLIDE = function(){
	
	/** Universal access for global variable regardless of browser or non-browser environment. */
	function getGlobal(){ //from http://www.nczonline.net/blog/2008/04/20/get-the-javascript-global/
			return (function(){return this;})();
	}
	
	/**
	 * @param {Object} from The object from which the properties should be copied.
	 * @param {Object,String} to The object or global name of object to which the properties should be copied.
	 * @param {Object} propnames The property names which should be copied. If omitted, all properties are copied.
	 */
	function copyProperties(from,to,propnames){ //if propname omitted all named properties copied
			if(!propnames){
					propnames = [];
					for(name in from){
							propnames.push(name);
					}
			}
			if(typeof to == 'string'){
					if(to in getGlobal()){
							to = getGlobal()[to]; //use existing object of this name
					}
					else{
							to = getGlobal()[to]={}; //create new object
					}
			}
			for(var idx = 0; idx < propnames.length; idx++){
					to[propnames[idx]] = from[propnames[idx]];
			}
			return to;
	}
	
	/** A sort compare function which sorts items in document order. */
	function compareDocumentOrder(a, b){
		if(a === b){
			return 0;
		}
		else{
			var DOCUMENT_POSITION_FOLLOWING = 4;
			var mask = a.compareDocumentPosition(b);
			if(mask | DOCUMENT_POSITION_FOLLOWING != 0){
				return -1;
			}
			else{
				return 1;
			}
		}
	}
	
	

	function clone(o){
		return copyProperties(o,{});
	}
	
	/** deep clone with each reference duplicated exactly once excepting global reference. */
	function deepClone(o, visited){
		if(!visited){
			visited = [];
		}
		var newitem = clone(o);
		for(var key in newitem){
			var child = newitem[key];
			if($.inArray(child, visited) || child === getGlobal()){ //try to prevent circular or runaway
				continue; //skip this value
			}
			visited.push(child);
			newitem[key] = deepClone(child, visited);				
		}
		return newitem;
	}

	var defaultShow = {
		time:0.5,
		offset:"+=0",
		stagger:"+=0",
	};

	var defaultHide = {
		time:0.2,
		offset:"+=0",
		stagger:"-=0.1",
	};

	var sceneSelector = ".scene";
	var sceneRevealTime=defaultShow.time * 2;
	
	//scene reveal is from transparency, overlapping the conceal of the preceding scene 
	var sceneShow = {
		from:{autoAlpha:0},
		time:sceneRevealTime,
		stagger:"-=" + sceneRevealTime, //sceneshow should overlap with preceding sceneHide
	};
	
	//scene conceal is reverse of scene reveal
	var sceneHide = deepClone(sceneShow);
	delete sceneHide.from; 	
	sceneHide.to = deepClone(sceneShow.from);
	sceneHide.stagger = "+=0"; //scenehide shouldn't overlap with preceding effects
		
	/** Used to construct a single timeline, combining all the scenes individual timelines into a single presentation.
	 * Animations within the deck may be...
	 * * continuous - they run throughout the presentation
	 * * reveal - transitions causing individual scenes to become visible (to simplify, they are reversed for invisible) 
	 * */
	var sceneTweenManagerFactories = [];
	sceneTweenManagerFactories[sceneSelector] = tweenManagerFactory(sceneShow, sceneHide);
	
	/** Constructs a series of timelines, one per scene, which can be combined.
	 * Animations within each scene are considered atomic (although of course other 
	 * timelines can be launched alongside, simply using greensock timelines directly). 
	 * Animations within each scene may be... 
	 * * continuous - animations running as long as the scene is visible
	 * * reveal - transitions causes invisible elements to be revealed 
	 * * substitute - transitions causing invisible elements to replace visible elements
	 * */
	 
	/* The 'actors' appear on scene in sequence and disappear in reverse sequence.
	 * This object provides selectors which match animated 'actor' elements, and associates 
	 * tweenManagerFactories which can create tweenManagers for those matching elements.
	 * The factories are used to create tweenManagers in document-order sequence. The managers
	 * are called upon in sequence to  add 'show' tweens until the scene is fully populated, and 
	 * in reverse sequence to add 'hide' tweens until the scene is empty.
	 */
	var actorTweenManagerFactories = {
		".saloondoor .left li.reveal":tweenManagerFactory({from:{autoAlpha:0,rotationY:100}}),
		".saloondoor .right li.reveal":tweenManagerFactory({from:{autoAlpha:0,rotationY:-100}}),
		".reveal.grow":tweenManagerFactory({ from:{width:0} }),
	};
	
	/* The 'stage' is always there during a scene, but can be configured to behave in a certain way 
	 * throughout the scene, by adding a tween as soon as the scene begins, and killing it when the
	 * scene finishes.  
	 * This object provides selectors which match animated stage elements, and associates 
	 * tweenManagerFactories which can create tweenManagers for those matching elements.
	 * The managers will be called upon to show the effect when the slide becomes visible, and hide
	 * the effect when the scene is no longer on stage.
	 */
	var translateMax = 50;
	var scaleMax = 1.2;
	var translateX = Math.round(-translateMax + (Math.random() * translateMax * 2));
	var translateY = Math.round(-translateMax + (Math.random() * translateMax * 2));
	var stageTweenManagerFactories = {
		".background":yoyoManagerFactory(30, {
			transform:"translateX(" + translateX + "px) translateY(" + translateY + "px) scaleX(" + scaleMax + ") scaleY(" + scaleMax + ")",
			ease:Linear.easeNone
		}),
	};

	function initDeck(){
		viewportDeck();
		return timelineDeck();
	}
	
	/** Moves all the .scene elements to be positioned at 0,0 relative to the viewport, 
	 * so they all appear presentation style in the same place (editable original is 
	 * scrollable with one scene after the next). 
	 */
	function viewportDeck(){
	
		//transforms deck to position all scenes on top of each other for later reveal
		$(sceneSelector).css({
			position:"absolute",
			left:0,
			top:0,
		});
		
		//hides unnecessary scrollbars
		$(["html,body", sceneSelector].join(",")).css({
			overflow:"hidden",
		});
		
	}
	
	function getSlideLabel(idx){
		return getFrameLabel("scene",idx);
	}

	function getPauseLabel(idx){
		return getFrameLabel("pause",idx);
	}

	/** Inserts a label to indicate a point at which the given scene is fully viewable. */
	function addSlideLabel(tl, idx){
		return addFrameLabel(tl,"scene",idx);
	}

	/** Inserts a label to indicate a point at which a sceneshow is expected to pause and wait for input. */
	function addPauseLabel(tl, idx){
		return addFrameLabel(tl,"pause",idx);
	}

	function addFrameLabel(tl,name,idx){
		return tl.addLabel(getFrameLabel(name,idx), tl.duration());
	}	

	function getFrameLabel(name,idx){
		return name + "-" + idx;
	}		
	
	function timelineDeck(){
		
		var tl = new TimelineMax();

		//index of tweens which pause
		var pauseidx = 0;

		//manager per scene element, coupled to others in same makeManagers closure 
		var sceneManagers = makeManagers(sceneTweenManagerFactories);
		
		//an manager per scene element, coupled to others in same makeManagers closure
		$.each( sceneManagers , function(sceneidx, sceneManager){ 

			//manager per (animated) content element, coupled to others in same makeManagers closure 
			var actorManagers = makeManagers(actorTweenManagerFactories, sceneManager.items);
			
			//manager per stage effect
			var stageManagers = makeManagers(stageTweenManagerFactories, sceneManager.items);

			//begin stage effects at beginning of scene
			$.each(stageManagers, function(stageidx, stageManager){
				stageManager.addShowTween(tl);
			});

			//add scene reveal to timeline
			sceneManager.addShowTween(tl);
						
			//reveal content
			$.each(actorManagers, function(contentidx, actorManager){

				//add the tween to show the content
				actorManager.addShowTween(tl);

				//add a pause label if indicated
				if(actorManager.items.is(".pause")){
					addPauseLabel(tl, pauseidx++);
				}
				
			});
			
			//add a pause label to scene unless overridden
			if(! sceneManager.items.is(".nopause")){
				addPauseLabel(tl, pauseidx++);
			}

			//add a label for the fully revealed scene at the current timecode
			addSlideLabel(tl, sceneidx);
			
			//conceal content
			$.each(actorManagers.slice(0).reverse(), function(contentidx, actorManager){
				
				//add the tween to hide the content
				actorManager.addHideTween(tl);
				
			});
			
			//add scene conceal to timeline
			sceneManager.addHideTween(tl);

			//end stage effects at beginning of scene
			$.each(stageManagers, function(contentidx, stageManager){
				stageManager.addHideTween(tl);
			});
			
		});

		tl.pause();
		
		return tl;
		
	}
	
	/** Returns an array of managers, each of which can add a show tween or a hide tween to a timeline
	 * but which are coupled through the closure of using the same factory. */
	function makeManagers(tweenFactories, ancestorq){
		
		if( ! ancestorq ){
			ancestorq = $("body");
		}
		
		var managers = []; //to store the constructed tweens
		
		//create a joint selector and find elements needing managers in document order
		//including the elements passed (and-self), though it's inefficient (NxN testing in loop below)
		var jointSelector = Object.keys(tweenFactories).join(",");
		var selected = ancestorq.find(jointSelector).add(ancestorq.filter(jointSelector));

		//check which selector(s) an element satisfies, and 
		//construct a reveal from the matching factory
		for(var idx = 0; idx < selected.length; idx++){
			var elq = selected.eq(idx);
			//currently animations on a single element are added in arbitrary order 
			//(only a problem if elements match multiple selectors)
			for(var selector in tweenFactories){
				var factory = tweenFactories[selector];
				if(elq.is(selector)){
					//here an individual element has its manager created
					//but using a factory in common with all its co-selectees
					managers.push(factory(elq));  
				}
			}
		}
		
		return managers;
	}
	
	function yoyoManagerFactory(time,css){
		
		//force infinite yoyo
		css.repeat = -1;
		css.yoyo = true;
		
		//return tweenManager factory
		return function(items){
			var tween = tween = TweenMax.to(items,time,css);
			return {
				items:items,
				addShowTween:function(tl){
					tl.add(TweenLite.delayedCall(0,function(){
						//activates the long-running tween
						tween.play();
					}));
				},
				addHideTween:function(tl){
					tl.add(TweenLite.delayedCall(0,function(){
						//deactivates the long-running tween
						tween.pause();
					}));
				}
			}
		}
	}
	
	/** Creates a factory for reveal (and unreveal) tweens 
	 * which can create the tweens for items which are passed to the factory. */
	function tweenManagerFactory(showParams,hideParams){
		
		//create auto-generated hide parameters if none provided
		if(!hideParams){
			
			//clone the show parameters
			hideParams = deepClone(showParams);
			
			//remove direct 'from' and 'to' references			
			//switch 'from' and 'to' positions to reverse them
			//being sure to deep clone (workaround latent Greensock bug)
			if("from" in showParams) hideParams["to"] = deepClone(showParams["from"]);
			else delete hideParams["to"];
			if("to" in showParams) hideParams["from"] = deepClone(showParams["to"]); 
			else delete hideParams["from"];
			
		}
		
		//workaround latent greensock bug with deepclone
		//and merge in default values where unspecified
		var show = copyProperties(deepClone(showParams), deepClone(defaultShow));
		var hide = copyProperties(deepClone(hideParams), deepClone(defaultHide)); 
			
		var showCount = 0;  //CH TODO these variables have the wrong closure - per selector, not per slide+selector
		var hideCount = 0;  //CH it's a by-product of reveal order being document order, and therefore items always being a singleton
							//CH it means that the first item of content in the second slide begins with a positive showCount - should be 0
		
		return function(items){
						
			return {
				//make configuration information available
				items:items,
				show:show,
				hide:hide,
				
				//provide manager functions
				addShowTween:function(tl){
					
					//calculate the relative position
					var pos = show.offset //offset for first in series
					if(showCount != 0) pos = show.stagger; //stagger controls remaining items
					
					//add the tween
					if( ("from" in show) && ("to" in show) ){
						tl.fromTo(items, show.time, show.from, show.to, pos);
					}
					else if("from" in show){
						tl.from(items, show.time, show.from, pos);						
					}
					else if("to" in show){
						tl.to(items, show.time, show.to, pos);						
					}
				
					//add a label for this scene at the current point
					if("prefix" in show) addFrameLabel(tl, show.prefix, showCount); 
					
					//increment counter for other items in this closure
					showCount++;
					
				},
				addHideTween:function(tl){ 
	
					//calculate the relative position
					var pos = hide.offset //offset for first in series
					if(hideCount != 0) pos = hide.stagger; //stagger controls remaining items
					
					//add the tween
					if( ("from" in hide) && ("to" in hide) ){
						tl.fromTo(items, hide.time, hide.from, hide.to, pos);
					}
					else if("from" in hide){
						tl.from(items, hide.time, hide.from, pos);						
					}
					else if("to" in hide){
						tl.to(items, hide.time, hide.to, pos);			
					}
									
					//add a label for this scene at the current point
					if("prefix" in hide) addFrameLabel(tl, hide.prefix, hideCount);
					
					//increment counter for other items in this closure
					hideCount++;
					
				},
			};
		};
	}

	function splitText(containerq){
		var phrase = containerq.text();
		var separator = "";
		var chunks = phrase.split(separator);
		containerq.contents().filter(function(){return this.nodeType == 3;}).remove();
		var prevChunk;
		$.each(chunks, function(index, val) {
			if(val === " "){
				val = "&nbsp;";
			}
			var outputChunk = $("<div />", { id : "txt" + index} ).addClass('chunk').html(val);
			outputChunk.appendTo(containerq);
	 
			if(prevChunk) {
				$(outputChunk).css("left", ($(prevChunk).position().left + $(prevChunk).width()) + "px");
			};
			prevChunk = outputChunk;
		});
	}
	
	/** Creates a JSON representation of properties exported from the closure namespace, to be passed to eval */
	function writeScopeExportCode(propnames){
		var pairs = [];
		propnames.forEach(function(item){pairs.push("\"" + item + "\":" + item);});
		return "({" + pairs.join(",") + "})";                 
	}
	
	function nextLabelMatching(tl,fn,time){
		var labels = tl.getLabelsArray(); //contains values of the form {name:"pause-0",time:1}		
		var timeTest;
		var timeType = typeof time;
		if(timeType === "string"){		//return true only after the label is passed
			timeTest = function(label){
				if(time === null){
					return true;
				}
				else if (label.name === time){
					time = null;
				}
				return false;
			};
		}
		else{ //use time if specified 
			timeTest = function(label){
				return label.time > time;
			};
			if(timeType != "number"){ //use time if specified, fallback to current time
				time = tl.time(); 				
			}
		}

		//look through labels
		return _.find( labels, timeTest);
	}

	function prevLabelMatching(tl,fn,time){ //labels are like {name:"pause-0",time:1}
		var labels = _.clone(tl.getLabelsArray()).reverse(); //reverse order of labels before searching  	
		var timeTest;
		var timeType = typeof time;
		if(timeType === "string"){		//return true only after the label is passed
			timeTest = function(label){
				if(time === null){
					return true;
				}
				else if (label.name === time){
					time = null;
				}
				return false;
			};
		}
		else{
			timeTest = function(label){
				return label.time < time;
			};
			if(timeType != "number"){ //use time if specified, fallback to current time
				time = tl.time(); 				
			}
		}
		return _.find( labels, timeTest);
	}

	/** Returns exported values and functions. */
	return eval(writeScopeExportCode([
		"getSlideLabel","getPauseLabel","initDeck","nextLabelMatching","prevLabelMatching","sceneSelector",
	]));
}();

//wire up an event listener to scale the fonts according to viewport size, can then measure everything in em?
//from https://gist.github.com/williammalo/2475269
var fudgeFactor = 36 / 768; // defines the size of the body text for the maximum screen width 
function fontFix() {
	var height = window.innerHeight || document.documentElement.clientHeight;
	document.body.style.fontSize = Math.max(20, fudgeFactor * height ) + "px";
};

$(fontFix);
$(window).resize(fontFix);

var currentLabel = 0;

$(function(){
	timeline = MUDSLIDE.initDeck();
	timeline.tweenTo(MUDSLIDE.getPauseLabel(2));
	
	// Sets up a wash which rotates through the color wheel
	TweenMax.set(".wash",{backgroundColor:"hsl(0,50%,50%)"});
	var washTl = new TimelineLite();
	washTl.to(".wash",10,{backgroundColor:"hsl(120,50%,50%)",ease:Linear.easeNone});
	washTl.to(".wash",10,{backgroundColor:"hsl(240,50%,50%)",ease:Linear.easeNone});
	washTl.to(".wash",10,{backgroundColor:"hsl(360,50%,50%)",ease:Linear.easeNone});
	washTl.yoyo = true;
	washTl.repeat = -1;
	washTl.play();
		
	$(document).keydown(function(e){
		var pauseMatch = function(item){
			return item.label.indexOf("pause") != -1;
		};
		
		if(e.which == 32){
			//SPACEBAR - navigate to next pause
			var label = MUDSLIDE.nextLabelMatching(timeline,pauseMatch);
			timeline.tweenTo(label.name);
			return false;
		}
		if (e.which == 37) { 
			//LEFT ARROW - navigate back to last pause
			var label = MUDSLIDE.prevLabelMatching(timeline,pauseMatch);
			timeline.tweenTo(label.name);
			return false;
		}
		if (e.which == 39) { 
			//RIGHT ARROW - navigate on to next pause
			timeline.tweenTo(MUDSLIDE.nextLabelMatching(timeline,pauseMatch).name);
			return false;
		}
	});
	
	var audio = $.media("#theme");
	$("#theme").bind("canplaythrough", function () {
			audio.seek(38);
			audio.play();
	});
	
});


