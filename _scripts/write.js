'use strict';
var current_page='write';

var canvas={
	'context': id('preview').getContext('2d'),
	'canvases': [],
	'original_canvases': [],
	'ud_canvases': [],
	'use': {
		'current': 0,
	},
	'original': {
		'width': id('preview').width,
		'height': id('preview').height
	},
	'current': {
		'width': id('preview').width,
		'height': id('preview').height
	},
	'tmp': {
		'original': {
			'width': id('tmp_canvas').width,
			'height': id('tmp_canvas').height
		}
	},
	'walking': {
		'start_x': 0,
		'start_y': 0
	},
	'offset': {
		'x': 0,
		'y': 0
	},
	'letter': {}
};

var kernel={
	'file_uploaded': false,
	set file_uploaded(value){
		if(value){
			cls('step_overlay', true)[0].style.display='none';
			cls('step_overlay', true)[1].style.display='none';
		}
		else{
			cls('step_overlay', true)[0].style.display='block';
			cls('step_overlay', true)[1].style.display='block';
		}
	},
	'tmp': {
		'frames': [],
		'states': [new Image(), new Image()],
		'fti': [true, true, true],
	},
	'dict': [],
	'pages': {
		'storage': [],
		'num': 1,
	},
	'sheet': {
		'img': new Image(),
		'type': 'cells',
		'orientation': 'right',
		'margins': {
			'top':    parseFloat(id('sheet_margin_top').value)    || 0,
			'left':   parseFloat(id('sheet_margin_left').value)   || 0,
			'right':  parseFloat(id('sheet_margin_right').value)  || 0,
			'bottom': parseFloat(id('sheet_margin_bottom').value) || 0,
		},
	},
	'text': {
		'letters': {},
		'original': '',
		'line': {
			'margin': 0,
			'max_heigth': 0,
		},
		'taken': {
			'width': 0,
			'height': 0,
		},
		'changed_margins': {
			'changed': false,
			'canvases': [],
		},
	},
	'steps': [{}, {}, {}],
	'raise_value': [],
};

/*==================================================*/

kernel.upload=function(file){//load
	id('file_text').innerHTML="";
	if(file.length === 0){
		id('file_text').innerHTML=localization.body.file_text;
	}
	id('canvas_to_use').innerHTML='';
	function sync(p){
		id('file_text').innerHTML=id('file_text').innerHTML+file[p].name+", ";
		if(file[p].type.slice(0, 5) !== "image"){
			globals.clear_file(false, 1);
			return;
		}

		var image=new Image();
		image.src=URL.createObjectURL(file[p]);
		image.onload=function(){
		var current_img=this;
			if(current_img.width/5 !== (current_img.height-3)/20){
				globals.clear_file(false, 1);
				return;
			}
			else{
				var new_letter_canvas=document.createElement("CANVAS");
				new_letter_canvas.id='letter_canvas_'+p;
				new_letter_canvas.className='letter_canvas';
				new_letter_canvas.width=current_img.width;
				new_letter_canvas.height=current_img.height;
				id('letter_canvas_parent').appendChild(new_letter_canvas);
				id('letter_canvas_'+p).getContext("2d").drawImage(current_img, 0, 0);

				canvas.canvases[p]={
					self: id('letter_canvas_'+p).getContext("2d"),
					selection_box_size: current_img.width/5, 
				};

				var lang_0_letter=id('letter_canvas'+'_'+p).getContext("2d").getImageData((canvas.canvases[p].selection_box_size*5)-1, canvas.canvases[p].selection_box_size*20, 1, 1).data[0].toString();
				var lang_1_letter=id('letter_canvas'+'_'+p).getContext("2d").getImageData((canvas.canvases[p].selection_box_size*5)-1, canvas.canvases[p].selection_box_size*20, 1, 1).data[1].toString();
				var lang_2_letter=id('letter_canvas'+'_'+p).getContext("2d").getImageData((canvas.canvases[p].selection_box_size*5)-1, canvas.canvases[p].selection_box_size*20, 1, 1).data[2].toString();
				var lang_3_letter=id('letter_canvas'+'_'+p).getContext("2d").getImageData((canvas.canvases[p].selection_box_size*5)-1, canvas.canvases[p].selection_box_size*20, 1, 1).data[3].toString();
				if(lang_0_letter < 97 || lang_0_letter > 122){
					lang_0_letter="32";
				}
				if(lang_1_letter < 97 || lang_1_letter > 122){
					lang_1_letter="32";
				}
				if(lang_2_letter < 97 || lang_2_letter > 122){
					lang_2_letter="32";
				}
				if(lang_3_letter < 97 || lang_3_letter > 122){
					lang_3_letter="32";
				}

				var lang=String.fromCharCode(lang_0_letter)+String.fromCharCode(lang_1_letter)+String.fromCharCode(lang_2_letter)+String.fromCharCode(lang_3_letter);
				lang=lang.split(" ").join("");
				id('canvas_to_use').innerHTML+='<div class="custom_option" data-value="'+p+'" id="letter_sample_'+p+'"><img class="letter_sample" id="letter_sample_img_'+p+'"><span class="letter_sample_filename">'+(p+1)+'. '+file[p].name+'</span></div>';
				if(p === 0){
					id('canvas_to_use').getElementsByClassName('custom_option')[0].classList.add('chosen');
					id('canvas_to_use').setAttribute('data-value', '0');
				}
				canvas.canvases[p].lang=lang;
				globals.file_to_text('../_scripts/dict/'+lang+'.txt', function(){
					kernel.dict[p]=window.frames[0].document.body.children[0].innerHTML.split("\n", 99);
					kernel.text.letters.check(p);

					if(p === file.length-1){
						kernel.file_uploaded=true;
						id('file_text').innerHTML=id('file_text').innerHTML.slice(0, -2);
						return;
					}
					sync(++p);

				}, function(){
					alert('WTF? The file is broken.');
				});
			}
		};
	}
	sync(0);
}

