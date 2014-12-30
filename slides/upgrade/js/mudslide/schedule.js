/** This framework for HTML5 presentations aims to make it possible to edit presentations in a static
 * form with a WYSIWYG HTML editor, whilst additionally permitting animations, multimedia and tweens
 * to be determined, by defining (CSS) selectors for HTML elements, and associating tweens with them. 
 * 
 * The static form which might be WYSIWYG-edited corresponds to the layout of scenes when all actors 
 * have been placed on stage and before their removal has begun. When launched in a browser, these 
 * scenes are augmented by the execution of javascript to construct interactive, key- and mouse-driven 
 * animations. The Greensock TweenLite.from model is used to define the way in which actors arrive 
 * on stage, by defining their starting CSS configuration.
 * 
 * Tweens are created using factory functions, which are executed (and therefore scheduled on a timeline) 
 * in an order specified by a global sort operator, composed of functions on [element, factory] pairs. 
 * For most purposes the default configuration will not need to be changed, as it corresponds with a 
 * Microsoft-powerpoint-style reveal - scene first, then document order for reveals, and inverse document 
 * order for conceals. In detail, the primary sort order for tweens is the document order of the ancestor slide, 
 * followed by the factory priority (where the priority of a reveal factory ascends from 
 * Number.minValue in declaration order), and a conceal factory's priority ascends to Number.maxValue. This is designed 
 * to allow any other priorities to interleave using numbers centred around zero once the actors are on stage), followed by 
 * the selector priority. 
 * 
 * The 'actors' appear on scene in sequence and disappear in reverse sequence.
 * Selectors are provided which match animated 'actor' elements, and associates 
 * schedulerFactories which can create schedulers for individual matching elements.
 * 
 * The factories are used to create schedulers in document-order sequence. The managers
 * are called upon in sequence to  add 'show' tweens until the scene is fully populated, and 
 * in reverse sequence to add 'hide' tweens until the scene is empty.
 * 
 * The 'stage' is always there during a scene, but can be configured to behave in a certain way 
 * throughout the scene, by adding a tween as soon as the scene begins, and killing it when the
 * scene finishes.  
 * This object provides selectors which match animated stage elements, and associates 
 * tweenManagerFactories which can create tweenManagers for those matching elements.
 * The managers will be called upon to show the effect when the slide becomes visible, and hide
 * the effect when the scene is no longer on stage.
 *
 * 
 * 
 */
