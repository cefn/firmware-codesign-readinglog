MUDSLIDE.copyProperties(function(){
	
	var configuration = {
		
		sceneSelector:".scene",
	
		fontHeightShare:26 / 768, // defines the size of the body text for the maximum screen height 
		
		defaultGsProps:{
			from:{autoAlpha:0},
			to:{autoAlpha:0}
		},

		defaultMsProps:{
			from:{duration:0.5, outerOffset:"+=0", innerOffset:"+=0", parallel:false, pause:false},
			to:{duration:0.2, outerOffset:"+=0", innerOffset:"+=0", parallel:false, pause:false}
		},

		//possible future msProps
		//randomOffset : introduces slight timing offset e.g. typing individual characters shouldn't seem too regular
		//interOffset : introduces timing offset only within the group (not relative to others)

	};	
				
	return eval(MUDSLIDE.writeScopeExportCode([
		"configuration"
	]));

}(), MUDSLIDE);