kernel.steps[0].move=function(from){
	if(kernel.file_uploaded){
		globals.msg("confirm", localization.msgs.other_file.title, localization.msgs.other_file.text, function(){
			kernel.file_uploaded=false;
			globals.clear_file(true, 1);
			globals.scroll_to(cls('step_1'));
		});
	}
}

kernel.steps[1].move=function(from){
	globals.scroll_to(cls('step_2'));
}

kernel.steps[2].move=function(from){
	canvas.next();
	canvas.prev();
	canvas.tmp_preview_render();
	globals.scroll_to(cls('step_3'));
}

kernel.text.letters.check=function(h){//check_the_letters
	canvas.canvases[h].code=[];
	var total={
		'width': 0,
		'height': 0,
	};

	for(var i=0; i<kernel.dict[h].length; i++){
		canvas.canvases[h].code[i]=kernel.dict[h][i];
		canvas.canvases[h].code[kernel.dict[h][i]]={};
		canvas.canvases[h].code[kernel.dict[h][i]].index=i;
		canvas.canvases[h].code[kernel.dict[h][i]].left=parseFloat((i%5)*canvas.canvases[h].selection_box_size);
		canvas.canvases[h].code[kernel.dict[h][i]].top=parseFloat(Math.floor(i/5)*canvas.canvases[h].selection_box_size);
		canvas.canvases[h].code[kernel.dict[h][i]].width=parseFloat(canvas.canvases[h].self.getImageData(i, canvas.canvases[h].selection_box_size*20, 1, 1).data[0].toString());
		canvas.canvases[h].code[kernel.dict[h][i]].height=parseFloat(canvas.canvases[h].self.getImageData(i, canvas.canvases[h].selection_box_size*20, 1, 1).data[1].toString());
		canvas.canvases[h].code[kernel.dict[h][i]].size=parseFloat(canvas.canvases[h].self.getImageData(i, canvas.canvases[h].selection_box_size*20, 1, 1).data[2].toString());

		total.width+=canvas.canvases[h].code[kernel.dict[h][i]].width;
		total.height+=canvas.canvases[h].code[kernel.dict[h][i]].height;

		canvas.canvases[h].code[kernel.dict[h][i]].margin_top   =parseFloat(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[0].toString());
		canvas.canvases[h].code[kernel.dict[h][i]].margin_left  =parseFloat(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[1].toString());
		canvas.canvases[h].code[kernel.dict[h][i]].margin_right =parseFloat(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[0].toString());
		canvas.canvases[h].code[kernel.dict[h][i]].margin_bottom=parseFloat(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[1].toString());

		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[2].toString() == "1"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_top="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[0].toString();
		}
		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[2].toString() == "2"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_left="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[1].toString();
		}
		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[2].toString() == "3"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_top="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[0].toString();
			canvas.canvases[h].code[kernel.dict[h][i]].margin_left="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+1, 1, 1).data[1].toString();
		}

		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[2].toString() == "1"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_right="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[0].toString();
		}
		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[2].toString() == "2"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_bottom="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[1].toString();
		}
		if(canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[2].toString() == "3"){
			canvas.canvases[h].code[kernel.dict[h][i]].margin_right="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[0].toString();
			canvas.canvases[h].code[kernel.dict[h][i]].margin_bottom="-"+canvas.canvases[h].self.getImageData(i, (canvas.canvases[h].selection_box_size*20)+2, 1, 1).data[1].toString();
		}
	}
	if(!canvas.canvases[h].code[' '].width || !canvas.canvases[h].code[' '].height){
		canvas.canvases[h].code[' ']={
			margin_top: 0,
			margin_left: 0,
			margin_right: 0,
			margin_bottom: 0,
			width: (total.width/(kernel.dict[h].length-1)),
			height: (total.height/(kernel.dict[h].length-1)),
			size: 100
		};
	}
}

