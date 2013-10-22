$(function(){
	var transitions = $(".slide");
	var tl = new TimelineMax();
	
	tl.staggerFrom($(".left .animation.saloondoor"),1,{opacity:0,rotationY:100}, 0.25);
	
	tl.staggerFrom($(".right .animation.saloondoor"),1,{opacity:0,rotationY:-100}, 0.25);
	
});
