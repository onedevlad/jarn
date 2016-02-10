'use strict';
var absolute_path='http://jarn.esy.es';

var globals={
	'cookies': {
		'values': {},
	},
	'msg': {},
	'hint': {},
	'custom_select': {
		'default_height': '2em'
	},
	'touchscreen': false,
	'settings': {},
	'pannel_attached': 'false',
	'ban': {},
	'panel': {},
	'localization': {},
	'unloader': {},
	'path_to_root': '.'
};

var evt={
	'taken_ids': 0,
	'listeners': {},
	'set': function(el, event, value){
		//Converting string into a function.
		//Eval could not be used because the code should not be executed immediately.
		//P.S. I know that littering in global environment is bad, but that's the only way.
		if(typeof event === 'string'){
			event=[event];
		}
		if(!('length' in el)){
			el=[el];
		}
		for(var i=0; i<event.length; i++){
			for(var j=0; j<el.length; j++){
				if(!el[j].getAttribute('data-evt_id')){
					el[j].setAttribute('data-evt_id', evt.taken_ids);
					evt.taken_ids++;
				}
				//Remove previously defined listener (if exists)
				if(evt.listeners[el[j].getAttribute('data-evt_id')]){
					if(evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]){
						evt.remove(el[j], event[i]);
					}
				}
				else{
					evt.listeners[el[j].getAttribute('data-evt_id')]={};
				}
				var funct=new Function(value);
				evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]=funct;
				funct=null;
				el[j].addEventListener(event[i], evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]);
			}
		}
	},
	'remove': function(el, event){
		if(typeof event === 'string'){
			event=[event];
		}
		if(!('length' in el)){
			el=[el];
		}
		for(var i=0; i<event.length; i++){
			for(var j=0; j<el.length; j++){
				if(evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]){
					el[j].removeEventListener(event[i], evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]);
					evt.listeners[el[j].getAttribute('data-evt_id')][event[i]]=null;
				}
			}
		}
	},
};

globals.toggle_nav=function(){
	if(cls('nav').offsetHeight === 0){
		cls('nav').style.height='auto';
	}
	else{
		cls('nav').style.height='0';
	}
}

globals.unloader.set=function(){
	window.onbeforeunload=function(event){
			event= event || window.event;
			event.returnValue=localization.head.leave_check;
			return localization.head.leave_check;
	};
};

globals.unloader.remove=function(){
	window.onbeforeunload=null;
}

globals.coords=function(el){
	return {
		'left': el.getBoundingClientRect().left+pageXOffset,
		'top': el.getBoundingClientRect().top+pageYOffset,
		'right': el.getBoundingClientRect().right+pageXOffset,
		'bottom': el.getBoundingClientRect().bottom+pageYOffset,
	};
};

globals.date_count=function(days){//globals.date_count
	var date = new Date();
	date.setDate(date.getDate() + days);
	return date.toUTCString();
}

globals.can_i_use=function(command){
	try{
		var tmp=function(command){
			return command;
		}
		if(tmp){
			return true;
		}
	}
	catch(e){
		return false;
	}
}

function $(selector){
	$.storage=document.querySelectorAll(selector);
	return $;
}

$.css=function(styles){
	var $storage_length=$.storage.length;
	var $string='';
	for(var i=0; i<$storage_length; i++){
		for(var style in styles){
			$string+=style+':'+styles[style]+';';
		}
		$.storage[i].setAttribute('style', $string);
		$string='';
	}
	return $;
};

$.attr=function(name, value){
	if(!value){
		return $.storage[0].getAttribute(name);
	}
	$.storage[0].setAttribute(name, value);
	return $;
};

function id(id){
	return document.getElementById(id);
}

function cls(cls, collection){
	if(collection) return document.getElementsByClassName(cls);
	else				return document.getElementsByClassName(cls)[0];
}

globals.rnd=function(min, max){
	var rand=min-0.5+Math.random()*(max-min+1);
	var rand=Math.round(rand);
	return rand;
}