kernel.text.write=function(special_canvas_num){
	var $text_input=id('text_input');
	var $text_input_value=$text_input.value;
	var $preview=id('preview');
	var $preview_width=$preview.width;
	var $canvases_amount=canvas.canvases.length;
	var $text_size=parseFloat(id('text_size').value);
	var $auto_CR=id('auto_CR').checked;

	id('text_output').style.display='none';
	canvas.context.clearRect(0, 0, $preview.width, $preview.height);

	if(!$text_input_value){
		id('text_input').classList.remove('invalid');
	}

	var $text_input_value_length=$text_input_value.length;

	for(var j=0; j<$text_input_value_length; j++){
		var current_letter=$text_input_value.slice(j, j+1);
		if(parseFloat(special_canvas_num) >= 0){
			var cur_canvas=special_canvas_num;
		}
		else{
			var cur_canvas=globals.rnd(0, $canvases_amount-1);
		}

		if(current_letter === "\n"){
			$text_input.classList.remove('invalid');
			kernel.text.taken.width=0;
			kernel.text.taken.height+=parseFloat(kernel.text.line.max_height);
			kernel.text.line.max_height=0;
			continue;
		}
		if(!canvas.canvases[cur_canvas] || !canvas.canvases[cur_canvas].code || !canvas.canvases[cur_canvas].code[current_letter] || !parseFloat(canvas.canvases[cur_canvas].code[current_letter].width) || !parseFloat(canvas.canvases[cur_canvas].code[current_letter].height)){//invalid character
			if(canvas.canvases.length === 1){
				$text_input.classList.add('invalid');
				return;
			}
			else{
				var old_canvas=cur_canvas;
				for(var h=0; h<$canvases_amount; h++){
					if(h === old_canvas){continue;}
					cur_canvas=h;
					if(!canvas.canvases[cur_canvas].code[current_letter]){// invalid character
						if(h == $canvases_amount-1){
							$text_input.classList.add('invalid');
							return;
						}
						continue;
					}
					else{
						break;
					}
				}
			}
		}
		else{
			$text_input.classList.remove('invalid');
		}
		$text_size*=canvas.canvases[cur_canvas].code[current_letter].size/100;
		var $current_letter_data=canvas.canvases[cur_canvas].code[current_letter];
		if(parseFloat($current_letter_data.height*$text_size)+parseFloat($current_letter_data.margin_bottom*$text_size)+parseFloat($current_letter_data.margin_top*$text_size) >= kernel.text.line.max_height){
			kernel.text.line.max_height=parseFloat($current_letter_data.height*$text_size)+parseFloat($current_letter_data.margin_bottom*$text_size)+parseFloat($current_letter_data.margin_top*$text_size)+parseFloat(kernel.text.line.margin);
		}

		kernel.text.taken.width+=parseFloat($current_letter_data.margin_left*$text_size);

		if(kernel.text.taken.width+parseFloat($current_letter_data.width*$text_size) >= $preview_width){
			if($auto_CR){
				kernel.text.taken.width=0;
				kernel.text.taken.height+=parseFloat(kernel.text.line.max_height);
				kernel.text.line.max_height=0;
				//id('text_input').value=$text_input_value.slice(0, j)+"\n"+$text_input_value.slice(j+1);
				//continue;
			}
		}
		canvas.context.drawImage(id('letter_canvas_'+cur_canvas), $current_letter_data.left, $current_letter_data.top, $current_letter_data.width, $current_letter_data.height, kernel.text.taken.width, kernel.text.taken.height+(parseFloat($current_letter_data.margin_top)*$text_size), $current_letter_data.width*$text_size, $current_letter_data.height*$text_size);
		kernel.text.taken.width+=parseFloat($current_letter_data.width*$text_size)+parseFloat($current_letter_data.margin_right*$text_size);
		$text_size=parseFloat(id('text_size').value);
	}

	kernel.text.taken.width=0;
	kernel.text.taken.height=0;
	kernel.text.line.max_height=0;
}

kernel.sheet.set_type=function(pattern){
	kernel.sheet.type=pattern;
	kernel.sheet.img=new Image();
	kernel.sheet.img.src="../_images/"+pattern+"_"+kernel.sheet.orientation+".png";
	kernel.sheet.img.onload=function(){
		canvas.resize();
		canvas.offset.x=0;
		canvas.offset.y=0;
		id('canvases_wrapper').style.left=0;
		id('canvases_wrapper').style.top=0;
	};
}

canvas.tmp_preview_render=function(num){
	if(num !== undefined){
		if(!!kernel.pages.storage[num]){
			id('preview').getContext("2d").putImageData(kernel.pages.storage[num].image, 0, 0, 0, 0, id('preview').width, id('preview').height);
			kernel.sheet.orientation=kernel.pages.storage[num].orientation;
			kernel.sheet.set_type(kernel.pages.storage[num].type);
		}
	}
	id('tmp_preview_canvas').width=Math.max(parseFloat(id('preview').width), parseFloat(id('tmp_canvas').width));
	id('tmp_preview_canvas').height=Math.max(parseFloat(id('preview').height), parseFloat(id('tmp_canvas').height));
	id('tmp_preview_canvas').getContext("2d").clearRect(0, 0, id('tmp_preview_canvas').width, id('tmp_preview_canvas').height);
	id('tmp_preview_canvas').getContext("2d").putImageData(id('tmp_canvas').getContext("2d").getImageData(0, 0, id('tmp_canvas').width, id('tmp_canvas').height), 0, 0);
	id('tmp_preview_canvas').getContext("2d").drawImage(id('preview'), 0, 0, id('preview').width, id('preview').height, kernel.sheet.margins.left, kernel.sheet.margins.top, id('preview').width, id('preview').height);
}

