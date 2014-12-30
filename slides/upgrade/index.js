$(function(){
	
	var from 			= MUDSLIDE.from, 
		to				= MUDSLIDE.to,
		label			= MUDSLIDE.label,
		cloneAppend		= MUDSLIDE.cloneAppend,
		copyProperties	= MUDSLIDE.copyProperties,
		deepClone		= MUDSLIDE.deepClone,
		tokenize		= MUDSLIDE.tokenize,
		tokenizeChars	= MUDSLIDE.tokenizeChars,
		mediaPlay		= MUDSLIDE.mediaPlay,
		mediaVolume		= MUDSLIDE.mediaVolume,
		mediaStop		= MUDSLIDE.mediaStop,
		killTweens		= MUDSLIDE.killTweens,
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
	 
	var gantZoomGs0 = {position:"absolute",fontSize:"12pt",top:"0%",left:"0%",width:"100%",height:"33%",zIndex:2,autoAlpha:1,repeat:1,yoyo:true};
	var gantZoomGs1 = copyProperties({top:"33.6%"},deepClone(gantZoomGs0));
	var gantZoomGs2 = copyProperties({top:"66.6%"},deepClone(gantZoomGs0));
	var gantZoomMs = {duration:1,outerOffset:"-=2"};
	
	var gantLiZoomGs = {display:"none",position:"relative",left:"500px",repeat:1,yoyo:true};
	var gantLiZoomMs = {duration:1,innerOffset:"-=2"};

	 
	var rules = [
		{".scene":[ 
			//reveals in order of preferred appearance
			{".scene":from({},{duration:1.0,outerOffset:"-=0.9"})},
			
			{".scene .gantt":pause()},
			{".gantt td":record()}, //records position of all divs without disturbing layout
			{".gantt td":revert()}, //applies recorded positions to all, recreating layout in absolute terms?
						
			//animate transcription tasks
			{".gantt .method li":from(gantLiZoomGs,gantLiZoomMs)},
			{".gantt .method .transcription.phase0": to(gantZoomGs0,gantZoomMs)},
			{".gantt .method .transcription.phase1":to(gantZoomGs1,gantZoomMs)},
			{".gantt .method .transcription.phase2":to(gantZoomGs2,gantZoomMs)},
			{".gantt":[pause("-=1"), pause()]},

			//animate workshop tasks
			{".gantt .workshop li":from(gantLiZoomGs,gantLiZoomMs)},
			{".gantt .phase0 .workshop": to(gantZoomGs0,gantZoomMs)},
			{".gantt .phase1 .workshop":to(gantZoomGs1,gantZoomMs)},
			{".gantt .phase2 .workshop":to(gantZoomGs2,gantZoomMs)},
			{".gantt":[pause("-=1"), pause()]},

			//animate publication tasks
			{".gantt .publication li":from(gantLiZoomGs,gantLiZoomMs)},
			{".gantt .phase0 .publication": to(gantZoomGs0,gantZoomMs)},
			{".gantt .phase1 .publication":to(gantZoomGs1,gantZoomMs)},
			{".gantt .phase2 .publication":to(gantZoomGs2,gantZoomMs)},
			{".gantt":[pause("-=1"), pause()]},

			{".scene.console li.tokenize":[
				cloneAppend("<audio class='typing' preload='auto' ><source src='audio/teletype_beep.wav' /> </audio>"), //creates an audio sample
				cloneAppend("<span class='cursor'>_</span>"), //copies a cursor in place at build time
				{">span.cursor":from({repeat:-1,yoyo:true},{duration:0.25,parallel:true})},
				{"li.tokenize:not(.auto)":pause()},
				{"audio.typing":[from({duration:0.05},{}), mediaVolume(0.15), mediaPlay()]}, //plays the audio sample
				tokenizeChars(
					from({display:"none",delay:0.05},{duration:0})
				),
				{">span.cursor":to({},{parallel:true})},
				{"audio.typing":mediaStop()}, //stops the audio sample
			]},
			{".grow":from({width:0},{})},
			{"h2":from({},{duration:2,innerOffset:"-=1.5"})},
			{"blockquote":from({},{duration:2,innerOffset:"-=1.5"})},
			{".left,.wide": from({position:"relative",top:"25px",left:"-25px",ease:Power1.easeIn},{})},
			{".right": from({position:"relative",top:"25px",left:"25px",ease:Power1.easeIn},{outerOffset:"-=" + MUDSLIDE.configuration.defaultMsProps.from.duration})},
			label("scene"),
			{".scene:not(.intro)":pause()},
			//{".scene:not(.intro)":delay(2)},
			//conceals in order of preferred appearance
			{".right": to({position:"relative",top:"25px",left:"25px"})},
			{".left,.wide": to({position:"relative",top:"25px",left:"-25px"})},
			{"blockquote":to({},{innerOffset:"-=" + (MUDSLIDE.configuration.defaultMsProps.to.duration * 0.75)})},
			{"h2":to({},{innerOffset:"-=" + (MUDSLIDE.configuration.defaultMsProps.to.duration * 0.75)})},
			{".grow":to({width:0})},
			{".scene:not(.intro)":to({delay:0.1}, {duration:1.0})},
			{".scene.intro":to({}, {autoDelay:0.075})},	
		]}
	];
		
	//CH TODO - figure out how to activate this on a per-slide basis - triggering only when shown to save CPU
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
	
	//CH TODO - find a neat representation for this within the macro language
	var washTl = new TimelineMax({repeat:-1,yoyo:true});
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(0,50%,50%)"}));
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(120,50%,50%)"}));
	washTl.append(TweenMax.to(".wash", 30, {backgroundColor:"hsl(240,50%,50%)"}));
	washTl.play();
		
	MUDSLIDE.initDeck(rules);
	MUDSLIDE.timeline.pause();
	
	/*
	var matchMaker = function(string){
		return function(item){
			return item.name.indexOf(string) != -1;
		};
	};
	TweenLite.fromTo(MUDSLIDE.timeline, 120, {time:0}, {time:300});
	MUDSLIDE.timeline.tweenTo(MUDSLIDE.getPauseLabel(3), {onComplete:function(){MUDSLIDE.timeline.timeScale=1;}});
	*/

	/* //switch this for a media tween factory ASAP
	var audio = $.media("#theme");
	$("#theme").bind("canplaythrough", function () {
			//audio.seek(38);
			audio.play();
	});
	*/
	
	
});