globals.goto=function(url){
	url=url||'../';
	window.location=url;
}

globals.panel.left=function(){
	cls('panel_left').style.left='2%';
	cls('right_panel_wrapper').style.opacity='0';
};

globals.panel.right=function(){
	cls('panel_left').style.left='-40%';
	cls('right_panel_wrapper').style.opacity='1';
};

globals.custom_select.option_choose=function(el){
	if(!el.parentNode.classList.contains('wrapped')){
		el.parentNode.setAttribute('data-value', el.getAttribute('data-value'));
		el.parentNode.getElementsByClassName('chosen')[0].classList.toggle('chosen');
		el.classList.toggle('chosen');
	}
};

globals.scroll_to=function(to){
	var dest=to.getBoundingClientRect().top;
	var cur=0;
	var src=window.pageYOffset;
	var interval=setInterval(function(){
		cur+=Math.round(dest/60);
		window.scrollBy(0, dest/60);
		if(dest > 0){
			if(cur >= dest){
				window.scrollTo(0, src+dest);
				clearInterval(interval);
			}
		}
		else{
			if(cur <= dest){
				window.scrollTo(0, src+dest);
				clearInterval(interval);
			}
		}
	}, 7);
};

globals.cookies.parse=function(){
	if(document.cookie){
		for(var i=0; i<document.cookie.split(";").length; i++){
			globals.cookies.values[document.cookie.split(";")[i].split("=")[0].split(" ").join("")]=document.cookie.split(";")[i].split("=")[1].split(" ").join("");
		}
	}
	if(!globals.cookies.values["interface_language"]){
		document.cookie="interface_language=uk; path=/; expires="+globals.date_count(365)+";";
		globals.cookies.values["interface_language"]="uk";
	}
	if(!globals.cookies.values["panel_opacity"]){
		document.cookie="panel_opacity=0.8; path=/; expires="+globals.date_count(365)+";";
		globals.cookies.values["panel_opacity"]="0.8";
	}
	if(!globals.cookies.values["show_hints"]){
		document.cookie="show_hints=true; path=/; expires="+globals.date_count(365)+";";
		globals.cookies.values["show_hints"]="true";
	}
	if(!globals.cookies.values["fti"]){
		document.cookie="fti=true; path=/; expires="+globals.date_count(365)+";";
		globals.cookies.values["fti"]="true";
	}
	if(!globals.cookies.values["selection_box_color"]){
		document.cookie="selection_box_color=#F39200; path=/; expires="+globals.date_count(365)+";";
		globals.cookies.values["selection_box_color"]="#F39200";
	}
	if(!globals.cookies.values["banned"]){
		document.cookie="banned=false; path=/; expires="+globals.date_count(14)+";";
		globals.cookies.values["banned"]="false";
	}
	return globals.cookies.values;
}

globals.cookies.set=function(name, value, expires){
	document.cookie=name+"="+value+"; path=/; expires="+globals.date_count(expires)+";";
}

globals.msg_exit=function(funct, event){
	event.stopPropagation();
	id("overlay").outerHTML="";
	if(typeof funct == 'string'){
		alert('Got unexpencted string in globals.msg_exit()!');
		var tmp_elem=document.createElement("DIV");
		tmp_elem.id="tmp_elem";
		document.body.appendChild(tmp_elem);
		id("tmp_elem").setAttribute("onclick", funct);
		id("tmp_elem").click();//Because "eval" is evil! =)
		id("tmp_elem").outerHTML="";
	}
	else{
		funct();
	}
}

globals.stopPropagation=function(event){
	event.stopPropagation();
}

