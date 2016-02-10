/* <magic> */
'use strict';
var current_page='create';																										//Is used by /_scripts/global.js to choose the correct localization table

var images={																													//Stores ImageData and images for restoring
	'image': new Image(),
	'original_image_data': {}, // Is used to store an original image
	'middle_data': {}, // Is used to store an original data but with another size (set by user)
	'image_data': {}, // Is used to store a clean_imageed state of the canvas
	'clean_image': new Image(), // Is used to store an image that contains only letters
};

var canvas={																											//Stores properties and methods for canvases
	'context': id('canvas').getContext('2d'),
	'get_color_completed': false,
	'multiplier': 0,
	'chosen_px': {
		'x': 0,
		'y': 0,
		'r': undefined,
		'g': undefined,
		'b': undefined,
	},
	'resizing': {
		'width':  null,
		'height': null,
		'percent': 1,
	},
	'walking': {
		'start_x': 0,
		'start_y': 0,
	},
	'offset': {
		'x': 0,
		'y': 0,
	},
	'tmp': {
		'context': id('tmp_canvas').getContext('2d'),
		'offset': {
			'x': 0,
			'y': 0
		},
		'draw': [],
		'erase': [],
		'walking': []
	},
	'letter': {
		'context': id('letter_canvas').getContext('2d'),
	},
};

var selection_box={																										//Stores properties and methods for selection box
	'start_x': 0,
	'start_y': 0,
	'width':   0,
	'height':  0,
	'size': {
		'current': parseFloat(id('selection_box_size').value),
		'old':     parseFloat(id('selection_box_size').value),														//Is used to remember previous size and correctly define new letter_canvas size
	},
	'rendering': {
	},
};

var kernel={
	'input_method': 'classic',
	'_file_uploaded': false,
	set file_uploaded(value){
		kernel._file_uploaded=value;
		if(value){
			cls('step_overlay', true)[0].style.display='none';
			cls('step_overlay', true)[1].style.display='none';
		}
		else{
			cls('step_overlay', true)[0].style.display='block';
			cls('step_overlay', true)[1].style.display='block';
		}
	},
	get file_uploaded(){
		return kernel._file_uploaded;
	},
	'steps': [{},{},{}],
	'language': {
		'current': 'default',
	},
	'dict': [],
	'letters': {},
	'used_letters':   [],
	'processing': {
		'max': {
			'top':    Infinity,
			'left':   Infinity,
			'right':  Infinity,
			'bottom': Infinity,
		},
		'current': {
			'left': 0,
			'top':  0,
			'letter': {
				'self': '',
				'top':  0,
				'left': 0,
			},
			'chosen': {
				'width':  0,
				'height': 0,
			},
		},
	},
	'downloading': {},
	'mobile': {
		'pointers': {
			'move': [],
			'x': {
				'first': {'start_y': 0, 'mouse_start_y': 0},
				'second': {'start_y': 0, 'mouse_start_y': 0},
			},
			'y': {
				'first': {'start_x': 0, 'mouse_start_x': 0},
				'second': {'start_x': 0, 'mouse_start_x': 0},
			},
		},
	},
	'tmp': {
		'buffer': '',
		'fti': [
			true,
		],
	},
};


canvas.check_blur=function(just_change){
	id('range_result').innerHTML=id('multiplier').value+'%';
	if(!just_change){
		canvas.get_color(null, true);
	}
}

canvas.get_color=function(event, apply_changes){
	var $canvas=id('canvas');
	var $multiplier=id('multiplier');
	var $canvas_width=parseFloat($canvas.width);
	var $canvas_height=parseFloat($canvas.height);
	var $canvas_parent_width=parseFloat(id('canvas_parent').offsetWidth);
	var $canvas_parent_height=parseFloat(id('canvas_parent').offsetHeight);

	canvas.multiplier=2.55*$multiplier.value;
	if($multiplier.value === '0'){
		canvas.context.clearRect(0, 0, $canvas_width, $canvas_height);
	}
	//for(var k=0; k<images.original_image_data.data.length; k++){
	images.image_data=$canvas.getContext('2d').createImageData(images.middle_data);
	for(var k=0; k<images.middle_data.data.length; k++){
		//images.image_data.data[k]=images.original_image_data.data[k];
		images.image_data.data[k]=images.middle_data.data[k];
	}

	if(!!event){
		event.preventDefault();
		canvas.chosen_px.x=event.layerX;
		canvas.chosen_px.y=event.layerY;
		var i=((canvas.chosen_px.y*$canvas_width)+canvas.chosen_px.x)*4;
		canvas.chosen_px.r=images.image_data.data[i+0];
		canvas.chosen_px.g=images.image_data.data[i+1];
		canvas.chosen_px.b=images.image_data.data[i+2];
		evt.set($multiplier, 'change', 'canvas.check_blur(false)');
		apply_changes=true;
	}
	if($multiplier.value === '100') return;
	if(apply_changes){
		//visible part params
		//var part_top=0;
		//if(!!parseFloat($canvas.style.top)){
		//	var part_top=parseFloat($canvas.style.top)*-1;
		//	if(part_top < 0) part_top=0;
		//}
		//
		//var part_left=0;
		//if(!!parseFloat($canvas.style.left)){
		//	var part_left=parseFloat($canvas.style.left)*-1;
		//	if(part_left < 0) part_left=0;
		//}
		//
		//if($canvas_height < $canvas_parent_height){
		//	var part_height=$canvas_height;
		//}
		//else{
		//	var part_height=$canvas_parent_height;
		//}
		//if($canvas_width < $canvas_parent_width){
		//	var part_width=$canvas_width;
		//}
		//else{
		//	var part_width=$canvas_parent_width;
		//}
		//var part_right=parseFloat(part_left)+parseFloat(part_width);
		//var part_bottom=parseFloat(part_top)+parseFloat(part_height);
		//var min_coords=((part_top*$canvas_width)+part_left)*4;
		//var cur_left=part_left;
		//var cur_top=part_top;
		var $image_data_length=images.image_data.data.length;
		//for(var j=min_coords; ;j+=5){
		for(var j=0; j<$image_data_length; j+=4){
			//if(cur_left == part_right){
			//	if(cur_left == part_right && cur_top == part_bottom){
			//		cur_left--;//set to the last pixel;
			//		break;
			//	}
			//	else{
			//		cur_top++;
			//		cur_left=part_left;
			//	}
			//}
			//cur_left++;
			//var cur_px=((cur_top*$canvas_width)+cur_left)*4;
			var cur_px=j;
			var max=[
				Math.max(canvas.chosen_px.r, images.image_data.data[cur_px+0]),
				Math.max(canvas.chosen_px.g, images.image_data.data[cur_px+1]),
				Math.max(canvas.chosen_px.b, images.image_data.data[cur_px+2]),
			];
			var min=[
				Math.min(canvas.chosen_px.r, images.image_data.data[cur_px+0]),
				Math.min(canvas.chosen_px.g, images.image_data.data[cur_px+1]),
				Math.min(canvas.chosen_px.b, images.image_data.data[cur_px+2]),
			];
			var diff=[
				max[0]-min[0],
				max[1]-min[1],
				max[2]-min[2],
			];
			var condition=( diff[0] <= canvas.multiplier &&
					 diff[1] <= canvas.multiplier &&
					 diff[2] <= canvas.multiplier );
			if(!condition){
				images.image_data.data[cur_px+0]=255;
				images.image_data.data[cur_px+1]=255;
				images.image_data.data[cur_px+2]=255;
				images.image_data.data[cur_px+3]=255;
			}
		}
		$canvas.width=$canvas_width;
		$canvas.height=$canvas_height;
		id('canvas').getContext('2d').putImageData(images.image_data, 0, 0);
		setTimeout(function(){
			images.clean_image.src=$canvas.toDataURL();
		}, 0);
	}
	if(!canvas.get_color_completed){
		canvas.get_color_completed=true;
		evt.remove($canvas, 'contextmenu');
		localization.hints.canvas=localization.hints.canvas_after_getting_the_color;
		kernel.mobile.pointers.initialization();
	}
	//kernel.mobile.pointers.initialization();
}

