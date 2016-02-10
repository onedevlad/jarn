var current_page='settings';
var kernel={};
kernel.initialization=function(){
	var tmp='';
	var current_lang=globals.cookies.parse()['interface_language'];
	var show_hints=globals.cookies.parse()['show_hints'];
	var lang_disabled=false;
	for(var i in localization.languages){
		tmp+='<div class="lang '+(localization.languages[i].disabled.ui?'disabled_lang':'')+'" id="lang_block_'+i+'" onclick="kernel.set_lang(\''+i+'\')">'+
		  '<img class="lang_img" src="../_images/flags/'+i+'.png" alt="'+localization.languages[i].name+'"><br>'+
		  '<span class="lang_name">'+localization.languages[i].name+'</span>'+
		'</div>';
	}
	id('languages_block').innerHTML=tmp;
	id('lang_block_'+current_lang).classList.add('active_lang');

	if(show_hints === 'true'){id('hints_checkbox').checked=true; cls("switch_hints_status").innerHTML=localization.body.on; cls("switch_hints_status").id="on";}
	evt.set(id('switch_hints'), 'change', 'kernel.set_hints()');
	evt.set(id('switch'), 'click', 'kernel.switch_buttons()');
};

kernel.set_hints=function(){
	if(cls("switch_hints_status").id === "on"){
		cls("switch_hints_status").id="off";
		cls("switch_hints_status").innerHTML=localization.body.off;
		globals.cookies.set('show_hints', 'false', 365);
	}
	else{
		cls("switch_hints_status").id="on";
		cls("switch_hints_status").innerHTML=localization.body.on;
		globals.cookies.set('show_hints', 'true', 365);
	}
};

kernel.set_lang=function(lang){
	if(!localization.languages[lang].disabled.ui){
		globals.cookies.set('interface_language', lang, 365);
		globals.localization.localize();
	}
};