globals.msg=function(type, title, text, ok_funct, cancel_funct){
	ok_funct=ok_funct||function(){};
	cancel_funct=cancel_funct||function(){};
	var overlay=document.createElement("DIV");
	overlay.className="overlay";
	document.body.appendChild(overlay);
	overlay.id="overlay";
	overlay=id("overlay");
	overlay.setAttribute("onClick", "globals.msg_exit("+cancel_funct+", event);");

	var msg_div=document.createElement("DIV");
	msg_div.className="msg_div";
	overlay.appendChild(msg_div);
	msg_div.id="msg_div";
	msg_div=id("msg_div");
	msg_div.setAttribute("onClick", "globals.stopPropagation(event)");

	var msg_title=document.createElement("P");
	msg_title.className="msg_title";
	id("msg_div").appendChild(msg_title);
	msg_title.id="msg_title";
	msg_title=id("msg_title");
	msg_title.innerHTML=title;

	var msg_text=document.createElement("P");
	msg_text.className="msg_text";
	id("msg_div").appendChild(msg_text);
	msg_text.id="msg_text";
	msg_text=id("msg_text");
	msg_text.innerHTML=text;

	var msg_ok=document.createElement("BUTTON");
	msg_ok.className="msg_ok gradient";
	id("msg_div").appendChild(msg_ok);
	msg_ok.id="msg_ok";
	msg_ok=id("msg_ok");
	msg_ok.innerHTML=localization.msgs.ok_button;
	msg_ok.setAttribute("onClick", "globals.msg_exit("+ok_funct+", event);");

	if(type === "confirm"){
		var msg_cancel=document.createElement("BUTTON");
		msg_cancel.className="msg_cancel gradient";
		id("msg_div").appendChild(msg_cancel);
		msg_cancel.id="msg_cancel";
		msg_cancel=id("msg_cancel");
		msg_cancel.setAttribute("onClick", "globals.msg_exit("+cancel_funct+", event)");
		msg_cancel.innerHTML=localization.msgs.cancel_button;
		msg_div.appendChild(msg_cancel);
		msg_cancel.style.display="block";
	}
}

globals.clear_file=function(without_alert, field_to_clear){
	if(!without_alert){
		globals.msg("alert", localization.msgs.wrong_file_type.title, localization.msgs.wrong_file_type.text);
	}

	if(field_to_clear === 1){
		id("file_text").innerHTML=localization.body.file_text;
		id("file").value="";
	}
	if(field_to_clear === 2){
		id("file_text_2").innerHTML=localization.body.file_text_2;
		id("file_2").value="";
	}
	if(field_to_clear === 3){
		id("file_text_3").innerHTML=localization.body.file_text_3;
		id("file_3").value="";
	}
}

globals.hint.show=function(event, text){
	globals.stopPropagation(event);
	id("hint_box").setAttribute("style", "");
	if(parseFloat(event.clientX+400) <= parseFloat(document.documentElement.clientWidth)){
		id("hint_box").style.left=(parseFloat(event.clientX)+15)+"px";
	}
	else{
		id("hint_box").style.left=(parseFloat(event.clientX)-15-400)+"px";
	}
	id("hint_box").innerHTML=localization.hints[text]+"<br/><br/><span class='hint_ps'>"+localization.hints.hint_hide+"</span>";
	var hint_box_height=id("hint_box").getBoundingClientRect().bottom-id("hint_box").getBoundingClientRect().top;
	if(parseFloat(event.clientY)+parseFloat(hint_box_height) <= parseFloat(document.documentElement.clientHeight)){
		id("hint_box").style.top=(parseFloat(event.clientY)+15)+"px";
	}
	else{
		id("hint_box").style.top=(parseFloat(event.clientY)-15-hint_box_height)+"px";
	}
}

globals.hint.hide=function(){
	id("hint_box").style.display="none";
}

