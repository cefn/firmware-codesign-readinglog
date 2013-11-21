$(function(){
	
	var from 			= MUDSLIDE.from, 
		to				= MUDSLIDE.to,
		label			= MUDSLIDE.label,
		cloneAppend		= MUDSLIDE.cloneAppend,
		tokenize		= MUDSLIDE.tokenize,
		tokenizeChars	= MUDSLIDE.tokenizeChars,
		mediaPlay		= MUDSLIDE.mediaPlay,
		mediaVolume		= MUDSLIDE.mediaVolume,
		mediaStop		= MUDSLIDE.mediaStop,
		killTweens		= MUDSLIDE.killTweens,
		fix				= MUDSLIDE.fix,
		record			= MUDSLIDE.record,
		revert			= MUDSLIDE.revert,
		delay			= MUDSLIDE.delay,
		pause			= MUDSLIDE.pause,
		wrapInner		= MUDSLIDE.wrapInner;
		
	
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
			{".scene .gantt":pause()},
//			{".scene .gantt td":to({autoAlpha:1,width:"5%"}, {duration:0,pause:false})}, //forces width value
			{".scene .gantt td":record()}, //records position of all divs without disturbing layout
			{".scene .gantt td":revert()}, //applies recorded positions to all, recreating layout in absolute terms?
			{".scene .gantt td.workshop.phase0":[
				pause("+=1"),
				to({position:"absolute",top:"0%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false}),
			]},
			{".scene .gantt td.workshop.phase1":
				to({position:"absolute",top:"33%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false,outerOffset:"-=2"})},
			{".scene .gantt td.workshop.phase2":
				to({position:"absolute",top:"66%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false,outerOffset:"-=2"}),
			},
			{".scene .gantt td.publication.phase0":[
				pause("+=1"),
				to({position:"absolute",top:"0%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false}),
			]},
			{".scene .gantt td.publication.phase1":
				to({position:"absolute",top:"33%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false,outerOffset:"-=2"})},
			{".scene .gantt td.publication.phase2":
				to({position:"absolute",top:"66%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true},{duration:1,pause:false,outerOffset:"-=2"}),
			},
			{".scene.console li.reveal":[
				cloneAppend("<audio class='typing' preload='auto' ><source src='audio/teletype_beep.wav' /> </audio>"), //creates an audio sample
				cloneAppend("<span class='cursor'>_</span>"), //copies a cursor in place at build time
				{">span.cursor":from({repeat:-1,yoyo:true},{duration:0.25,parallel:true, pause:false})},
				pause(),
				{"audio.typing":[from({duration:0.05},{pause:false}), mediaVolume(0.05), mediaPlay()]}, //plays the audio sample
				tokenizeChars(
					from({display:"none",delay:0.05},{duration:0,pause:false})
				),
				{">span.cursor":to({},{parallel:true,pause:false})},
				{"audio.typing":mediaStop()}, //stops the audio sample
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
	MUDSLIDE.timeline.timeScale = 32;
	var matchMaker = function(string){
		return function(item){
			return item.name.indexOf(string) != -1;
		};
	};
	var label = MUDSLIDE.nextLabelMatching(MUDSLIDE.timeline, matchMaker("pause-3"), 0);
	TweenLite.fromTo(MUDSLIDE.timeline, 10, {time:0}, {time:label.time});
	//MUDSLIDE.timeline.tweenTo(MUDSLIDE.getPauseLabel(3), {onComplete:function(){MUDSLIDE.timeline.timeScale=1;}});

	/* //switch this for a media tween factory ASAP
	var audio = $.media("#theme");
	$("#theme").bind("canplaythrough", function () {
			//audio.seek(38);
			audio.play();
	});
	*/
	
	
});