canvas.resizing.resize=function(just_change){
	id('canvas_size_result').innerHTML=(parseFloat(id('canvas_size').value)*100).toFixed(0)+'%';
	if(!just_change){
		canvas.resizing.percent=parseFloat(id('canvas_size').value);
		var old_params={
			'width': id('canvas').width,
			'height': id('canvas').height,
		};
		canvas.resizing.width= canvas.original_width* parseFloat(id('canvas_size').value);
		canvas.resizing.height=canvas.original_height*parseFloat(id('canvas_size').value);
		id('canvas').width=canvas.resizing.width;
		id('canvas').height=canvas.resizing.height;
		id('canvas').getContext('2d').drawImage(images.clean_image, 0, 0, old_params.width, old_params.height, 0, 0, canvas.resizing.width, canvas.resizing.height);
		id('tmp_state_canvas').width=canvas.resizing.width;
		id('tmp_state_canvas').height=canvas.resizing.height;
		id('tmp_state_canvas').getContext('2d').drawImage(images.image, 0, 0, old_params.width, old_params.height, 0, 0, canvas.resizing.width, canvas.resizing.height);
		images.middle_data=id('tmp_state_canvas').getContext('2d').getImageData(0, 0, id('tmp_state_canvas').width, id('tmp_state_canvas').height);
	}
};

canvas.get_color_again=function(){
	canvas.chosen_px={
		'x': 0,
		'y': 0,
		'r': undefined,
		'g': undefined,
		'b': undefined,
	},
	canvas.get_color_completed=false;
	id('canvas_size').value='1';
	id('canvas_size_result').innerHTML=(parseFloat(id('canvas_size').value)*100).toFixed(0)+'%';
	id('canvas').width=  images.image.width;
	id('canvas').height= images.image.height;
	canvas.context.drawImage(images.image, 0, 0);
	images.middle_data=id('canvas').getContext('2d').getImageData(0, 0, images.image.width, images.image.height);

	evt.set(id('canvas'), 'contextmenu', 'canvas.define_mouse_behavior(event, "get_color")');
	evt.set(id('multiplier'), ['change', 'input'], 'canvas.check_blur(true)');
	localization.hints.canvas=canvas.original_hint;
}

canvas.define_mouse_behavior=function(event, step){
	if(step === 'get_color'){
		if(event.which === 3 && !('touches' in event)){
			canvas.get_color(event);
		}
		return;
	}
	if(step === 'deny'){
		selection_box.rendering.deny(event);
		step=0;
	}
	if(event.which === 1){
		canvas.walking[step](event);
	}
	else if(event.which === 3 && canvas.get_color_completed){
		selection_box.rendering[step](event);
	}
}

canvas.walking[0]=function(event){
	canvas.walking.start_x=event.clientX;
	canvas.walking.start_y=event.clientY;
	evt.set(id('canvas'), 'mousemove', 'canvas.define_mouse_behavior(event, 1)');
	evt.set(id('canvas'), 'mouseup',   'canvas.define_mouse_behavior(event, 2)');
}

canvas.walking[1]=function(event){
	id('canvas').style.left=(canvas.offset.x+(event.clientX-canvas.walking.start_x))+'px';
	id('canvas').style.top =(canvas.offset.y+(event.clientY-canvas.walking.start_y))+'px';
}

canvas.walking[2]=function(event){
	evt.remove(id('canvas'), 'mousemove');
	evt.remove(id('canvas'), 'mouseup');
	canvas.offset.x+=(event.clientX-canvas.walking.start_x);
	canvas.offset.y+=(event.clientY-canvas.walking.start_y);
	if(canvas.get_color_completed){
		//canvas.get_color();
	}
}

canvas.tmp.draw[0]=function(event){
	evt.set(id('tmp_canvas'), 'mousemove', 'canvas.tmp.draw[1](event)');
	evt.set(id('tmp_canvas'), 'touchmove', 'canvas.tmp.draw[1](event)');
	evt.set(id('tmp_canvas'), ['mouseup', 'mouseout', 'touchend', 'touchcancel'], 'canvas.tmp.draw[2](event)');

	canvas.tmp.context.fillStyle='rgb('+canvas.chosen_px.r+', '+canvas.chosen_px.g+', '+canvas.chosen_px.b+')';
	canvas.tmp.draw[1](event);
}

canvas.tmp.draw[1]=function(event){
	requestAnimationFrame(canvas.tmp.draw[1]);
	if(!!event.touches){
		event.clientX=event.touches.clientX;
		event.clientY=event.touches.clientY;
	}
	var x=parseInt(event.clientX-id('tmp_canvas').getBoundingClientRect().left, 0);
	var y=parseInt(event.clientY-id('tmp_canvas').getBoundingClientRect().top, 0);
	canvas.tmp.context.fillRect(x, y, 2, 2);
}

