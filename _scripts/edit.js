'use strict';
var current_page="edit";

kernel.language.current='default';
kernel.jarn_file_uploaded=false;

/*======================*/

kernel.jarn_file_upload=function(file){
	if(file.length === 0){
		globals.clear_file(false, 2);
		return;
	}
	id("jarn_file_text").innerHTML=file.name;
	var img_2=new Image();
	img_2.src=URL.createObjectURL(file);
	img_2.onload=function(){
		if(img_2.width/5 !== (img_2.height-3)/20){
			globals.clear_file(false, 2);
			return;
		}
		id("letter_canvas").getContext("2d").drawImage(img_2, 0, 0);
		var lang_1_letter=id("letter_canvas").getContext("2d").getImageData(img_2.width-1, img_2.height-3, 1, 1).data[0].toString();
		var lang_2_letter=id("letter_canvas").getContext("2d").getImageData(img_2.width-1, img_2.height-3, 1, 1).data[1].toString();
		kernel.language.current=String.fromCharCode(lang_1_letter)+String.fromCharCode(lang_2_letter);
		globals.file_to_text('../_scripts/dict/'+kernel.language.current+'.txt', function(){
			kernel.jarn_file_uploaded=true;
			kernel.dict=window.frames[0].document.body.children[0].innerHTML.split("\n", 99);
			kernel.language.show_panel(kernel.language.current);
			for(var i=0; i<=100; i++){
				if(id("letter_canvas").getContext("2d").getImageData(i, id("letter_canvas").height-3, 1, 1).data[0] || id("letter_canvas").getContext("2d").getImageData(i, id("letter_canvas").height-3, 1, 1).data[0] !== 0 || id("letter_canvas").getContext("2d").getImageData(i, id("letter_canvas").height-3, 1, 1).data[0] !== 0){
					document.getElementsByClassName("letter")[i].classList.add("active_letter");
				}
			}
		});
	};
}