canvas.resize=function(){
	var new_width, new_height;

	new_width=canvas.tmp.original.width*parseFloat(id('sheet_size').value);
	new_height=canvas.tmp.original.height*parseFloat(id('sheet_size').value);
	id('sheet_size_output').innerHTML=parseInt(parseFloat(id('sheet_size').value)*100, 0);

	id('tmp_canvas').width=new_width;
	id('tmp_canvas').height=new_height;
	id('tmp_canvas').getContext("2d").drawImage(kernel.sheet.img, 0, 0, new_width, new_height);
}

kernel.text.resize=function(){
	if(kernel.tmp.fti[1]){
		kernel.tmp.states[1].src=id('preview').toDataURL("image/png");
		kernel.tmp.fti[1]=false;
	}

	var new_width=canvas.current.width*parseFloat(id('text_size').value);
	var new_height=canvas.current.height*parseFloat(id('text_size').value);
	id('text_size_output').innerHTML=parseInt(parseFloat(id('text_size').value)*100, 0);
	kernel.tmp.states[1].onload=function(){
		canvas.context.clearRect(0, 0, id('preview').width, id('preview').height);
		canvas.context.drawImage(kernel.tmp.states[1], 0, 0, new_width, new_height);
		return;
	};

	canvas.context.clearRect(0, 0, id('preview').width, id('preview').height);
	canvas.context.drawImage(kernel.tmp.states[1], 0, 0, new_width, new_height);
}

canvas.reverse=function(){
	if(kernel.sheet.orientation == "right"){
		kernel.sheet.orientation="left";
	}
	else{
		kernel.sheet.orientation="right";
	}
	kernel.sheet.set_type(kernel.sheet.type);
}

canvas.prev=function(){
	if(kernel.pages.num !== 1){
		kernel.pages.storage[kernel.pages.num]={};
		kernel.pages.storage[kernel.pages.num].image=id('preview').getContext("2d").getImageData(0, 0, id('preview').width, id('preview').height);
		kernel.pages.storage[kernel.pages.num].orientation=kernel.sheet.orientation;
		kernel.pages.storage[kernel.pages.num].type=kernel.sheet.type;
		kernel.pages.storage[kernel.pages.num].text=id('text_input').value;
		kernel.pages.num-=1;
		if(!!kernel.pages.storage[kernel.pages.num]){
			id('preview').getContext("2d").putImageData(kernel.pages.storage[kernel.pages.num].image, 0, 0);
			kernel.sheet.orientation=kernel.pages.storage[kernel.pages.num].orientation;
			kernel.sheet.set_type(kernel.pages.storage[kernel.pages.num].type);
			id('text_input').value=kernel.pages.storage[kernel.pages.num].text;
		}
		else{
			id('preview').getContext("2d").clearRect(0, 0, id('preview').width, id('preview').height);
			canvas.reverse();
			id('text_input').value='';
		}
	}
}

canvas.next=function(){
	kernel.pages.storage[kernel.pages.num]={};
	kernel.pages.storage[kernel.pages.num].image=id('preview').getContext("2d").getImageData(0, 0, id('preview').width, id('preview').height);
	kernel.pages.storage[kernel.pages.num].orientation=kernel.sheet.orientation;
	kernel.pages.storage[kernel.pages.num].type=kernel.sheet.type;
	kernel.pages.storage[kernel.pages.num].text=id('text_input').value;
	kernel.pages.num+=1;
	if(!!kernel.pages.storage[kernel.pages.num]){
		id('preview').getContext("2d").putImageData(kernel.pages.storage[kernel.pages.num].image, 0, 0);
		kernel.sheet.orientation=kernel.pages.storage[kernel.pages.num].orientation;
		kernel.sheet.set_type(kernel.pages.storage[kernel.pages.num].type);
		id('text_input').value=kernel.pages.storage[kernel.pages.num].text;
	}
	else{
		id('preview').getContext("2d").clearRect(0, 0, id('preview').width, id('preview').height);
		canvas.reverse();
		id('text_input').value='';
	}
}

kernel.text.line.set_margin=function(){
	if(!!parseFloat(id('line_margin').value) || parseFloat(id('line_margin').value) === 0){
		if(parseFloat(id('line_margin').value) < -255 || parseFloat(id('line_margin').value) > 255){
			id('line_margin').classList.add('invalid');
		}
		else{
			id('line_margin').classList.remove('invalid');
		}
		kernel.text.line.margin=parseFloat(id('line_margin').value);
		id('line_margin').classList.remove('invalid');
		kernel.text.write(null, 'all');
	}
	else{
		id('line_margin').classList.remove('invalid');
	}
}

