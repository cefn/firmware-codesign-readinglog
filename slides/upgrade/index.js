var MUDSLIDE = function(){

	var defaultDuration=0.5;
	var staggerOffset=0.1;
	var slideSelector = ".slide";
	
	/** Used to construct a single timeline, combining all the slides individual timelines into a single presentation.
	 * Animations within the deck may be...
	 * * continuous - they run throughout the presentation
	 * * reveal - transitions causing individual slides to become visible (to simplify, they are reversed for invisible) 
	 * */
	var slideRevealFactories = [];
	slideRevealFactories[slideSelector] = revealFactory(defaultDuration, {autoAlpha:0});
	
	/** Used to constructs a series of timelines, one per slide, which can be combined.
	 * Animations within each slide are considered atomic (although of course other 
	 * timelines can be launched alongside, simply using greensock timelines directly). 
	 * Animations within each slide may be... 
	 * * continuous - animations running as long as the slide is visible
	 * * reveal - transitions causes invisible elements to be revealed 
	 * * substitute - transitions causing invisible elements to replace visible elements
	 * */
	 
	var elementRevealFactories = {
		".saloondoor .left li.reveal":revealFactory(defaultDuration, {opacity:0,rotationY:100}),
		".saloondoor .right li.reveal":revealFactory(defaultDuration, {opacity:0,rotationY:-100}),
		".reveal.grow":revealFactory(defaultDuration, {width:0}),
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
		"slide-" + idx;
	}
	
	function timelineDeck(){
		
		var decktl = new TimelineMax();
		
		$(slideSelector).each(function(idx,el){
			var slidetl = new TimelineMax();
			
			var slideq = $(this);
			var slideReveals = makeReveals(slideRevealFactories, slideq);
			var elementReveals = makeReveals(elementRevealFactories,slideq);
			
			var tween, lastDuration = staggerOffset;
			//insert slide reveal(s) and element reveals
			for(var sri = 0; sri < slideReveals.length; sri++){
				tween = slideReveals[sri].showTween();
				slidetl.append(tween, 0);
				lastDuration = tween.duration();
			}
			for(var eri = 0; eri < elementReveals.length; eri++){
				tween = elementReveals[eri].showTween();
				slidetl.append(tween, -lastDuration + staggerOffset);
				lastDuration = tween.duration();
			}
			
			//add a label for this slide at the current point
			slidetl.addLabel(getSlideLabel(idx), slidetl.duration);
			
			//insert the same reveals in reverse
			for(var eri = elementReveals.length; eri-->0 ;){
				tween = elementReveals[eri].hideTween();
				slidetl.append(tween, -lastDuration + staggerOffset);
				lastDuration = tween.duration();
			}
			for(var sri = slideReveals.length; sri-->0 ; ){
				tween = slideReveals[sri].hideTween();
				slidetl.append(tween, 0);
				lastDuration = tween.duration();
			}
			
			//append to the timeline
			decktl.append(slidetl);
			
		});
		
		return decktl;
		
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
	
	function revealFactory(time, fromvals, tovals){
		if(!tovals){
			tovals = {};
			copyProperties(fromvals,tovals);
		}
		return function(items){
			return {
				showTween:function(){ 
					return TweenLite.from(items,time,fromvals);
				},
				hideTween:function(){ 
					return TweenLite.to(items,time,tovals); 
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
		"initDeck"
	]));
}();

//wire up an event listener to scale the fonts according to viewport size, can then measure everything in em?
//from https://gist.github.com/williammalo/2475269
var fudgeFactor = 40 / 768; // defines the size of the body text for the maximum screen width 
function fontFix() {
	var height = window.innerHeight || document.documentElement.clientHeight;
	document.body.style.fontSize = Math.max(20, fudgeFactor * height ) + "px";
};
window.addEventListener('resize', fontFix);
window.addEventListener('load', fontFix);

$(function(){
		
	var timeline = MUDSLIDE.initDeck();
	
	timeline.play();

});
