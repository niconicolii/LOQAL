"use strict"
// current user is global
let user;

const singleProfile = document.querySelector('#single_profile');
const allUsers = document.querySelector('#all_users');
const noUser = document.querySelector('#no_user');
singleProfile.style.display = 'none';
noUser.style.display = 'none';

for(const user of users){
	const user_table = document.createElement("table");
	user_table.className = 'profiles';
	user_table.id = 'profiles';

	const username_row = document.createElement("tr");
	username_row.innerHTML = "<td class='info'><strong>Username</strong></td><td>" + user.username + "</td>";
	user_table.appendChild(username_row);

	const disname_row = document.createElement("tr");
	disname_row.innerHTML = "<td class='info'><strong>Display name</strong></td><td>" + user.display_name + "</td>";
	user_table.appendChild(disname_row);

	const photo_row = document.createElement("tr");
	photo_row.innerHTML = "<td class='info'><strong>Photo</strong></td><td><img class='prof_pic' src='" + user.photo_src + "'></td>";
	user_table.appendChild(photo_row);

	allUsers.appendChild(user_table);
}


const searchUserForm = document.querySelector('#searchUserForm');
searchUserForm.addEventListener('submit', search_user);

function search_user(e) {
	e.preventDefault();
	const keyword = searchUserForm.elements['keyword'].value;
	let u;
	if (keyword === ''){
		singleProfile.style.display ='none';
		noUser.style.display ='none';
		allUsers.style.display = 'inline';
		return;
	}
	let found_user = false;
	for(u of users){
		if(u.username === keyword || u.email === keyword){
			user = u;
			load_user_profile(user);
			found_user = true;
			break;
		}
	}
	if(found_user === false){
		singleProfile.style.display ='none';
		allUsers.style.display ='none';
		noUser.style.display = 'inline';
	}
}

function load_user_profile(user){
	singleProfile.style.display ='inline';
	allUsers.style.display = 'none';
	noUser.style.display = 'none';
	document.querySelector('#in_username').value = user.username;
	document.querySelector('#in_email').value = user.email;
	document.querySelector('#in_disname').value = user.display_name;
	document.querySelector('#in_password').value = user.password;

	// display multiple tags
	const tag_cell = document.getElementById("tags");
	tag_cell.innerHTML = '';
	const user_tags = [];
	for (const tag_index of user.tag_list){
		user_tags.push(tags[tag_index]);
	}
	// making adding tag options
	let html_tag = '';
	for(const curr_tag of user_tags){
		html_tag += '<select class="html_tag">';
		for(const tag_elem of tags){
			if(curr_tag.id == tag_elem.id){
				html_tag += "<option value="+tag_elem.id+" selected>"+tag_elem.name +"</option>";	
			}else{
				html_tag += "<option value="+tag_elem.id+">"+tag_elem.name +"</option>";	
			}
		}
		html_tag += "<option value=-1>remove</option>";
		html_tag += '</select>';
	}
	tag_cell.innerHTML = "<input type='submit' value='Add Tag' onclick='add_tag()'>";
	tag_cell.innerHTML += html_tag;

	// display picture
	document.querySelector('#photo').innerHTML = "<img  class='prof_pic'  src='" + user.photo_src + "'>";

	// show if flagged user
	let flag_html;
	if (user.is_flagged){
		flag_html = "<select id='flag_select'><option value='is_flagged'>Flagged</option><option value='not_flagged'>Normal</option></select>";
	}else{
		flag_html = "<select id='flag_select'><option value='not_flagged'>Normal</option><option value='is_flagged'>Flagged</option></select>";
	}
	document.querySelector('#status').innerHTML = flag_html;

	// show if user if admin
	let admin_html;
	if (user.is_admin){
		admin_html = "<select id='admin_select'><option value='is_admin'>Admin</option><option value='not_admin'>Regular User</option></select>";
	}else{
		admin_html = "<select id='admin_select'><option value='not_admin'>Regular User</option><option value='is_admin'>Admin</option></select>";
	}
	document.querySelector('#account_type').innerHTML = admin_html;
}


const editForm = document.querySelector("#editForm");
editForm.addEventListener('submit', save_all);


function save_all(e){
	e.preventDefault();
	
	user.username = document.querySelector("#in_username").value;
	console.log(document.querySelector("#in_username").value);
	user.email = document.querySelector("#in_email").value;
	user.display_name = document.querySelector("#in_disname").value;
	user.password = document.querySelector("#in_password").value;
	// save tags
	const tags = document.querySelectorAll(".html_tag");
	const tag_ids = [];
	for (const tag of tags){
		if (tag.value != -1){
			tag_ids.push(tag.value);
		}else{
			tag.parentElement.removeChild(tag);
		}
	}
	user.tag_list = tag_ids;
	// save status
	if (document.querySelector("#flag_select").value === 'is_flagged'){
		user.is_flagged = true;
	}else{
		user.is_flagged = false;
	}

	// save status
	if (document.querySelector("#admin_select").value === 'is_admin'){
		user.is_admin = true;
	}else{
		user.is_admin = false;
	}
}





// const profileTable = document.querySelector('#profileTable');
// profileTable.addEventListener('click', table_clicked);


// function table_clicked(e){
// 	e.preventDefault();
// 	if(e.target.classList.contains('flag_user')){
// 		flag_user(e);
// 	}else if (e.target.classList.contains('make_admin')){
// 		make_admin(e);
// 	}else if(e.target.classList.contains('edit')){
// 		to_edit_form(e);
// 	}else if(e.target.classList.contains('save')){
// 		update_info(e);
// 	}else if(e.target.classList.contains('edit_tag_on')){
// 		edit_tag(e);
// 	}else if(e.target.classList.contains('save_tag_on')){
// 		save_tag(e);
// 	}else{
// 		return;
// 	}
// }