kernel.sheet.margins.set=function(el){
	if(kernel.tmp.fti[0]){
		kernel.tmp.states[0].src=id('preview').toDataURL("image/png");
		kernel.tmp.fti[0]=false;
	}
	var margin_top=parseFloat(id('sheet_margin_top').value) || 5;
	var margin_right=parseFloat(id('sheet_margin_right').value) || 5;
	var margin_bottom=parseFloat(id('sheet_margin_bottom').value) || 5;
	var margin_left=parseFloat(id('sheet_margin_left').value) || 5;

	id('preview').style.left=margin_left+"px";
	id('preview').style.top=margin_top+"px";
	id('preview').width=(canvas.original.width-(margin_left+margin_right));
	id('preview').height=(canvas.original.height-(margin_top+margin_bottom));

	canvas.current.width=id('preview').width;
	canvas.current.height=id('preview').height;

	canvas.context.drawImage(kernel.tmp.states[0], 0, 0);
}

kernel.sheet.margins.render=function(){
	if(id('show_margins').checked){
		id('preview').style.border="1px dashed rgb(243,146,0)";
	}
	else{
		id('preview').style.border="none";
	}
}

kernel.text.letters.define_current_canvas=function(){
	var current_canvas;

	for(var i=0; i<id('canvas_to_use').children.length; i++){
		id('canvas_to_use').getElementsByClassName('custom_option')[i].classList.add('hidden');
	}

	for(var i=0; i<canvas.canvases.length; i++){
		if(canvas.canvases[i].code[id('letters_for_settings').value.slice(0, 1)]){
			id('letter_sample_'+i).classList.remove('hidden');
		}
	}

	return canvas.use.current;
};

kernel.text.letters.check_letters=function(){
	var $letters_for_settings=id('letters_for_settings');
	var current_canvas=kernel.text.letters.define_current_canvas();
	for(var i=0; i<letters_for_settings.value.length; i++){
		if(!canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(i, i+1)]){
			$letters_for_settings.classList.add('invalid');
			return false;
		}
	}
	$letters_for_settings.classList.remove('invalid');
	return true;
}

kernel.text.letters.new_letter=function(){
	var $letters_for_settings=id('letters_for_settings');
	var current_canvas=kernel.text.letters.define_current_canvas();
	if(!kernel.text.letters.check_letters()){
		return;
	}
	if($letters_for_settings.value.length === 1){// User entered 1 letter
		id('letter_margin_top').value   =canvas.canvases[current_canvas].code[$letters_for_settings.value].margin_top;
		id('letter_margin_left').value  =canvas.canvases[current_canvas].code[$letters_for_settings.value].margin_left;
		id('letter_margin_right').value =canvas.canvases[current_canvas].code[$letters_for_settings.value].margin_right;
		id('letter_margin_bottom').value=canvas.canvases[current_canvas].code[$letters_for_settings.value].margin_bottom;
		id('letters_size').value=canvas.canvases[current_canvas].code[$letters_for_settings.value].size;
	}
	else{
		var least_params={margins: {}, size: 100};
		least_params.margins.top   =canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(0, 1)].margin_top;
		least_params.margins.left  =canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(0, 1)].margin_left;
		least_params.margins.right =canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(0, 1)].margin_right;
		least_params.margins.bottom=canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(0, 1)].margin_bottom;
		least_params.size=canvas.canvases[current_canvas].code[$letters_for_settings.value.slice(0, 1)].size;

		var last_tried_canvas=-1;
		for(var i=0; i<$letters_for_settings.value.length; i++){
			var current_letter=$letters_for_settings.value.slice(i, i+1);
			(function loop(grand_canvas_to_use){
				if(!canvas.canvases[grand_canvas_to_use].code[current_letter]){// An invalid character
					if(last_tried_canvas < canvas.canvases.length-1){
						last_tried_canvas++;
						loop(last_tried_canvas);
					}
					else{
						$letters_for_settings.classList.add('invalid');
						return function(){return false;};
					}
				}
				else{
					last_tried_canvas=0;
					id('letters_for_settings').classList.remove('invalid');
					if(canvas.canvases[grand_canvas_to_use].code[current_letter].margin_top < least_params.margins.top){
						least_params.margins.top=canvas.canvases[grand_canvas_to_use].code[current_letter].margin_top;
					}
					if(canvas.canvases[grand_canvas_to_use].code[current_letter].margin_left < least_params.margins.left){
						least_params.margins.left=canvas.canvases[grand_canvas_to_use].code[current_letter].margin_left;
					}
					if(canvas.canvases[grand_canvas_to_use].code[current_letter].margin_right < least_params.margins.right){
						least_params.margins.right=canvas.canvases[grand_canvas_to_use].code[current_letter].margin_right
					}
					if(canvas.canvases[grand_canvas_to_use].code[current_letter].margin_bottom < least_params.margins.bottom){
						least_params.margins.bottom=canvas.canvases[grand_canvas_to_use].code[current_letter].margin_bottom;
					}
					if(canvas.canvases[grand_canvas_to_use].code[current_letter].size < least_params.size){
						least_params.size=canvas.canvases[grand_canvas_to_use].code[current_letter].size;
					}
				}
			})(current_canvas);
			id('letter_margin_top').value=least_params.margins.top;
			id('letter_margin_left').value=least_params.margins.left;
			id('letter_margin_right').value=least_params.margins.right;
			id('letter_margin_bottom').value=least_params.margins.bottom;
			id('letters_size').value=least_params.size;
		}
	}
	return true;
};

