var MUDSLIDE = function(){

	var defaultTime=1.0;
	var slideRevealTime=2.0;
	var slideSelector = ".slide";
	
	/** Used to construct a single timeline, combining all the slides individual timelines into a single presentation.
	 * Animations within the deck may be...
	 * * continuous - they run throughout the presentation
	 * * reveal - transitions causing individual slides to become visible (to simplify, they are reversed for invisible) 
	 * */
	var slideRevealFactories = [];
	slideRevealFactories[slideSelector] = revealFactory({
		from:{autoAlpha:0},
		time:slideRevealTime,
		offset:("-=" + slideRevealTime),
	});
	
	/** Used to constructs a series of timelines, one per slide, which can be combined.
	 * Animations within each slide are considered atomic (although of course other 
	 * timelines can be launched alongside, simply using greensock timelines directly). 
	 * Animations within each slide may be... 
	 * * continuous - animations running as long as the slide is visible
	 * * reveal - transitions causes invisible elements to be revealed 
	 * * substitute - transitions causing invisible elements to replace visible elements
	 * */
	 
	var elementRevealFactories = {
		".saloondoor .left li.reveal":revealFactory({ from:{opacity:0,rotationY:100}, time:1.0, stagger:"-=0.2" }),
		".saloondoor .right li.reveal":revealFactory({ from:{opacity:0,rotationY:-100}, time:1.0, stagger:"-=0.2"}),
		".reveal.grow":revealFactory({ from:{width:0} }),
	};

	function initDeck(){
		viewportDeck();
		return timelineDeck();
	}
	
	/** Moves all the .slide elements to be positioned at 0,0 relative to the viewport, 
	 * so they all appear presentation style in the same place (editable original is 
	 * scrollable with one slide after the next). 
	 */
	function viewportDeck(){
	
		//transforms slide deck to position all slides on top of each other for later reveal
		$(slideSelector).css({
			position:"absolute",
			left:0,
			top:0,
		});
		
		//hides unnecessary scrollbars
		$(["html,body", slideSelector].join(",")).css({
			overflow:"hidden",
		});
		
	}
	
	/** Returns a unique string label for a timeline, based on the position of the slide. */
	function getSlideLabel(idx){
		return "slide-" + idx;
	}
	
	function timelineDeck(){
		
		var slidetl = new TimelineMax();
		
		$(slideSelector).each(function(idx,el){
			
			var slideq = $(this);
			var slideReveals = makeReveals(slideRevealFactories, slideq);
			var elementReveals = makeReveals(elementRevealFactories, slideq);
			
			//insert slide reveal(s) and element reveals
			for(var sri = 0; sri < slideReveals.length; sri++){
				slideReveals[sri].showTween(slidetl);
			}
			for(var eri = 0; eri < elementReveals.length; eri++){
				elementReveals[eri].showTween(slidetl);
			}
			
			//add a label for this slide at the current point
			slidetl.addLabel(getSlideLabel(idx), slidetl.duration());
			
			//insert the same reveals in reverse
			for(var eri = elementReveals.length; eri-->0 ;){
				elementReveals[eri].hideTween(slidetl);
			}
			for(var sri = slideReveals.length; sri-->0 ; ){
				slideReveals[sri].hideTween(slidetl);
			}
			
		});
		
		slidetl.pause();
		
		return slidetl;
		
	}
	
	/** Returns an array of reveals with a show and a hide. */
	function makeReveals(tweenFactories, ancestorq){
		
		var reveals = []; //to store the constructed tweens
		
		//create a joint selector and find elements needing reveals in document order
		//including the elements passed (and-self)
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
					reveals.push(factory(elq));
				}
			}
		}
		
		return reveals;
	}
	
	/** Creates a factory for reveal (and unreveal) tweens 
	 * which can create the tweens for items which are passed to the factory. */
	function revealFactory(params){
		
		var from, time, to, offset, stagger;
		
		if("from" in params) from = params.from;
		else throw Error("revealFactory needs a 'from' object to indicate the CSS from which elements are tweened");
		
		if("time" in params) time = params.time;
		else time = defaultTime;
		
		if("to" in params) to = params.to;
		else to = copyProperties(params.from,{});
		
		if("offset" in params) offset = params.offset;
		else offset = "+=0";

		if("stagger" in params) stagger = params.stagger;
		else stagger = "+=0";
		
		var showCount = 0;
		var hideCount = 0;
		return function(items){
			return {
				showTween:function(tl){
					if(showCount == 0) tl.insert(TweenMax.from(items,time,from),offset); //offset applies to first in series 
					else tl.insert(TweenMax.from(items,time,from),stagger); //stagger applies to remainder of series
					showCount++;
				},
				hideTween:function(tl){ 
					if(hideCount == 0) tl.insert(TweenMax.to(items,time,to),offset); //offset applies to first in series 
					else tl.insert(TweenMax.to(items,time,to),stagger); //stagger applies to remainder of series
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

	/** Creates a JSON representation of properties exported from the closure namespace, to be passed to eval */
	function writeScopeExportCode(propnames){
		var pairs = [];
		propnames.forEach(function(item){pairs.push("\"" + item + "\":" + item);});
		return "({" + pairs.join(",") + "})";                 
	}

	/** Returns exported values and functions. */
	return eval(writeScopeExportCode([
		"initDeck","getSlideLabel"
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

$(function(){
	
	var timeline = MUDSLIDE.initDeck();
	timeline.tweenTo(MUDSLIDE.getSlideLabel(0));
	
});