// function flag_user(e){
// 	if (!user.is_flagged){
// 		user.is_flagged = true;
// 		document.querySelector('#status').innerHTML = "Flagged";
// 		document.querySelector('#edit_status').innerHTML = "<button class='flag_user'>Unflag</button>";
// 	} else{
// 		user.is_flagged = false;
// 		document.querySelector('#status').innerHTML = "Normal";
// 		document.querySelector('#edit_status').innerHTML = "<button class='flag_user'>Flag</button>";
// 	}
// }

// function make_admin(e){
// 	if (!user.is_admin){
// 		user.is_admin = true;
// 		document.querySelector('#account_type').innerHTML = "Admin";
// 		document.querySelector('#edit_type').innerHTML = "<button class='make_admin'>Remove Admin</button>";
// 	} else{
// 		user.is_admin = false;
// 		document.querySelector('#account_type').innerHTML = "Regular user";
// 		document.querySelector('#edit_type').innerHTML = "<button class='make_admin'>Make Admin</button>";
// 	}
// }


// function to_edit_form(e){
// 	e.preventDefault();
// 	// change cell to edit form
// 	e.target.parentElement.innerHTML = "<form id='editForm'><input id='new_info' type='text'><input class='save' type='submit' value='save'></form>";
// }

// function edit_tag(e){
// 	e.preventDefault();
// 	const tag_cell = document.getElementById("tags");
// 	tag_cell.innerHTML = '';

// 	const user_tags = [];
// 	for (const tag_index of user.tag_list){
// 		user_tags.push(tags[tag_index]);
// 	}
// 	// making adding tag options
// 	let html_tag = '';
// 	for(const curr_tag of user_tags){
// 		html_tag += '<select class="html_tag">';
// 		for(const tag_elem of tags){
// 			if(curr_tag.id == tag_elem.id){
// 				html_tag += "<option value="+tag_elem.id+" selected>"+tag_elem.name +"</option>";	
// 			}else{
// 				html_tag += "<option value="+tag_elem.id+">"+tag_elem.name +"</option>";	
// 			}
// 		}
// 		html_tag += "<option value=-1>remove</option>";
// 		html_tag += '</select>';
// 		// html_tag += "<div class='deleteMe'>x";
// 		// html_tag += '<div>';
// 	}
// 	tag_cell.innerHTML = "<input type='submit' value='Add Tag' onclick='add_tag()'>";
// 	tag_cell.innerHTML += html_tag;
// 	e.target.parentElement.innerHTML = "<input type='submit' class='save_tag_on' value='save'>";
// }
function add_tag(){
	const tag_cell = document.getElementById("tags");
	let html_tag = '<select class="html_tag">';
	for(const tag_elem of tags){
		html_tag += "<option value="+tag_elem.id+">"+tag_elem.name +"</option>";	
	}
	html_tag += "<option value=-1>remove</option>";
	html_tag += '</select>';
	tag_cell.innerHTML += html_tag;
}

// // $(".deleteMe").on("click", function(){
// // 	console.log("remove");
// //    $(this).remove(); 
// // });

// function save_tag(e){
// 	//document.getElementById("tag_row"+no).innerHTML='';
// 	const tag_cell = document.getElementById("tags");
// 	const tag_text = [];
// 	const tag_id = [];
// 	let i = 1;
// 	while(i < tag_cell.childElementCount){
// 		if(tag_cell.children[i].value != -1){
// 			tag_id.push(tag_cell.children[i].value);
// 			tag_text.push(tag_cell.children[i].options[tag_cell.children[i].selectedIndex].text);
// 		}
// 		i++;
// 	}
// 	tag_cell.innerHTML=tag_text;
// 	user.tag_list = tag_id;
// 	e.target.parentElement.innerHTML = "<input type='submit' class='edit_tag_on' value='edit'>";
// }


// profileTable.addEventListener('submit', update_info);

// function update_info(e){
// 	e.preventDefault();
// 	const type = e.target.parentElement.parentElement.parentElement.children[0].children[0].innerHTML;
// 	const update_loc = e.target.parentElement.parentElement.parentElement.children[1];
// 	const new_info = e.target.parentElement.elements['new_info'].value;
// 	switch(type) {
// 	  case 'Username':
// 	    user.username = new_info;
// 	    update_loc.innerHTML = new_info;
// 	    break;
// 	  case 'Email':
// 	    user.email = new_info;
// 	    update_loc.innerHTML = new_info;
// 	    break;
// 	  case 'Display name':
// 	    user.display_name = new_info;
// 	    update_loc.innerHTML = new_info;
// 	    break;
// 	  case 'Password':
// 	    user.password = new_info;
// 	    update_loc.innerHTML = new_info;
// 	    break;
// 	  case 'Tags':
// 	  	let added = false;
// 	  	for (const tag in tags){
// 	  		if(new_info === tag.name){
// 				user.tag_list.push(tag.id);
// 				added = true;
// 				break;
// 			}
// 	  	}
// 	  	if(!added){
// 	  		const t = new Tag(true, new_info);
// 	  		tags.push(t);
// 	  		user.tag_list.push(t.id);
// 	  	}
// 	  	const tag_names = [];
// 		for (const tag_index of user.tag_list){
// 			tag_names.push(tags[tag_index].name);
// 		}
// 	  	update_loc.innerHTML = tag_names;
// 	    break;
// 	}
// 	// make cell back to button form
// 	e.target.parentElement.innerHTML = "<button class='edit'>edit</button>";
// }