kernel.text.letters.set_margins=function(el){
	if(!kernel.text.letters.check_letters()){
		return;
	}

	if(!!parseFloat(el.value) || parseFloat(el.value) === 0){
		if(parseFloat(el.value) < -255 || parseFloat(el.value) > 255){
			el.classList.add('invalid');
			return;
		}
		else{
			el.classList.remove('invalid');
		}
	}

	var current_canvas=kernel.text.letters.define_current_canvas();
	var current_margin_field=el.id.split("_").pop();
	var $letters_for_settings=id('letters_for_settings');
	for(var i=0; i<$letters_for_settings.value.length; i++){
		var current_letter=$letters_for_settings.value.slice(i, i+1);

		if(kernel.text.changed_margins.canvases.indexOf(current_canvas) === -1){
			kernel.text.changed_margins.changed=true;
			kernel.text.changed_margins.canvases.push(current_canvas);
		}
		el.classList.remove('invalid');
		switch(current_margin_field){
			case "top":
				canvas.canvases[current_canvas].code[current_letter].margin_top=parseFloat(id('letter_margin_top').value);
				break;
			case "left":
				canvas.canvases[current_canvas].code[current_letter].margin_left=parseFloat(id('letter_margin_left').value);
				break;
			case "right":
				canvas.canvases[current_canvas].code[current_letter].margin_right=parseFloat(id('letter_margin_right').value);
				break;
			case "bottom":
				canvas.canvases[current_canvas].code[current_letter].margin_bottom=parseFloat(id('letter_margin_bottom').value);
				break;
		}
		var red_component=canvas.canvases[current_canvas].code[current_letter].margin_top;
		var green_component=canvas.canvases[current_canvas].code[current_letter].margin_left;
		var blue_component=0;

		if(canvas.canvases[current_canvas].code[current_letter].margin_top < 0){
			var red_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_top.toString().slice(1));
			var blue_component=1;
		}
		if(canvas.canvases[current_canvas].code[current_letter].margin_left < 0){
			var green_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_left.toString().slice(1));
			var blue_component=2;
		}
		if(canvas.canvases[current_canvas].code[current_letter].margin_top < 0 && canvas.canvases[current_canvas].code[current_letter].margin_left < 0){
			var red_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_top.toString().slice(1));
			var green_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_left.toString().slice(1));
			var blue_component=3;
		}
		id('letter_canvas_'+current_canvas).getContext("2d").fillStyle="rgb("+red_component+", "+green_component+", "+blue_component+")";
		id('letter_canvas_'+current_canvas).getContext("2d").fillRect(canvas.canvases[current_canvas].code[current_letter].index, (canvas.canvases[current_canvas].selection_box_size*20)+1, 1, 1);

		var red_component=canvas.canvases[current_canvas].code[current_letter].margin_right;
		var green_component=canvas.canvases[current_canvas].code[current_letter].margin_bottom;
		var blue_component=0;

		if(canvas.canvases[current_canvas].code[current_letter].margin_right < 0){
			var red_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_right.toString().slice(1));
			var blue_component=1;
		}
		if(canvas.canvases[current_canvas].code[current_letter].margin_bottom < 0){
			var green_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_bottom.toString().slice(1));
			var blue_component=2;
		}
		if(canvas.canvases[current_canvas].code[current_letter].margin_right < 0 && canvas.canvases[current_canvas].code[current_letter].margin_bottom < 0){
			var red_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_right.toString().slice(1));
			var green_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].margin_bottom.toString().slice(1));
			var blue_component=3;
		}
		id('letter_canvas_'+current_canvas).getContext("2d").fillStyle="rgb("+red_component+", "+green_component+", "+blue_component+")";
		id('letter_canvas_'+current_canvas).getContext("2d").fillRect(canvas.canvases[current_canvas].code[current_letter].index, (canvas.canvases[current_canvas].selection_box_size*20)+2, 1, 1);
	}
	kernel.text.write(canvas.use.current);
}

kernel.text.letters.set_size=function(){
	if(!kernel.text.letters.check_letters()){
		return;
	}

	var current_canvas=kernel.text.letters.define_current_canvas();
	var $letters_for_settings=id('letters_for_settings');
	$letters_for_settings.classList.remove('invalid');

	for(var i=0; i<$letters_for_settings.value.length; i++){
		var current_letter=$letters_for_settings.value.slice(i, i+1);
		if(!canvas.canvases[current_canvas].code[current_letter]){// invalid character
			$letters_for_settings.classList.add('invalid');
			return;
		}
		if(!!parseFloat(id('letters_size').value) || parseFloat(id('letters_size').value) === 0){
			if(parseFloat(id('letters_size').value) < -255 || parseFloat(id('letters_size').value) > 255){
				id('letters_size').classList.add('invalid');
				return;
			}
			else{
				id('letters_size').classList.remove('invalid');
			}
		}
		canvas.canvases[current_canvas].code[current_letter].size=parseFloat(id('letters_size').value);
		var red_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].width.toString());
		var green_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].height.toString());
		var blue_component=parseFloat(canvas.canvases[current_canvas].code[current_letter].size.toString());

		id('letter_canvas_'+current_canvas).getContext("2d").fillStyle="rgb("+red_component+", "+green_component+", "+blue_component+")";
		id('letter_canvas_'+current_canvas).getContext("2d").fillRect(canvas.canvases[current_canvas].code[current_letter].index, canvas.canvases[current_canvas].selection_box_size*20, 1, 1);
	}
	kernel.text.write(canvas.use.current);
}

