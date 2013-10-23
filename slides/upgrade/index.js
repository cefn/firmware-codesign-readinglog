$(function(){
	
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

	$("li.split").each(function(){ splitText($(this)); });

	var slides = $("body").children().filter(".slide");

	var tl = new TimelineMax();
	tl.to(slides,0,{autoAlpha:0})
	.to(slides[0],0.5,{autoAlpha:1})
	.from(slides.eq(0).find(".grow"), 0.5, {width:0})
	.staggerFrom(".saloondoor .left li.animation",1,{opacity:0,rotationY:100}, 0.25)
	.staggerFrom(".saloondoor .right li.animation",1,{opacity:0,rotationY:-100}, 0.25)
	.staggerTo(".saloondoor .left li.animation",0.2,{opacity:0,rotationY:100}, "hide0")
	.staggerTo(".saloondoor .right li.animation",0.2,{opacity:0,rotationY:-100}, "hide0+=0.25")
	.to(slides.eq(0).find(".grow"), 0.2, {width:0})
	.to(slides[0],2,{autoAlpha:0},"reveal1")
	.to(slides[1],2,{autoAlpha:1},"reveal1")
	.from(slides.eq(1).find(".grow"), 0.5, {width:0})
	.staggerFrom(slides.find(".left li.animation"),1,{opacity:0,rotationY:100}, 0.25)
	.staggerFrom(slides.find(".right li.animation"),1,{opacity:0,rotationY:-100}, 0.25)
	;
	//tl.timeScale(4);
	//setTimeout(function(){tl.seek("reveal1");},500);



	
});
