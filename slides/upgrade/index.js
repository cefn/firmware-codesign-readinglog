$(function(){
	
	var from 			= MUDSLIDE.from, 
		to				= MUDSLIDE.to,
		label			= MUDSLIDE.label,
		cloneAppend		= MUDSLIDE.cloneAppend,
		tokenize		= MUDSLIDE.tokenize,
		tokenizeChars	= MUDSLIDE.tokenizeChars,
		mediaPlay		= MUDSLIDE.mediaPlay,
		mediaStop		= MUDSLIDE.mediaStop;
		killTweens		= MUDSLIDE.killTweens;
		
	
	/** These are the tween generation rules, with an order which can be used to determine their priority within
	 * a scene. Keys are selectors, and values are either...
	 * - SchedulerFactories
	 * - objects (further selector keys in the heirarchy)
	 * - arrays (further sequences of factories and objects)
	 * */
	var rules = [
		{".scene":[ 
			//reveals in order of preferred appearance
			from({},{duration:1.0,outerOffset:"-=0.9",pause:false}),
			{".scene.console li.reveal":[
				cloneAppend("<audio class='typing' src='typing.mp3' preload='auto' ></audio>"), //creates an audio sample
				{"audio.typing":mediaPlay()}, //plays the audio sample
				cloneAppend("<span class='cursor'>_</span>"), //immediately copies a cursor in place
				{">span.cursor":from({repeat:-1,repeatDelay:0.5,yoyo:true},{duration:0.01,parallel:true})},
				tokenizeChars(
					from({display:"none",delay:0.1},{duration:0, pause:false})
				),
				{">span.cursor":to({display:"none"})},
				{"audio.sample":mediaStop()}, //stops the audio sample
			]},
			{".reveal.grow":from({width:0})},
			{".saloondoor .left li.reveal": from({rotationY:100})},
			{".saloondoor .right li.reveal":from({rotationY:-100})},			
			label("scene"),
			//conceals in order of preferred appearance
			{".saloondoor .right li.reveal":to({rotationY:-100})},
			{".saloondoor .left li.reveal":to({rotationY:100})},
			{".reveal.grow":to({width:0})},
			{".scene:not(.intro)":to({delay:0.1}, {duration:1.0})},
			{".scene.intro":to({delay:3.0}, {duration:1.0})},
			
		]}
	];
		
	//CH TODO - figure out how to activate this on a per-slide basis - triggering when shown to save CPU
	var translateMax = 50;
	var scaleMax = 1.2;
	var translateX = Math.round(-translateMax + (Math.random() * translateMax * 2));
	var translateY = Math.round(-translateMax + (Math.random() * translateMax * 2));
	TweenMax.to(".background", 60, {
		transform:"translateX(" + translateX + "px) translateY(" + translateY + "px) scaleX(" + scaleMax + ") scaleY(" + scaleMax + ")",
		ease:Linear.easeNone,
		repeat:-1,
		yoyo:true
	});
	
	var washTl = new TimelineMax({repeat:-1,yoyo:true});
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(0,50%,50%)"}));
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(120,50%,50%)"}));
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(240,50%,50%)"}));
	washTl.play();
		
	MUDSLIDE.initDeck(rules);
	MUDSLIDE.timeline.pause();
	MUDSLIDE.timeline.tweenTo(MUDSLIDE.getPauseLabel(0));

	/* //switch this for a media tween factory ASAP
	var audio = $.media("#theme");
	$("#theme").bind("canplaythrough", function () {
			audio.seek(38);
			audio.play();
	});
	*/
	
			/* //reintroduce wash once fundamental tweening works again
		".wash":sequenceFactory(60,
			[
				{backgroundColor:"hsl(0,50%,50%)"}, 
				{backgroundColor:"hsl(120,50%,50%)"},				
				{backgroundColor:"hsl(240,50%,50%)"},
			],
			{forever:true}
		),
	*/

});