globals.hint.set=function(remove, el){
	if(!!el){
		if(!!id(el)){
			if(remove){
				id(el).removeAttribute("onmousemove");
				id(el).removeAttribute("onmouseout");
				return;
			}
			id(el).setAttribute("onmousemove", "globals.hint.show(event, '"+el+"')");
			id(el).setAttribute("onmouseout", "globals.hint.hide()");
		}
		else if(!!cls(el, true).length){
			for(var i=0; i<=cls(el, true).length-1; i++){
				if(remove){
					id(el).removeAttribute("onmousemove");
					id(el).removeAttribute("onmouseout");
					return;
				}
				cls(el, true)[i].setAttribute("onmousemove", "globals.hint.show(event, '"+el+"')");
				cls(el, true)[i].setAttribute("onmouseout", "globals.hint.hide()");
			}
		}
	}
	else{
		for(var current_el in localization.hints){
			if(!!id(current_el)){
				if(remove){
					id(current_el).removeAttribute("onmousemove");
					id(current_el).removeAttribute("onmouseout");
					continue;
				}
				id(current_el).setAttribute("onmousemove", "globals.hint.show(event, '"+current_el+"')");
				id(current_el).setAttribute("onmouseout", "globals.hint.hide()");
			}
			if(!!cls(current_el, true).length){
				for(var i=0; i<=cls(current_el).length-1; i++){
					if(remove){
						cls(current_el, true)[i].removeAttribute("onmousemove");
						cls(current_el, true)[i].removeAttribute("onmouseout");
						continue;
					}
					cls(current_el, true)[i].setAttribute("onmousemove", "globals.hint.show(event, '"+current_el+"')");
					cls(current_el, true)[i].setAttribute("onmouseout", "globals.hint.hide()");
				}
			}
		}
	}
}

globals.file_to_text=function(src, success, fail){
	if(id('tmp_frame')){
		id('tmp_frame').outerHTML='';
	}
	var tmp_frame=document.createElement('IFRAME');
	tmp_frame.style.display='none';
	tmp_frame.id='tmp_frame';
	if((typeof src).toLowerCase() === 'string'){
		tmp_frame.src=src;
	}
	else{
		tmp_frame.src=URL.createObjectURL(src);
	}
	document.body.appendChild(tmp_frame);
	id('tmp_frame').onload=function(){
		success(window.frames[0].document.body.children[0].innerHTML);
		id('tmp_frame').outerHTML='';
	}
	id('tmp_frame').onerror=function(){
		fail();
		id('tmp_frame').outerHTML='';
	}
}

/************************************************************************************************/

globals.localization.localize=function(){
	var interface_language=globals.cookies.parse().interface_language;
	for(var i=0; i<cls('settings_img', true).length; i++) cls('settings_img', true)[i].src=globals.path_to_root+'_images/flags/'+interface_language+'.png';
	var new_script=document.createElement('script');
	new_script.type='text/javascript';
	var address=current_page;
	if(current_page === 'edit'){
		address='create';
	}
	new_script.src=globals.path_to_root+'_scripts/localization/'+address+'/'+interface_language+'.js';
	document.head.appendChild(new_script);
	new_script.onload=function(){
		var put_changes=function(){
			document.getElementsByTagName('TITLE')[0].innerHTML=localization.head.title;
			for(var key in localization.body){
				if(!!id(key)){
					id(key).innerHTML=localization.body[key];
				}
				else if(!!cls(key, true)){
					for(var i=0; i<cls(key, true).length; i++){
						cls(key, true)[i].innerHTML=localization.body[key];
					}
				}
				if(key === 'text_input_placeholder'){
					id('text_input').setAttribute('placeholder', localization.body[key])
				}
			}
			globals.localization.extend();
		};

		if(current_page === 'edit'){
			var new_script_1=document.createElement('script');
			new_script_1.type='text/javascript';
			new_script_1.src=directory+'_scripts/localization/edit/'+interface_language+'.js';
			document.head.appendChild(new_script_1);
			new_script_1.onload=put_changes;
		}
		else put_changes();
	};
}

globals.scrolling_block=function(show){
	if(show){
		id('fake_scrollbar').style.display='block';
		document.body.style.overflow='hidden';
		document.body.style.width='calc(100% - 5px)';
		document.querySelector('header').style.width='calc(100% - 5px)';
	}
	else{
		id('fake_scrollbar').removeAttribute('style');
		document.body.removeAttribute('style');
		document.querySelector('header').removeAttribute('style');
	}
};