canvas.tmp.draw[2]=function(event){
	evt.remove(id('tmp_canvas'), 'mouseup');
	evt.remove(id('tmp_canvas'), 'touchend');
	evt.remove(id('tmp_canvas'), 'mousemove');
	evt.remove(id('tmp_canvas'), 'touchmove');
	evt.remove(id('tmp_canvas'), 'mouseout');
	kernel.tmp.buffer=canvas.tmp.context.getImageData(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	kernel.letters[kernel.processing.current.letter.self].image=kernel.tmp.buffer;
	kernel.letters[kernel.processing.current.letter.self].width =selection_box.width;
	kernel.letters[kernel.processing.current.letter.self].height=selection_box.height;
	kernel.letters[kernel.processing.current.letter.self].left=kernel.processing.current.letter.left;
	kernel.letters[kernel.processing.current.letter.self].top=kernel.processing.current.letter.top;
	kernel.go_to_letter(kernel.processing.current.letter.self);
}

canvas.tmp.erase[0]=function(event){
	evt.set(id('tmp_canvas'), ['mousemove', 'touchmove'], 'canvas.tmp.erase[1](event)');
	evt.set(id('tmp_canvas'), ['mouseout', 'mouseup', 'touchend', 'touchcancel'],  'canvas.tmp.erase[2](event)');
	canvas.tmp.erase[1](event);
}

canvas.tmp.erase[1]=function(event){
	if(!!event.touches){
		event.clientX=event.touches.clientX;
		event.clientY=event.touches.clientY;
	}
	var x=parseInt(event.clientX-id('tmp_canvas').getBoundingClientRect().left, 0);
	var y=parseInt(event.clientY-id('tmp_canvas').getBoundingClientRect().top, 0);
	canvas.tmp.context.clearRect(x , y, 9, 9);
}

canvas.tmp.erase[2]=function(event){
	evt.remove(id('tmp_canvas'), ['mouseup', 'mousemove', 'touchend', 'touchmove', 'mouseout']);
	kernel.tmp.buffer=canvas.tmp.context.getImageData(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	kernel.letters[kernel.processing.current.letter.self].image=kernel.tmp.buffer;
	kernel.letters[kernel.processing.current.letter.self].left=kernel.processing.current.letter.left;
	kernel.letters[kernel.processing.current.letter.self].top=kernel.processing.current.letter.top;
	kernel.go_to_letter(kernel.processing.current.letter.self);
}

canvas.tmp.set_cursor=function(pattern){
	evt.remove(id('tmp_canvas'), ['mousedown', 'touchstart']);
	var cursor;
	if(pattern === 'Default'){
		evt.set(id('tmp_canvas'), ['mousedown', 'touchstart'], 'canvas.tmp.walking[0](event)');
		cursor='default'
	}
	else{
		cursor='url(/_images/'+pattern+'.png), default';
		if(pattern === 'Eraser'){
			evt.set(id('tmp_canvas'), ['mousedown', 'touchstart'], 'canvas.tmp.erase[0](event)');
		}
		else{
			evt.set(id('tmp_canvas'), ['mousedown', 'touchstart'], 'canvas.tmp.draw[0](event)');
		}
	}
	id('tmp_canvas').style.cursor=cursor;
}

canvas.tmp.walking[0]=function(event){
	canvas.tmp.walking.start_x=event.clientX;
	canvas.tmp.walking.start_y=event.clientY;
	evt.set(id('tmp_canvas'), 'mousemove', 'canvas.tmp.walking[1](event)');
	evt.set(id('tmp_canvas'), 'mouseup',   'canvas.tmp.walking[2](event)');
}

canvas.tmp.walking[1]=function(event){
	id('tmp_canvas').style.left=(canvas.tmp.offset.x+(event.clientX-canvas.tmp.walking.start_x))+'px';
	id('tmp_canvas').style.top =(canvas.tmp.offset.y+(event.clientY-canvas.tmp.walking.start_y))+'px';
}

canvas.tmp.walking[2]=function(event){
	evt.remove(id('tmp_canvas'), ['mousemove', 'mouseup']);
	canvas.tmp.offset.x+=(event.clientX-canvas.tmp.walking.start_x);
	canvas.tmp.offset.y+=(event.clientY-canvas.tmp.walking.start_y);
}

canvas.letter.fill=function(){
	if(!kernel.processing.current.letter.self){alert('create.js:441');return;}
	var transparency_data=canvas.tmp.context.getImageData(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	var tmp=selection_box.width*selection_box.height*4;
	for(var l=0; l <= tmp; l+=4){
		if(kernel.processing.current.left == selection_box.width){
			if(!(kernel.processing.current.left === selection_box.width  &&
				 kernel.processing.current.top  === selection_box.height )){
				 kernel.processing.current.top++;
				 kernel.processing.current.left=0;
			}
			else{																										//the last pixel+1;
				kernel.processing.current.left--;																		//set to the last pixel;
			}
		}
		kernel.processing.current.left++;
		var max=[
			Math.max(canvas.chosen_px.r, transparency_data.data[l+0]),
			Math.max(canvas.chosen_px.g, transparency_data.data[l+1]),
			Math.max(canvas.chosen_px.b, transparency_data.data[l+2]),
		];
		var min=[
			Math.min(canvas.chosen_px.r, transparency_data.data[l+0]),
			Math.min(canvas.chosen_px.g, transparency_data.data[l+1]),
			Math.min(canvas.chosen_px.b, transparency_data.data[l+2]),
		];
		var diff=[
			max[0]-min[0],
			max[1]-min[1],
			max[2]-min[2],
		];
		var condition=( diff[0] <= canvas.multiplier &&
					    diff[1] <= canvas.multiplier &&
					    diff[2] <= canvas.multiplier );
		if(transparency_data.data[l+3] === 0) condition=false;															//Unless alpha is the the same pixels are different.
		var current_right= selection_box.width- kernel.processing.current.left;
		var current_bottom=selection_box.height-kernel.processing.current.top;
		if(condition){
			if(kernel.processing.max.top > kernel.processing.current.top){
				kernel.processing.max.top=kernel.processing.current.top;
			}
			if(kernel.processing.max.left > kernel.processing.current.left){
				kernel.processing.max.left=kernel.processing.current.left;
			}
			if(kernel.processing.max.right > current_right){
				kernel.processing.max.right=current_right;
			}
			if(kernel.processing.max.bottom > current_bottom){
				kernel.processing.max.bottom=current_bottom;
			}
		}
		else{
			transparency_data.data[l+0]=255;																			//TODO: try to remove
			transparency_data.data[l+1]=255;																			//TODO: try to remove
			transparency_data.data[l+2]=255;																			//TODO: try to remove
			transparency_data.data[l+3]=0;
		}
	}
	kernel.processing.max.left--;
	if(kernel.processing.current.letter.self === ' '){
		kernel.processing.max.top=0;
		kernel.processing.max.right=0;
		kernel.processing.max.bottom=0;
		kernel.processing.max.left=0;
		canvas.tmp.context.fillStyle='rgba(255, 255, 255, 0)';
		canvas.tmp.context.fillRect(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	}
	id('tmp_canvas').width=selection_box.size.current;
	id('tmp_canvas').height=selection_box.size.current;
	canvas.tmp.context.clearRect(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	canvas.tmp.context.fillStyle='rgba(255, 255, 255, 0)';
	canvas.tmp.context.fillRect(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	canvas.tmp.context.putImageData(transparency_data, 0, 0);
	kernel.letters[kernel.processing.current.letter.self].image=transparency_data;

	canvas.letter.context.clearRect(kernel.processing.current.letter.left*selection_box.size.current,
		kernel.processing.current.letter.top*selection_box.size.current,
		selection_box.size.current, selection_box.size.current
	);

	canvas.letter.context.drawImage(id('tmp_canvas'), kernel.processing.max.left, kernel.processing.max.top,
		id('tmp_canvas').width -kernel.processing.max.right -kernel.processing.max.left,
		id('tmp_canvas').height-kernel.processing.max.bottom-kernel.processing.max.top,
		kernel.processing.current.letter.left*selection_box.size.current,
		kernel.processing.current.letter.top*selection_box.size.current,
		id('tmp_canvas').width-kernel.processing.max.right-kernel.processing.max.left,
		id('tmp_canvas').height-kernel.processing.max.bottom-kernel.processing.max.top
	);

	var current_letter_pos=kernel.processing.current.letter.top*5+kernel.processing.current.letter.left;
	canvas.letter.context.clearRect(current_letter_pos, selection_box.size.current*20, 1, 1);
	var tmp_r=selection_box.width -kernel.processing.max.right-kernel.processing.max.left;
	var tmp_g=selection_box.height-kernel.processing.max.bottom-kernel.processing.max.top;
	var tmp_b=100;
	canvas.letter.context.fillStyle='rgb('+tmp_r+', '+tmp_g+', 100)';
	canvas.letter.context.fillRect(current_letter_pos, selection_box.size.current*20, 1, 1);
	kernel.letters[kernel.processing.current.letter.self].image=transparency_data;
	kernel.processing.current.top=0;
	kernel.processing.current.left=0;
	kernel.processing.max.top=   Infinity;
	kernel.processing.max.left=  Infinity;
	kernel.processing.max.right= Infinity;
	kernel.processing.max.bottom=Infinity;
	transparency_data=0;
}

selection_box.set_color=function(set_new){
	if(set_new){
		globals.cookies.set('selection_box_color', id('selection_box_color').value, 365);
	}
	id('selection_box_color').value=globals.cookies.parse().selection_box_color;
	var color=[
		parseInt(id('selection_box_color').value.slice(1, 3), 16),
		parseInt(id('selection_box_color').value.slice(3, 5), 16),
		parseInt(id('selection_box_color').value.slice(5, 7), 16),
	];
	id('selection_box').style.border='1px solid '+id('selection_box_color').value;
	id('selection_box').style.background='rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.5)';
	id('selection_box_color').parentNode.style.background='rgb('+color[0]+', '+color[1]+', '+color[2]+')';
	id('selection_box_color_output').innerHTML=id('selection_box_color').value.toUpperCase();
}

selection_box.size.show=function(){
	selection_box.size.old=selection_box.size.current;
	selection_box.size.current=parseFloat(id('selection_box_size').value);
}

selection_box.size.set=function(){
	cls('selection_box_size_output', true)[0].innerHTML=selection_box.size.current;
	cls('selection_box_size_output', true)[1].innerHTML=selection_box.size.current;
	kernel.mobile.pointers.check_size();
	id('letter_canvas').width=  selection_box.size.current*5;
	id('letter_canvas').height=(selection_box.size.current*20)+3;
	for(var k=0; k<kernel.used_letters.length; k++){
		canvas.letter.context.putImageData(kernel.letters[kernel.used_letters[k]].image,
			kernel[used_letters[k]].left*selection_box.size.current,
			kernel[used_letters[k]].top*selection_box.size.current, 0, 0,
			selection_box.size.old, selection_box.size.old);
		canvas.letter.context.fillStyle="rgba("+kernel.letters[kernel.used_letters[k]].width+", "+
												kernel.letters[kernel.used_letters[k]].height+", 0, 0)";
		canvas.letter.context.fillRect(k, selection_box.size.current*20, 1, 1);
	}
}

selection_box.rendering[0]=function(event){
	if(kernel.language.current === 'default'){
		event.preventDefault();
		event.stopPropagation();
		setTimeout(function(){
			globals.msg('alert', localization.msgs.choose_language.title, localization.msgs.choose_language.text);
		}, 0);
		return false;
	}
	else{
		selection_box.start_x=event.clientX;
		selection_box.start_y=event.clientY;
		id('selection_box').style.display='block';
		evt.set([id('selection_box'), id('canvas')], 'mousemove', 'canvas.define_mouse_behavior(event, 1)');
		selection_box.rendering[1](event);
	}
}

selection_box.rendering[1]=function(event){
	var $canvas, $selection_box;
	$canvas=id('canvas');
	$selection_box=id('selection_box');

	event.preventDefault();
	if( event.clientX >= $canvas.getBoundingClientRect().right  ||
	    event.clientX <= $canvas.getBoundingClientRect().left   ||
	    event.clientY >= $canvas.getBoundingClientRect().bottom ||
	    event.clientY <= $canvas.getBoundingClientRect().top    ){
		return;
	}
	var w=Math.max(event.clientX, selection_box.start_x)-Math.min(event.clientX, selection_box.start_x);
	var h=Math.max(event.clientY, selection_box.start_y)-Math.min(event.clientY, selection_box.start_y);
	if(w >= selection_box.size.current){
		var w=selection_box.size.current;
	}
	if(h >= selection_box.size.current){
		var h=selection_box.size.current;
	}
	if(Math.max(event.clientX, selection_box.start_x) == event.clientX){										 // → From left to right
		$selection_box.style.left=selection_box.start_x+'px';
		$selection_box.style.right=(document.documentElement.clientWidth-selection_box.start_x+w)+'px';
	}
	else{																															 // ← From right to left
		$selection_box.style.right=(document.documentElement.clientWidth-selection_box.start_x)+'px';
		$selection_box.style.left=(selection_box.start_x-w)+'px';
	}
	if(Math.max(event.clientY, selection_box.start_y) == event.clientY){										 // ↓ From top to bottom
		$selection_box.style.top=selection_box.start_y+'px';
		$selection_box.style.bottom=(document.documentElement.clientHeight-selection_box.start_y+h)+'px';
	}
	else{																															 // ↑ From bottom to top
		$selection_box.style.bottom=(document.documentElement.clientHeight-selection_box.start_y)+'px';
		$selection_box.style.top=(selection_box.start_y-h)+'px';
	}
	$selection_box.style.width=w+'px';
	$selection_box.style.height=h+'px';

	evt.set([$canvas, $selection_box], 'mouseup', 'canvas.define_mouse_behavior(event, 2)');
	//evt.set(id('canvas'), 'mouseout', 'canvas.define_mouse_behavior(event, 2)');
}

selection_box.rendering[2]=function(event){
	event.preventDefault();
	evt.remove(id('selection_box'), 'mousemove');
	evt.remove(id('selection_box'), 'mouseup');
	id('selection_box').style.cursor='default';
	evt.set([id('selection_box'), id('canvas')], 'mousedown', 'canvas.define_mouse_behavior(event, "deny")');
	id('canvas').style.cursor='default';
	id('letter_input').style.display='block';
	id('letter_input').style.fontSize=id('letter_input').offsetHeight+'px';
	id('letter_input').focus();
}

selection_box.rendering.deny=function(){
	if(id('selection_box').style.display === 'none'){
		id('selection_box').style.width='0';
		id('selection_box').style.height='0';
		id('letter_input').style.display='none';
		selection_box.rendering[0](event);
		return;
	}
	id('selection_box').style.display='none';
	id('selection_box').style.width='0';
	id('selection_box').style.height='0';

	id('letter_input').style.display='none';
	id('letter_input').value='';
	kernel.letter_input();
	//evt.set(id('canvas), 'mousedown', 'canvas.define_mouse_behavior(event)');
}

kernel.upload=function(file){
	if(kernel.file_uploaded){
		canvas.get_color_again();
	}
	kernel.file_uploaded=true;
	if(file.length === 0){
		globals.clear_file(true, 1);
		return;
	}
	id('file_text').innerHTML=file.name;
	if(file.type.slice(0, 5) !== 'image'){
		globals.clear_file(false, 1);
		return;
	}
	images.image.src=URL.createObjectURL(file);
	images.clean_image.src=URL.createObjectURL(file);
	images.image.onload=function(){
		id('canvas').width=images.image.width;
		id('canvas').height=images.image.height;
		canvas.original_width=images.image.width;
		canvas.original_height=images.image.height;
		canvas.context.drawImage(images.image, 0, 0);
		images.image_data=         canvas.context.getImageData(0, 0, id('canvas').width, id('canvas').height);
		images.original_image_data=canvas.context.getImageData(0, 0, id('canvas').width, id('canvas').height);
		images.middle_data=canvas.context.getImageData(0, 0, id('canvas').width, id('canvas').height);
		selection_box.set_color();
	};
};

kernel.steps[0].move=function(from){
	if(kernel.file_uploaded){
		globals.msg('confirm', localization.msgs.other_file.title, localization.msgs.other_file.text, function(){
			globals.scroll_to(cls('step_1'));
			globals.clear_file(true, 1);
			globals.unloader.remove();
		});
	}
	else{
		globals.scroll_to(cls('step_1'));
	}
};

kernel.steps[1].move=function(from){
	if(from === 0){
		if(kernel.file_uploaded){globals.unloader.set();}
		var jarn_file_condition=(current_page === 'edit' && !kernel.jarn_file_uploaded);
		var image_size_condition=(images.image.width >= 1000 && images.image.height >= 1000);
		if(jarn_file_condition){
			globals.msg('confirm', localization.msgs.jarn_file_missing.title, localization.msgs.jarn_file_missing.text, function(){
				globals.scroll_to(cls('step_2'));
			});
		}
		if(image_size_condition){
			globals.msg('confirm', localization.msgs.too_big_image.title, localization.msgs.too_big_image.text, function(){
				globals.scroll_to(cls('step_2'));
			});
		}
		if(!jarn_file_condition && !image_size_condition){
			globals.scroll_to(cls('step_2'));
		}
	}
	if(from === 2){
		globals.scroll_to(cls('step_2'));
	}
};

kernel.steps[2].move=function(from){
	globals.scroll_to(cls('step_3'));
};

kernel.language.set=function(pattern){
	if(!localization.languages[pattern].disabled.dict){
		globals.file_to_text('../_scripts/dict/'+pattern+'.txt', function(){
			kernel.dict=window.frames[0].document.body.children[0].innerHTML.split('\n', 99);
			kernel.language.show_panel(pattern);
		});
	}
}

kernel.language.show_panel=function(pattern, name){
	if(pattern == 'ud'){
		kernel.language.current=name;
	}
	else{
		kernel.language.current=pattern;
	}
	id('lang_table').innerHTML='';//clean_imageing the table
	id('lang_choose_title').style.display='none';
	id('lang_panel').style.display='block';
	cls('right_panel').scrollTop=0;
	id('lang_choose').style.display='none';
	id('lang_choose_title').style.display='none';
	id('return_button').style.display='block';
	var tmp_table=id('lang_panel').innerHTML;
	id('lang_panel').innerHTML+=tmp_table;
	for(var m=0; m<100; m+=10){
		if(!kernel.dict[m]){break;}
		var tr=document.createElement('TR');
		id('lang_table').appendChild(tr);
		tr.innerHTML='<td class="letter">'+kernel.dict[m]+'</td>';
		for(var n=1; n<10; n++){
			if(!!kernel.dict[m+n]){tr.innerHTML+='<td class="letter">'+kernel.dict[m+n]+'</td>';}
		}
	}
	if(kernel.used_letters.length){
		for(var i=0; i <= table.rows.length-1; i++){
			for(var j=0; j <= table.rows[i].cells.length-1; j++){
				for(var k=0; k<=kernel.used_letters.length; k++){
					if(table.rows[i].cells[j].innerHTML == kernel.used_letters[k]){
						table.rows[i].cells[j].className='active_letter';
					}
				}
			}
		}
	}
} //Hi, Python programmers :D

kernel.language.select_again=function(){
	kernel.language.current='default';

	id('lang_panel').style.display='none';
	id('lang_choose').style.display='block';

	id('lang_choose_title').style.display='block';
	id('return_button').style.display='none';

}

kernel.letter_input=function(){
	var table=id('lang_table');
	var entered_letter;
	var box;
	var escaping='';
	if(id('letter_input').value.length){
		entered_letter=id('letter_input').value.toString();
		box={
			'top': id('selection_box').getBoundingClientRect().top,
			'left': id('selection_box').getBoundingClientRect().left,
			'width': parseFloat(id('selection_box').style.width),
			'height': parseFloat(id('selection_box').style.height),
		};
	}
	else{
		entered_letter=id('letter_input_pointers').value.toString();
		box={
			'top': parseFloat(Math.min(id('pointer_x_1').getBoundingClientRect().top, id('pointer_x_2').getBoundingClientRect().top))+15,
			'left':  parseFloat(Math.min(id('pointer_y_1').getBoundingClientRect().left, id('pointer_y_2').getBoundingClientRect().left))+15,
			'width': kernel.mobile.pointers.get_size('x'),
			'height': kernel.mobile.pointers.get_size('y'),
		};
	}
	box.right=box.left+box.width;
	box.bottom=box.top+box.height;
	selection_box.width= box.width;
	selection_box.height=box.height;
	if(!entered_letter){return;}
	switch(entered_letter){
		case '\'': entered_letter='\u0027'; escaping='\u005C'; break;
		case '\"': entered_letter='\u0022'; escaping='\u005C'; break;
		case '\\': entered_letter='\u005C'; escaping='\u005C'; break;
	}

	for(var i=0; i <= table.rows.length-1; i++){
		for(var j=0; j <= table.rows[i].cells.length-1; j++){
			if(entered_letter == table.rows[i].cells[j].innerHTML){
				kernel.processing.current.letter.self=entered_letter;
				var index=10*i+j;
				kernel.processing.current.letter.top=Math.floor(index/5);
				kernel.processing.current.letter.left=index%5;

				kernel.used_letters.push(kernel.processing.current.letter.self);
				kernel.letters[entered_letter]={
					'image': canvas.context.getImageData(box.left-id('canvas').getBoundingClientRect().left,
						box.top-id('canvas').getBoundingClientRect().top,
						box.width, box.height),
					'left': kernel.processing.current.letter.left,
					'top': kernel.processing.current.letter.top
				};
				kernel.letters[entered_letter].width=kernel.letters[entered_letter].image.width;
				kernel.letters[entered_letter].height=kernel.letters[entered_letter].image.height;
				table.rows[i].cells[j].id='cell_'+i+'_'+j;																//ID is necessary for evt.set =(
				evt.set(table.rows[i].cells[j], 'click', 'kernel.go_to_letter("'+escaping+entered_letter+'")');
				id('tmp_canvas').width= box.width;
				id('tmp_canvas').height=box.height;

				canvas.tmp.context.drawImage(id('canvas'),
					box.left-id('canvas').getBoundingClientRect().left,
					box.top-id('canvas').getBoundingClientRect().top,
					box.width,
					box.height,
					0, 0,
					box.width,
					box.height);

				table.rows[i].cells[j].classList.add('active_letter');

				id('selection_box').style.display='none';

				id('letter_input').value='';
				id('letter_input_pointers').value='';

				id('letter_input').classList.remove('invalid');
				canvas.letter.fill();
				return;
			}
		}
	}
	id('letter_input').classList.add('invalid');
}

kernel.go_to_letter=function(letter){
	if(!letter) return false;
	selection_box.width=kernel.letters[letter].width;
	selection_box.height=kernel.letters[letter].height;
	kernel.processing.current.letter.left=kernel.letters[letter].left;
	kernel.processing.current.letter.top=kernel.letters[letter].top;
	kernel.processing.current.letter.self=letter;
	canvas.tmp.context.clearRect(0, 0, id('tmp_canvas').width, id('tmp_canvas').height);
	canvas.tmp.context.putImageData(kernel.letters[letter].image, 0, 0);
	//fill_letter_canvas();
}

kernel.downloading.prepare=function(){
	if(kernel.language.current === 'default'){
		globals.msg('alert', localization.msgs.choose_language.title, localization.msgs.choose_language.text , function(){
			kernel.steps[2](1);
		}, function(){
			kernel.steps[2](1);
		});
		return;
	}

	if(kernel.used_letters.length !== kernel.dict.length){
		globals.msg('confirm', localization.msgs.list_of_letters.title, localization.msgs.list_of_letters.text, function(){
			kernel.downloading.load(event);
		}, function(){
			kernel.steps[2](1);
		});
	}
}

kernel.downloading.load=function(){
	globals.unloader.remove();
	canvas.letter.context.clearRect((selection_box.size.current*5)-1, selection_box.size.current*20, 1, 1);
	tmp_2_r='32';
	tmp_2_g='32';
	tmp_2_b='32';
	tmp_2_a='32';
	if(kernel.language.current.length >= 1){
		var tmp_2_r=kernel.language.current.charCodeAt(0);
		if(kernel.language.current.length >= 2){
			var tmp_2_g=kernel.language.current.charCodeAt(1);
			if(kernel.language.current.length >= 3){
				var tmp_2_b=kernel.language.current.charCodeAt(2);
				if(kernel.language.current.length >= 4){
					var tmp_2_a=kernel.language.current.charCodeAt(3);
				}
			}
		}
	}
	canvas.letter.context.fillStyle='rgba('+tmp_2_r+', '+tmp_2_g+', '+tmp_2_b+', '+tmp_2_a+')';
	canvas.letter.context.fillRect((selection_box.size.current*5)-1, selection_box.size.current*20, 1, 1);
	canvas.letter.context.clearRect((selection_box.size.current*5)-2, selection_box.size.current*20, 1, 1);
	canvas.letter.context.fillStyle='rgb('+canvas.r+', '+canvas.g+', '+canvas.b+')';
	canvas.letter.context.fillRect((selection_box.size.current*5)-2, selection_box.size.current*20, 1, 1);
	canvas.letter.context.clearRect(0, (selection_box.size.current*20)+1, selection_box.size.current, 2);
	canvas.letter.context.fillStyle='rgb(0, 0, 0)';
	canvas.letter.context.fillRect(0, (selection_box.size.current*20)+1, selection_box.size.current, 2);
	var download_link=document.createElement('A');
	download_link.id='download_link';
	document.body.appendChild(download_link);
	id('download_link').style.display='none';
	id('download_link').setAttribute('download', '['+kernel.language.current.toUpperCase()+'] Jarn file.png');
	id('download_link').setAttribute('href', id('letter_canvas').toDataURL('image/png'));
	id('download_link').click();
	id('download_link').outerHTML='';
};

kernel.mobile.pointers.move[0]=function(event, el){
	var number='second';
	if(el.getAttribute('id') === 'pointer_x_1' || el.getAttribute('id') === 'pointer_y_1'){
		number='first';
	}
	if(el.classList.contains('x_pointer')){
		kernel.mobile.pointers.x[number].mouse_start_y=event.clientY || event.touches[0].clientY;
		kernel.mobile.pointers.x[number].start_y=parseFloat(el.style.top);
		//Todo: передавати в [1] fake_event з clientY з touches
	}
	else{
		kernel.mobile.pointers.y[number].mouse_start_x=event.clientX || event.touches[0].clientX;
		kernel.mobile.pointers.y[number].start_x=parseFloat(el.style.left);
	}
	evt.set(document.body, ['mousemove', 'touchmove'], 'kernel.mobile.pointers.move[1](event, "'+el.getAttribute('id')+'", "'+number+'")');
	evt.set(document.body, ['mouseup', 'touchend', 'touchcancel'], 'kernel.mobile.pointers.move[2]("'+el.getAttribute('id')+'", "'+number+'")');
};

kernel.mobile.pointers.move[1]=function(event, elem, number){
	event.preventDefault();
	var el=id(elem);
	var client={
		'x': event.clientX || event.touches[0].clientX,
		'y': event.clientY || event.touches[0].clientY,
	}
	if(el.classList.contains('x_pointer')){
		var coords=kernel.mobile.pointers.x[number].start_y+(client.y-kernel.mobile.pointers.x[number].mouse_start_y);
		if(coords >= globals.coords(id('canvas_parent')).top-globals.coords(cls('step_2')).top-15 &&
		   coords <= globals.coords(id('canvas_parent')).bottom-globals.coords(cls('step_2')).top-15){
			el.style.top=coords+'px';
			var output_el=1;
			if(number === 'second'){
				output_el=2;
			}
			id('coords_'+output_el+'_y').value=kernel.mobile.pointers.get_coords(el);
			if(canvas.get_color_completed){
				kernel.mobile.pointers.check_size();
			}
		}
		else{return;}
	}
	else{
		var coords=(kernel.mobile.pointers.y[number].start_x+(client.x-kernel.mobile.pointers.y[number].mouse_start_x))+1;
		if(coords >= globals.coords(id('canvas_parent')).left-globals.coords(cls('step_2')).left-15 &&
		   coords <= globals.coords(id('canvas_parent')).right-globals.coords(cls('step_2')).left-15){
			el.style.left=coords+'px';
			var output_el=1;
			if(number === 'second'){
				output_el=2;
			}
			id('coords_'+output_el+'_x').value=kernel.mobile.pointers.get_coords(el);
			if(canvas.get_color_completed){
				kernel.mobile.pointers.check_size();
			}
		}
		else{return;}
	}
};

kernel.mobile.pointers.move[2]=function(elem, number){
	var el=id(elem);
	evt.remove(document.body, ['mousemove', 'touchmove']);
	evt.remove(document.body, ['mouseup', 'touchend', 'touchcancel']);
	if(el.classList.contains('x_pointer')){
		kernel.mobile.pointers.x[number].start_y=0;
		kernel.mobile.pointers.x[number].mouse_start_y=0;
	}
	else{
		kernel.mobile.pointers.y[number].start_x=0;
		kernel.mobile.pointers.y[number].mouse_start_x=0;
	}
};

kernel.mobile.pointers.confirm=function(){
	if(!canvas.get_color_completed){
		var fake_event={
			'layerX': parseFloat(id('coords_1_x').value) || 0,
			'layerY': parseFloat(id('coords_1_y').value) || 0,
			'preventDefault': function(){return null;}
		};
		canvas.get_color(fake_event);
	}
	else{
		if(kernel.language.current === 'default'){
			globals.msg('alert', localization.msgs.choose_language.title, localization.msgs.choose_language.text);
		}
		else{
			if(id('letter_input_pointers').value === ''){
				id('letter_input_pointers').classList.add('invalid');
				return;
			}
			else{
				id('letter_input_pointers').classList.remove('invalid');
			}
			if(!id('pointers_result_width' ).classList.contains('invalid') &&
			   !id('pointers_result_height').classList.contains('invalid') &&
			   canvas.get_color_completed){
				kernel.letter_input();
			}
		}
	}
};

kernel.mobile.pointers.set=function(el){
	var number=el.getAttribute('id').slice(-3, -2);
	var coord=el.getAttribute('id').slice(-1);
	if(coord === 'x'){
		var coords=(id('canvas_parent').getBoundingClientRect().left-cls('step_2').getBoundingClientRect().left+parseFloat(el.value)-15);
		if(parseFloat(el.value) >= 0 && parseFloat(el.value) <= id('canvas_parent').offsetWidth){
			id('pointer_y_'+number).style.left=coords+'px';
		}
	}
	else{
		var coords=(id('canvas_parent').getBoundingClientRect().top-cls('step_2').getBoundingClientRect().top+parseFloat(el.value)-15);
		if(parseFloat(el.value) >= 0 && parseFloat(el.value) <= id('canvas_parent').offsetHeight){
			id('pointer_x_'+number).style.top=coords+'px';
		}
	}
};

kernel.mobile.pointers.get_size=function(param){//Param: 'x' || 'y'
	return Math.abs(parseFloat(id('coords_1_'+param).value)-parseFloat(id('coords_2_'+param).value));
};

kernel.mobile.pointers.check_size=function(){
	var width=kernel.mobile.pointers.get_size('x');
	var height=kernel.mobile.pointers.get_size('y');
	id('pointers_result_width').innerHTML=width;
	id('pointers_result_height').innerHTML=height;

	if(width > selection_box.size.current) id('pointers_result_width').classList.add('invalid');
	else id('pointers_result_width').classList.remove('invalid');

	if(height > selection_box.size.current) id('pointers_result_height').classList.add('invalid');
	else id('pointers_result_height').classList.remove('invalid');
};

kernel.mobile.pointers.get_coords=function(el){
	var coord=el.getAttribute('id').slice(-3, -2);
	if(coord === 'x'){
		return (el.getBoundingClientRect().top-id('canvas').getBoundingClientRect().top+15).toFixed(0);
	}
	else{
		return (el.getBoundingClientRect().left-id('canvas').getBoundingClientRect().left+15).toFixed(0);
	}
};

kernel.mobile.pointers.initialization=function(){
	if(id('set_pointers_input_method').checked){
		var display='block';
		kernel.input_method='pointers';
		id('confirm_points').style.display='block';
		cls('panel_hint').style.display='none';
	}
	else{
		var display='none';
		kernel.input_method='classic';
		id('confirm_points').style.display='none';
		cls('panel_hint').style.display='block';
	}
	var iterations;
	if(canvas.get_color_completed){
		iterations=2;
		id('pointers_result_width').innerHTML='0';
		id('pointers_result_height').innerHTML='0';
		id('coords_1_x').value='15';
		id('coords_1_y').value='15';
		id('coords_2_x').value='15';
		id('coords_2_y').value='15';
		id('points_confirm').classList.add('result');
		id('max_selection_box_size').style.display='inline';
		id('coords_2').style.display='block';
		cls('divider', true)[0].style.display='block';
		cls('divider', true)[1].style.display='block';
		id('letter_input_pointers').style.display='inline';
	}
	else{
		id('points_confirm').classList.remove('result');
		id('max_selection_box_size').style.display='none';
		id('coords_2').style.display='none';
		id('letter_input_pointers').style.display='none';
		cls('divider', true)[0].style.display='none';
		iterations=1;
	}
	for(var i=1; i<=iterations; i++){
		id('pointer_x_'+i).style.display=display;
		id('pointer_x_'+i).style.width=(id('canvas_parent').offsetWidth+45)+'px';
		id('pointer_x_'+i).style.top=(globals.coords(id('canvas_parent')).top-globals.coords(cls('step_2')).top)+'px';
		id('pointer_x_'+i).style.left=(id('canvas_parent').offsetLeft-45)+'px';

		id('pointer_y_'+i).style.display=display;
		id('pointer_y_'+i).style.height=(id('canvas_parent').offsetHeight+45)+'px';
		id('pointer_y_'+i).style.top=(globals.coords(id('canvas_parent')).top-globals.coords(cls('step_2')).top-45)+'px';
		id('pointer_y_'+i).style.left=(id('canvas_parent').offsetLeft)+'px';
	}
};

kernel.initialization=function(){
	selection_box.set_color();
	kernel.mobile.pointers.initialization();
	id('letter_canvas').width=  selection_box.size.current*5;
	id('letter_canvas').height=(selection_box.size.current*20)+3;
	var td=false;
	var panel_inner='<table><tr>';
	for(var i in localization.languages){
		panel_inner+='<td class="'+(localization.languages[i].disabled.dict?'disabled_lang':'')+'" onclick="kernel.language.set(\''+i+'\')"><img class="lang_img" src="../_images/flags/'+i+'.png" id="lang_'+i+'" alt="'+localization.languages[i].name+'">'+
		'<span class="lang_name">'+localization.languages[i].name+'</span></td>';
		if(td){
			panel_inner+='</tr><tr>';
		}
		td=!td;
	}
	panel_inner+='</tr></table>';

	id('lang_choose').innerHTML=panel_inner+id('lang_choose').innerHTML;

	evt.set([id('tmp_canvas_wrapper'), id('lang_choose'), cls('panel_left')], 'mouseover', 'globals.scrolling_block(true)');
	evt.set([id('lang_choose'), id('tmp_canvas_wrapper'), cls('panel_left')], 'mouseout', 'globals.scrolling_block(false)');

	for(var i in localization.languages){
		evt.set(id('lang_'+i), 'click', 'kernel.language.set("'+i+'")');
	}

	if(screen.height < 768){
		cls('panel_hint').style.display='none';
	}

	id('file').setAttribute('onchange', 'kernel.upload(files[0])');

	evt.set(id('b_to_home'),'click', 'globals.goto("../")');
	evt.set(id('f_to_1'), 'click', 'kernel.steps[1].move(0)');
	evt.set(id('letter_input'), 'input', 'kernel.letter_input()');
	evt.set(id('canvas'), 'contextmenu', 'canvas.define_mouse_behavior(event, "get_color")');
	evt.set(id('canvas'), ['mousedown', 'touchstart'], 'canvas.define_mouse_behavior(event, 0)');
	evt.set(id('multiplier'), ['change', 'input'], 'canvas.check_blur(true)');
	evt.set(id('canvas_size'), 'change', 'canvas.resizing.resize(false)');
	evt.set(id('canvas_size'), 'input', 'canvas.resizing.resize(true)');
	evt.set(id('selection_box_size'), 'change', 'selection_box.size.set()');
	evt.set(id('selection_box_size'), 'input', 'selection_box.size.show()');
	evt.set(id('selection_box_color'), 'change', 'selection_box.set_color(true)');
	evt.set(id('return_button'), 'click', 'kernel.language.select_again()');
	evt.set(cls('choose_color_again'), 'click', 'canvas.get_color_again()');
	evt.set(id('tmp_canvas'), 'mousedown', 'canvas.tmp.walking[0](event)');
	evt.set(id('tmp_canvas_move'), 'click', 'canvas.tmp.set_cursor("Default")');
	evt.set(id('tmp_canvas_pencil'), 'click', 'canvas.tmp.set_cursor("Pencil")');
	evt.set(id('tmp_canvas_eraser'), 'click', 'canvas.tmp.set_cursor("Eraser")');
	evt.set(id('b_to_0'), 'click', 'kernel.steps[0].move(1)');
	evt.set(id('b_to_1'), 'click', 'kernel.steps[1].move(2)');
	evt.set(id('f_to_2'), 'click', 'kernel.steps[2].move(1)');
	evt.set(id('f_to_3'), 'click', 'kernel.downloading.prepare()');
	evt.set(id('canvas_parent'), 'contextmenu', 'event.preventDefault(); event.stopPropagation(); return false;');
	evt.set([id('set_classic_input_method'), id('set_pointers_input_method')], 'change', 'kernel.mobile.pointers.initialization()');
	evt.set([id('pointer_x_1'), id('pointer_x_2'), id('pointer_y_1'), id('pointer_y_2')], ['mousedown', 'touchstart'], 'kernel.mobile.pointers.move[0](event, this)');
	evt.set(id('points_confirm'), 'click', 'kernel.mobile.pointers.confirm()');
	evt.set([id('coords_1_x'), id('coords_1_y'), id('coords_2_x'), id('coords_2_y')], 'input', 'kernel.mobile.pointers.set(this)');
}

/* </magic> */