MUDSLIDE.copyProperties(function(){
		
	//import various properties from MUDSLIDE for convenience
	var 	sceneSelector 	= MUDSLIDE.configuration.sceneSelector,
			copyProperties 	= MUDSLIDE.copyProperties,
			clone			= MUDSLIDE.clone,
			deepClone 		= MUDSLIDE.deepClone;
	
	var nextPause = 0;
	var nextScene = 0;

	function log(msg,arg){
		alert(msg);
	}
	
	/* Adds a function callback to the end of a timeline. */
	function scheduleCall(tl,fn,time){
		if(_.isUndefined(time)) time = tl.duration();
		tl.addCallback(fn, time);
	};
		
	function from(gsSpec, msSpec){		
		return function(ensemble, actor){
			//get defaults
			var gs = clone(MUDSLIDE.configuration.defaultGsProps.from);
			var ms = clone(MUDSLIDE.configuration.defaultMsProps.from);
			//merge specified properties
			copyProperties(gsSpec,gs);
			copyProperties(msSpec,ms);
			//add event monitors suitable for debugging
			copyProperties({
				onStart:function(){ 
					//log("something");
				},
				onComplete:function(){ 
					//log("something");
				},
			}, gs);
			/*
			if("position" in gs && gs.position ==="absolute"){ //attempt to translate absolute to relative
				gs=MUDSLIDE.absoluteToRelative(gs,actor);
			}
			*/
			return {
				ensemble:ensemble,
				actor:actor,
				gs:gs, 
				ms:ms,
				schedule:function(tl){
					
					//calculate duration and delay based on text if asked
					if(this.ms.autoDuration){
						this.ms.duration = actor.text().length * this.ms.autoDuration;
					}
					if(this.ms.autoDelay){
						this.gs.delay = actor.text().length * this.ms.autoDelay;
					}
					
					//calculate offset relative to set
					var offset = ensemble.index(actor) > 0 ? this.ms.innerOffset : this.ms.outerOffset;
										
					//schedule tween
					var tween = TweenMax.from(actor, this.ms.duration, this.gs);
					if(this.ms.parallel){ //schedule the triggering of this tween but takes no duration
						tween.pause();
						scheduleCall(tl, function(){
							tween.play();
						}, offset);
					}
					else{
						tl.add(tween, offset);
					}
					
					if(this.ms.pause){
						scheduleLabel(tl,"pause");
					}
					
				},
				type:"from",
			};
		}
	}
	
	function to(gsSpec, msSpec){
		
		return function(ensemble, actor){
			//get defaults
			var gs = clone(MUDSLIDE.configuration.defaultGsProps.to);
			var ms = clone(MUDSLIDE.configuration.defaultMsProps.to);
			//merge specified properties
			copyProperties(gsSpec,gs);
			copyProperties(msSpec,ms);
			//add event monitors suitable for debugging
			copyProperties({
				onStart:function(){ 
					//log("something");
				},
				onComplete:function(){ 
					//log("something");
				},
			}, gs);
			/*
			if("position" in gs && gs.position ==="absolute"){ //attempt to translate absolute to relative
				gs=MUDSLIDE.absoluteToRelative(gs,actor);
			}
			*/
			return {
				ensemble:ensemble,
				actor:actor,
				gs:gs, 
				ms:ms,
				schedule:function(tl){
	
					//calculate duration and delay based on text if asked
					if(this.ms.autoDuration){
						this.ms.duration = actor.text().length * this.ms.autoDuration;
					}
					if(this.ms.autoDelay){
						this.gs.delay = actor.text().length * this.ms.autoDelay;
					}
					
					//calculate offset relative to set
					var offset = ensemble.index(actor) > 0 ? this.ms.innerOffset : this.ms.outerOffset;

					//schedule tween
					var tween = TweenMax.to(actor, this.ms.duration, this.gs);
					if(this.ms.parallel){ //schedule the triggering of this tween but takes no duration
						tween.pause();
						scheduleCall(tl,function(){
							tween.play();
						}, offset);
					}
					else{
						tl.add(tween, offset);
					}

					if(this.ms.pause){
						scheduleLabel(tl,"pause");
					}

				},
				type:"to",
			}
		}		
	}
			
	function label(prefix,time){
		return createSchedulerFactory(
			function(tl){
				scheduleLabel(tl,prefix,time);
			},
			{type:"label", prefix:prefix}
		);
	}
	
	var labelRegistry = {};
	function scheduleLabel(tl, prefix, time){
		if( ! (prefix in labelRegistry) ){
			labelRegistry[prefix] = 0;
		}
		addFrameLabel(tl,prefix,labelRegistry[prefix]++, time);
	}
	
	function killTweens(){
		return createSchedulerFactory(
			function(tl){
				scheduleCall( tl, function(){
					TweenMax.killTweensOf(this.actor);					
				});
			},
			{type:"killTweens"}
		);
	}

	function delay(time){
		return createSchedulerFactory(
			function(tl){
				tl.to(this.actor, time, {});
			},
			{type:"delay",time:time}
		);
	}
	
	function pause(time){
		return label("pause",time);
	}

	/** A scheduler factory which clones the JQuery HTML literal or selector, removes any IDs and appends to current location. 
	 * Creates a null scheduler which does nothing. */
	function cloneAppend(selector, newclass){
		return function(ensemble, actor){
			$(selector).clone().removeAttr("id").appendTo(actor);
			return createNullScheduler(ensemble, actor, {type:"cloneAppend"});
		};
	}
	
	function tokenize(separator, rules){
		return [
			function(ensemble, actor){
				splitText(actor, separator, "<span class='token' />"); //generates new distinguishable spans
				return createNullScheduler(ensemble,actor,{type:"tokenize",separator:separator});
			},
			//TODO CH nasty bug here where descendants will be matched if you're not careful to limit to children only
			{">span.token":rules} //returns association mapping those spans with the rules passed in
		]; 
	}

	function wrapInner(html){
		return function(ensemble,actor){
			actor.wrapInner(html);
			return createNullScheduler(ensemble,actor,{type:"wrapInner"});
		}
	}
	
	function mediaPlay(){ 
		return createSchedulerFactory(function(tl){
			var that = this;
			scheduleCall( tl, function(tl){
				$.media(that.actor).play();
			});
		},{type:"mediaPlay"});
	}

	function mediaStop(){ 
		return createSchedulerFactory(function(tl){
			var that = this;
			scheduleCall( tl, function(tl){
				$.media(that.actor).stop();
			});
		},{type:"mediaStop"});
	}

	function mediaVolume(vol){ 
		return createSchedulerFactory(function(tl){
			var that = this;
			scheduleCall( tl, function(tl){
				$.media(that.actor).volume(vol);
			});
		},{type:"mediaStop"});
	}

	function record(){
		return createSchedulerFactory(function(tl){
			var that = this;
			scheduleCall( tl, function(){
				var snapshot = {
					position:"absolute",
					left:that.actor.offset().left,
					top:that.actor.offset().top,
					width:that.actor.width(),
					height:that.actor.height(),
				};
				that.actor.data("snapshot",snapshot);
			});
		},{type:"record"});
	}

	function revert(){
		return createSchedulerFactory(function(tl){
			var that = this;
			scheduleCall( tl, function(){
				that.actor.css(that.actor.data("snapshot"));
			});
		},{type:"revert"});
	}
	
	//TODO CH refactor this, named as a BuildTime or SideEffectFactory 
	//(which triggers an immediate side effect when factory is run, 
	//but actually creates a NOOP scheduler)
	function createNullScheduler(ensemble,actor,props){
		return createScheduler(ensemble,actor,null,props);
	}
	
	function createScheduler(ensemble,actor,schedule,props){
		var scheduler = {
				ensemble:ensemble,
				actor:actor,
				schedule:schedule,
		};
		if(props){
			copyProperties(props,scheduler);
		}
		return scheduler;
	}
	
	function createSchedulerFactory(schedule,props){
		return function(ensemble,actor){
			return createScheduler(ensemble,actor,schedule,props);
		};
	}
	
	function tokenizeChars(rules){
		return tokenize("",rules);
	}
	
	function splitText(container, separator, wrapper){
		var createdq = $([]);
		
		separator = _.isUndefined(separator) ? "" : separator;
		wrapper = _.isUndefined(wrapper) ? "<span />" : wrapper;
		
		//replace immediate text children into annotated divs containing same text sequence
		container.contents().each(function(idx,node){
			if(node.nodeType ===3){ //apply only to text nodes
				//record important facts about the node, then remove it
				var nodeq = $(node);
				var parentq = nodeq.parent();
				var nodeidx = nodeq.index();
				nodeq.remove();
				//add annotated spans in the place of the node
				$.each(nodeq.text().split(separator), function(idx,chunk){
					if(chunk === " ") chunk = "&nbsp;";
					var newq = $(wrapper).html(chunk);
					if(nodeidx === 0){ //workaround for lack of JQuery insertAt!
						parentq.prepend(newq);
					}
					else{
						parentq.children().eq(nodeidx-1).after(newq);
					}
					nodeidx++;
					createdq.add(newq);
				});
			}
		});
		
		return createdq;
			
	}
			
	/** Functions to define scheduler order. */

	/** Defines a scheduler order based on the document order of the actor. */
	function compareSchedulerActorNodes(a,b){
		return MUDSLIDE.compareDocumentNodes(a.actor.get(0),b.actor.get(0));
	}

	/** Defines a scheduler order based on the document order of the actor's ancestor scene. */
	function compareSchedulerSceneNodes(a,b){
		//addBack handles case where actor _is_ scene
		var asceneq = a.actor.closest(sceneSelector); 
		var bsceneq = b.actor.closest(sceneSelector);
		if(asceneq.size() && bsceneq.size()){
			return MUDSLIDE.compareDocumentNodes(asceneq.get(0), bsceneq.get(0));
		}
		else{
			return -1;
		}
	}

	/** Defines a scheduler order based on the sequence in which the rule was declared. */
	function compareSchedulerRulePosition(a,b){
		return a.rule.position - b.rule.position;
	}
	
	var schedulerSortOrder = MUDSLIDE.orderBy([compareSchedulerSceneNodes, compareSchedulerRulePosition, compareSchedulerActorNodes]);

	
	function numberElements(){
		var nextNum = 0;
		$(document).find("*").each(function(){
			$(this).data("num",nextNum++);
		});
	}
	
	/** Assigns an inspectable tree-ordered position value to every terminal rule within 
	 * the rules hierarchy, for sorting functions to use. */
	function numberRules(rules,registry){
		
		var registryType = typeof registry;
		if(registryType  === "undefined"){
			registry = {next:0};
		}
		
		var rulesType = typeof rules;
		if(rulesType === "object"){
			for(key in rules){
				numberRules(rules[key], registry);
			}
		}
		else if(rulesType === "array"){
			for(key in rules){
				addUids(rules[key], registry);
			}
		}
		else if(rulesType === "function"){
			rules.position = registry.next++;
		}
		
	}

	
	/** Adds all the tweens for the presentation represented by the given rules hierarchy to the given timeline. */
	function makeSchedulers(rules, schedulers, setq){
		
		//pre-initialise unspecified arguments
		
		//create new store for factory if not already there
		if(typeof schedulers === "undefined"){
			schedulers = []; 
		}
		
		//use whole document where set not specified (e.g. initial call)
		if(typeof setq === "undefined"){
			setq = $("body");
		}

		setq.each(function(){
			
			var matchq = $(this);
			
			if($.isFunction(rules)){ // a tween scheduler factory
				var scheduler = rules(setq, matchq);
				scheduler.rule = rules;
				schedulers.push(scheduler);
			}
			else if($.isArray(rules)){ //a series of rules at current level
				$.each(rules, function(){
					makeSchedulers(this, schedulers, matchq);
				});
			}
			else if($.isPlainObject(rules)){ //object with selector keys and rules for levels below
				for(selector in rules){ //for each, invoke recursively with new rule and set
					var newsetq;
					if(selector.replace(" ","").indexOf(">")===0){ //if jquery rule is context-based (starts with >)
						newsetq = setq.find(selector); //use contextual query
					}
					else{ //else treat as docwide selector
						newsetq = $(selector).filter(function(){ //use global query (but restrict to descendants)
							return $(this).parents().addBack().is(matchq);
						});
					}
					//if anything matches, run rules on them
					if(newsetq.size()){
						makeSchedulers(rules[selector],schedulers,newsetq);
					}
				}
			}
			else{
				log("Improper type of rule", rules);
			}
					
		});
						
		//process rules, generating factories
		
		return schedulers;
	}	
					
	/** Constructs a series of timelines, one per scene, which can be combined.
	 * Animations within each scene are considered atomic (although of course other 
	 * timelines can be launched alongside, simply using greensock timelines directly). 
	 * Animations within each scene may be... 
	 * * continuous - animations running as long as the scene is visible
	 * * reveal - transitions causes invisible elements to be revealed 
	 * * substitute - transitions causing invisible elements to replace visible elements
	 * */
	 
	function initDeck(rules){
		
		//change from editable layout to presentation layout
		initViewport();
		
		//give every element in the document a unique number
		numberElements();
		
		//number each of the rules
		numberRules(rules);
		
		//create the tween schedulers and sort by preferred order
		var schedulers = makeSchedulers(rules);
		
		//add an inspectable index of creation order
		var nextCreated = 0;
		$.each(schedulers, function(){
			this.created = nextCreated++;
		});
		
		//sort by preferred order
		//TODO CH reintroduce an explicit specification of the initial sort order
		//schedulers.sort(schedulerSortOrder);
		
		//use the tween schedulers to construct a new timeline	
		var timeline = new TimelineMax();
		$.each(schedulers,function(){
			if("schedule" in this){
				if(this.schedule != null){ //handle possible null schedulers
					this.schedule(timeline);
				}
			}
			else{
				log("Error in schedule construction",this);
			}
		});
		
		//dispose of any preceding timeline
		if(MUDSLIDE.timeline){
			MUDSLIDE.timeline.kill();
		}
		MUDSLIDE.timeline = timeline;
		
		return timeline;
		
	}
		
	/** Moves all the .scene elements to be positioned at 0,0 relative to the viewport, 
	 * so they all appear presentation style in the same place (editable original is 
	 * scrollable with one scene after the next). 
	 */
	function initViewport(){
	
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
		
		//wire up an event listener to scale the fonts according to viewport size, can then measure everything in em?
		//from https://gist.github.com/williammalo/2475269
		function fontFix() {
			var height = window.innerHeight || document.documentElement.clientHeight;
			document.body.style.fontSize = Math.max(20, MUDSLIDE.configuration.fontHeightShare * height ) + "px";
		};

		$(fontFix); //causes function to be called on document load
		$(window).resize(fontFix); //causes function to be called on document load
		
	}

	/** Functions for Greensock labels within the timeline */
	
	function getSceneLabel(idx){
		return getFrameLabel("scene",idx);
	}

	function getPauseLabel(idx){
		return getFrameLabel("pause",idx);
	}

	/** Inserts a label to indicate a point at which the given scene is fully viewable. */
	function addSceneLabel(tl, idx, time){
		if(typeof idx === "undefined") idx = nextScene++;
		return addFrameLabel(tl,"scene",idx, time);
		return addFrameLabel(tl,"scene",idx, time);
	}

	function addFrameLabel(tl,name,idx,time){
		if(typeof time === "undefined") time = tl.duration();
		return tl.addLabel(getFrameLabel(name,idx), time);
	}	

	function getFrameLabel(name,idx){
		return name + "-" + idx;
	}		
				
	function nextLabelMatching(tl,fn,time){
		var labels = tl.getLabelsArray(); //contains values of the form {name:"pause-0",time:1}		
		var timeTest;
		var timeType = typeof time;
		if(timeType === "string"){		//return true only after the label is passed
			timeTest = function(label){
				if(time === null){
					return fn(label);
				}
				else if (label.name === time){
					time = null;
				}
				return false;
			};
		}
		else{ //use time if specified 
			timeTest = function(label){
				if(label.time > time){
					return fn(label);
				}
				else{
					return false;
				}
			};
			if(timeType != "number"){ //return true only after time is passed (if specified), fallback to current time
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
		if(timeType === "string"){		//function only considered after the label is passed
			timeTest = function(label){
				if(time === null){
					return fn(label);
				}
				else if (label.name === time){
					time = null;
				}
				return false;
			};
		}
		else{
			timeTest = function(label){ //function only considered after the time is passed
				if(label.time >= time){ 
					return false; //inverted logic to previous
				}
				else{
					return fn(label);
				}
			};
			if(timeType != "number"){ //use time if specified, fallback to current time
				time = tl.time(); 				
			}
		}
		return _.find( labels, timeTest);
	}
		
	TweenLite.ticker.fps(15);

	/** Returns exported values and functions. */
	return eval(MUDSLIDE.writeScopeExportCode([
		"initDeck","getPauseLabel","getSceneLabel","getFrameLabel", "nextLabelMatching","prevLabelMatching",
		"from","to","label","cloneAppend","splitText",
		"tokenize", "tokenizeChars", "mediaPlay", "mediaStop", "mediaVolume", "killTweens","pause","record","revert","delay","wrapInner"
	]));
}(), MUDSLIDE);