kernel.download=function(){//download
	var download_link=document.createElement("A");
	download_link.id="download_link";
	document.body.appendChild(download_link);
	id('download_link').style.display="none";
	id('download_link').setAttribute("download", "complete-file.png");
	function sync(i){
		canvas.tmp_preview_render(i);
		id('download_link').setAttribute("href", id('tmp_preview_canvas').toDataURL("image/png"));
		kernel.cursor_wait("set");
		var buttons_length=document.getElementsByTagName("BUTTON").length;
		for(var q=buttons_length-3; q<buttons_length; q++){
			document.getElementsByTagName("BUTTON")[q].style.cursor="wait";
			document.getElementsByTagName("BUTTON")[q].setAttribute("disabled", "");
		}
		setTimeout(function(){
			kernel.cursor_wait("delete");
			for(var q=document.getElementsByTagName("BUTTON").length-3; q<=document.getElementsByTagName("BUTTON").length-1; q++){
				document.getElementsByTagName("BUTTON")[q].style.cursor="default";
				document.getElementsByTagName("BUTTON")[q].removeAttribute("disabled");
			}
			id('download_link').click();
			if(kernel.text.changed_margins.changed){
				globals.msg("confirm", localization.msgs.load_jarn_file.title, localization.msgs.load_jarn_file.text, function(){
					canvas.letter.download();
				});
			}
			if(i < kernel.pages.num){
				sync(++i);
				sync(++i);
			}
		}, 10000);
	}
	sync(0);
}

canvas.letter.download=function(){//download_letter_canvas
	for(var r=0; r<kernel.text.changed_margins.canvases.length; r++){
		var download_link=document.createElement("A");
		download_link.id="letters_download_link";
		document.body.appendChild(download_link);
		id('letters_download_link').style.display="none";
		id('letters_download_link').setAttribute("download", "jarn-file.png");
		id('letters_download_link').setAttribute("href", id('letter_canvas'+"_"+kernel.text.changed_margins.canvases[r]).toDataURL("image/png"));
		id('letters_download_link').click();
		id('letters_download_link').outerHTML="";
	}
}

kernel.text.letters.show_test=function(){//show_test_letters
	if(id('toggle_test').className === "show_test_letters"){
		id('toggle_test').className="show_prev_letters";
		id('toggle_test').innerHTML=localization.body.show_prev_letters;
		id('toggle_test').value="";
		kernel.text.original=id('text_input').value;
		id('text_input').value='';
		for(var t=0; t<=kernel.dict[canvas.use.current].length-1; t++){
			if(canvas.canvases[canvas.use.current].code[kernel.dict[canvas.use.current][t]]){
				if(canvas.canvases[canvas.use.current].code[kernel.dict[canvas.use.current][t]].width != 0 || canvas.canvases[canvas.use.current].code[kernel.dict[canvas.use.current][t]].height != 0){
					id('text_input').value+=kernel.dict[canvas.use.current][t];
				}
			}
		}
		kernel.text.write(canvas.use.current);
	}
	else{
		id('toggle_test').className="show_test_letters";
		id('toggle_test').innerHTML=localization.body.show_test_letters;
		id('text_input').value=kernel.text.original;
		kernel.text.write(null, 'all');
	}
}

kernel.raise_value[0]=function(event, el){
	start_position=event.clientY;
	start_value=parseFloat(el.value);
	if(!start_value){start_value=0;}
	raise_el=el;
	evt.set(document.body, "mousemove", "kernel.raise_value[1](event)");
	evt.set(document.body, "mouseup",   "kernel.raise_value[2]()");
}

kernel.raise_value[1]=function(event){
	if(parseFloat(raise_el.value) > -255 && parseFloat(raise_el.value) < 255){
		raise_el.value=start_value+(start_position-event.clientY);
	}
	else{
		if(parseFloat(raise_el.value) < 0){
			raise_el.value="-255";
		}
		else{
			raise_el.value="255";
		}
	}
}

kernel.raise_value[2]=function(){
	eval(raise_el.getAttribute("oninput").replace("this", "raise_el"));
	document.body.removeAttribute("onmouseup");
	document.body.removeAttribute("onmousemove");
}

kernel.text.replace=function(pattern, from, to){
	var from=from || id('find_field').value;
	var match_position=id('text_input').value.indexOf(from);
	if(match_position >= 0){
		var to=to || id('replace_field').value;
		if(pattern === 0){//Replace 1st.
			id('text_input').value=id('text_input').value.replace(from, to);
			id('text_output').innerHTML=id('text_input').value;
			kernel.text.write();
		}
		else if(pattern === 1){//Replace all.
			id('text_input').value=id('text_input').value.split(from).join(to);
			id('text_output').innerHTML=id('text_input').value;
			kernel.text.write();
		}
		else{//Find and highlight.
			for(var i=0; i<cls('highlighted', true).length; i++){
				var tmp=cls('highlighted', true)[i].innerHTML;
				cls('highlighted', true)[i].outerHTML=tmp;
			}
			var expression=new RegExp(from, 'g');
			id('text_output').innerHTML=id('text_input').value.replace(expression, '<span class="highlighted">'+from+'</span>');
		}
		id('text_output').style.display='inline';
	}
}

