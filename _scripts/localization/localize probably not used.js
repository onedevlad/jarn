function localize(){
	var interface_language=globals.cookies.parse().interface_language;
	var new_script=document.createElement('script');
	if(current_page !== 'index'){
		new_script.src='../_scripts/localization/'+current_page+'/'+interface_language+'.js';
		for(var i=0; i<cls('tool_img').length; i++)	cls('tool_img')[i].src='../_img/flags/'+interface_language+'.png';
	}
	else{
		new_script.src='_scripts/localization/index/'+interface_language+'.js';
		for(var i=0; i<cls('tool_img').length; i++)	cls('tool_img')[i].src='_img/flags/'+interface_language+'.png';
	}
	new_script.type='text/javascript';
	document.head.appendChild(new_script);
	new_script.onload=function(){
		document.getElementsByTagName('TITLE')[0].innerHTML=localization.head.title;
		for(key in localization.body){
			if(!!id(key)){
				id(key).innerHTML=localization.body[key];
			}
			else{
				//Write
				if(key === 'text_input_placeholder'){
					id('text_input').setAttribute('placeholder', localization.body[key])
				}
			}
		}
		extend_localization();
	}
}

localize();

function extend_localization(){
	localization.languages={
		'uk': 'Українська',		//Українська
		'ru': 'Русский',		//Російська
		'en': 'English',		//Англійська
		'de': 'Deutsch',		//Німецька
		'es': 'español',		//Іспанська
		'fr': 'français',		//Французька
		'it': 'Italiano',		//Італійська
		'pl': 'polski',			//Польська
		'be': 'Беларуская',		//Білоруська
		'hu': 'Magyar',			//Угорська
		'cs': 'česky',			//Чеська
		'ar': 'العربية',			//Арабська
		'no': 'Norsk',			//Норвезька
		'el': 'Ελληνικά',		//Грецька
		'ka': 'ქართული',			//Грузинська
	};
	localization.msgs.fti={
		title: 'Welcome!',
		text: 'It seems you\'re a new visitor? Welcome to Jarn - a free online text editor for handwriting text. Please select your language from the list below to continue:',
	};
}