globals.localization.extend=function(){
	localization.languages={
		'uk':{'name': 'Українська',	'disabled': {'dict': false, 'ui': false}}, //Українська
		'ru':{'name': 'Русский',		'disabled': {'dict': false, 'ui': false}}, //Російська
		'en':{'name': 'English',		'disabled': {'dict': false, 'ui': false}}, //Англійська
		'de':{'name': 'Deutsch',		'disabled': {'dict': false, 'ui': true}},  //Німецька
		'be':{'name': 'Беларуская',	'disabled': {'dict': false, 'ui': true}},  //Білоруська
		'it':{'name': 'Italiano',		'disabled': {'dict': false, 'ui': true}},  //Італійська
		'es':{'name': 'español',		'disabled': {'dict': true,  'ui': true}},  //Іспанська
		'fr':{'name': 'Français',		'disabled': {'dict': true,  'ui': true}},  //Французька
		'pl':{'name': 'Polski',			'disabled': {'dict': true,  'ui': true}},  //Польська
		'hu':{'name': 'Magyar',			'disabled': {'dict': true,  'ui': true}},  //Угорська
		'ar':{'name': 'العربية',		'disabled': {'dict': true,  'ui': true}},  //Арабська
		'no':{'name': 'Norsk',			'disabled': {'dict': true,  'ui': true}},  //Норвезька
		'el':{'name': 'Ελληνικά',		'disabled': {'dict': true,  'ui': true}},  //Грецька
		'ka':{'name': 'ქართული',		'disabled': {'dict': true,  'ui': true}},  //Грузинська
	};
	localization.msgs.fti={
		title: 'Welcome!',
		text: 'It seems you\'re a new visitor. Welcome to Jarn - a free online text editor for handwritten text. Please select your language from the list below to continue.',
	};

	if(globals.cookies.parse().show_hints === "true"){
		globals.hint.set();
	}
	else{
		globals.hint.set(true);
	}

	if(!!id('global_overlay')){
		id('global_overlay').setAttribute('style', 'opacity: 0');
		setTimeout(function(){
			id('global_overlay').outerHTML='';
		}, 600);
	}

	if('kernel' in window){
		kernel.initialization();
	}
}
/*************************************************************************************************/

window.onload=function(){
	window.scrollTo(0, 0);
	globals.touchscreen=!!('ontouchstart' in window);

	for(var i=0; i<cls('tool', true).length; i++){
		evt.set(cls('tool', true)[i], 'click', 'globals.settings.show()');
	}
	evt.set(id('toggle_nav'), 'click', 'globals.toggle_nav()');

	if(current_page === 'index') id('nav_home').parentNode.classList.add('active');
	else{
		globals.path_to_root='../';
		id('nav_'+current_page).parentNode.classList.add('active');
		var navLinks=cls('navlink', true);
		for(var i=0; i<navLinks.length; i++){
			navLinks[i].setAttribute('href', path_to_root+navLinks[i].setAttribute('href'));
		}
	}
	if(current_page !== 'faq' && current_page !== 'settings' && current_page !== 'index'){
		evt.set(cls('left_panel_show'), 'click', 'globals.panel.left()');
		evt.set(cls('right_panel_show'), 'click', 'globals.panel.right()');
	}

	if(cls('custom_select', true).length){
		for(var i=0; i<cls('custom_select', true).length; i++){
			evt.set(cls('custom_select', true)[i], 'click', 'this.classList.toggle("wrapped")');
		}

		for(var i=0; i<cls('custom_option', true).length; i++){
			evt.set(cls('custom_option', true)[i], 'click', 'globals.custom_select.option_choose(this)');
		}

		globals.custom_select.default_height=getComputedStyle(cls('custom_select'), 'height');
	}

	globals.localization.localize();
};