canvas.walking[0]=function(event){
	canvas.walking.start_x=event.clientX;
	canvas.walking.start_y=event.clientY;
	evt.set(id('canvases_wrapper'), 'mousemove',             'canvas.walking[1](event)');
	evt.set(id('canvases_wrapper'), ['mouseup', 'mouseout'], 'canvas.walking[2](event)');
}

canvas.walking[1]=function(event){
	id('canvases_wrapper').style.left=(canvas.offset.x+(event.clientX-canvas.walking.start_x))+'px';
	id('canvases_wrapper').style.top =(canvas.offset.y+(event.clientY-canvas.walking.start_y))+'px';
}

canvas.walking[2]=function(event){
	evt.remove(id('canvases_wrapper'), 'mousemove');
	evt.remove(id('canvases_wrapper'), 'mouseup');
	canvas.offset.x+=(event.clientX-canvas.walking.start_x);
	canvas.offset.y+=(event.clientY-canvas.walking.start_y);
}

kernel.cursor_wait=function(action){
	if(action === "set"){
		id("stylesheet").innerHTML="*{cursor: progress;}";
	}
	else{
		id("stylesheet").innerHTML="";
	}
}

kernel.initialization=function(){
	kernel.sheet.margins.render();
	kernel.sheet.set_type('cells');
	kernel.sheet.margins.set(id('margin_top'));

	id('file').setAttribute('onchange', 'kernel.upload(files)');
	id('canvas_to_use').setAttribute('data-trigger', 'function(){canvas.use.current=parseFloat(id("canvas_to_use").getAttribute("data-value"));}');
	evt.set(id('b_to_home'), 'click', 'goto("../")');

	evt.set(id('text_input'),                          'input',     'kernel.text.write()');
	evt.set(id('sheet_margin_top'),                    'input',     'kernel.sheet.margins.set(this)');
	evt.set(id('sheet_margin_left'),                   'input',     'kernel.sheet.margins.set(this)');
	evt.set(id('sheet_margin_right'),                  'input',     'kernel.sheet.margins.set(this)');
	evt.set(id('sheet_margin_bottom'),                 'input',     'kernel.sheet.margins.set(this)');
	evt.set(id('line_margin'),                         'input',     'kernel.text.line.set_margin()');
	evt.set(id('letters_for_settings'),                'input',     'kernel.text.letters.new_letter()');
	evt.set(id('letter_margin_top'),                   'input',     'kernel.text.letters.set_margins(this)');
	evt.set(id('letter_margin_left'),                  'input',     'kernel.text.letters.set_margins(this)');
	evt.set(id('letter_margin_right'),                 'input',     'kernel.text.letters.set_margins(this)');
	evt.set(id('letter_margin_bottom'),                'input',     'kernel.text.letters.set_margins(this)');
	evt.set(id('letters_size'),                        'input',     'kernel.text.letters.set_size()');
	evt.set(id('toggle_test'),                         'click',     'kernel.text.letters.show_test()');
	evt.set(id('reverse_title'),                       'click',     'canvas.reverse()');
	evt.set(id('sheet_size'),                          'input',     'canvas.resize()');
	evt.set(id('sheet_type_cells'),                    'change',    'kernel.sheet.set_type("cells")');
	evt.set(id('sheet_type_lines'),                    'change',    'kernel.sheet.set_type("lines")');
	evt.set(id('text_size'),                           'input',     'kernel.text.resize()');
	evt.set(id('show_margins'),                        'change',    'kernel.sheet.margins.render()');
	evt.set(id('auto_CR'),                             'change',    'kernel.text.write(null, "all")');
	evt.set(id('replace_button'),                      'click',     'kernel.text.replace(0)');
	evt.set(id('replace_all_button'),                  'click',     'kernel.text.replace(1)');
	evt.set(id('find_button'),                         'click',     'kernel.text.replace(2)');
	evt.set(id('canvas_prev'),                         'click',     'canvas.prev()');
	evt.set(id('canvas_next'),                         'click',     'canvas.next()');
	evt.set(id('b_to_0'),                              'click',     'kernel.steps[0].move(1)');
	evt.set(id('f_to_1'),                              'click',     'kernel.steps[1].move(0)');
	evt.set(id('f_to_2'),                              'click',     'kernel.steps[2].move(1)');
	evt.set(id('b_to_1'),                              'click',     'kernel.steps[1].move(2)');
	evt.set(id('f_to_3'),                              'click',     'kernel.download()');
	evt.set(id('canvases_wrapper'),                    'mousedown', 'canvas.walking[0](event)');
	evt.set([cls('panel_left'), cls('panel_right')],   'mouseover', 'globals.scrolling_block(true)');
	evt.set([cls('panel_left'), cls('panel_right')],   'mouseout',  'globals.scrolling_block(false)');
}