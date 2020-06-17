/* Ass1 Library - JS */

// global id count
let num_questions = 0;
let num_answers = 0;
let num_users = 0;
let num_tags = 0;
let num_notices = 0;


// global arrays
const users = [];
const questions = [];
const answers = [];
const tags = [];
const notices = [];


class User{
	constructor(username, email, display_name, password, 
				tag_list, is_admin, photo_src='noPhoto.jpg'){
		this.username = username;
		this.email = email;
		this.display_name = display_name;
		this.password = password;
		this.tag_list = tag_list;					// list of tag id
		this.photo_src = photo_src;
		this.is_admin = is_admin;
		this.is_flagged = false;
		// unique user id
		this.id = num_users;
		num_users++;
	}

}

class Tag{
	constructor(is_geo, tagName){
		this.is_geo = is_geo;						// it is a community tag if is_geo = false
		this.name = tagName;
		this.id = num_tags;
		num_tags++;
	}
}


class Question{
	constructor(title, content, user_id, tag_list){	
		this.title = title;
		this.content = content;
		this.user_id = user_id;
		this.tag_list = tag_list;					// list of tag id
		this.is_resolved = false;
		this.is_flagged = users[user_id].is_flagged;	// in case flagged user posting questions
		// this.answer = [];
		this.time = new Date().toLocaleTimeString();
		// unique id
		this.id = num_questions;
		num_questions++;
	}
}

class Answer{
	constructor(content, user_id, question_id, answer_id=-1){
		this.is_best = false;
		this.content = content;
		this.user_id = user_id;
		this.question_id = question_id;
		this.answer_id = answer_id;				// -1 if this is an answer to answer
		this.time = new Date().toLocaleTimeString();
		this.is_flagged = users[user_id].flagged;			// in case flagged user posting answers
		// unique id
		this.id = num_answers;
		num_answers++;
	}
}

class Notice{
	constructor(title, content, user_id){
		this.title = title;
		this.content = content;
		this.user_id = user_id;
		this.time = new Date().toLocaleTimeString();
		// unique id
		this.id = num_notices;
		num_notices++;
	}

}

// tags
tags.push(new Tag(true, 'Toronto'));
tags.push(new Tag(true, 'DT'));
tags.push(new Tag(true, 'NorthYork'));
tags.push(new Tag(false, 'student'));
tags.push(new Tag(false, 'parent'));
tags.push(new Tag(false, 'diabete'));

// users(username, email, display_name, password, tag_list, is_admin, photo_src='noPhoto.jpg')
users.push(new User('user', 'user@user.com','u1', 'user', [0,3], false));
users.push(new User('user2', 'user2@user.com', 'u2', 'user2', [1,4,5], false));
users.push(new User('admin', 'admin@admin.com', 'admin', 'admin', [0], true));


// questions and answers
questions.push(new Question('1st question title','1st qustion content', 0, [0,5]));
questions.push(new Question('2st question title','2st qustion content', 1, [1,4]));
questions.push(new Question('3st question title','3st qustion content', 1, [0,3]));
questions.push(new Question('4st question title','4st qustion content', 0, [2,3]));


// answers (content, user, question_id, answer_id=-1)
answers.push(new Answer('answer to 1st question', 1, 0));
answers.push(new Answer('answer to 1st answer in 1st quetion', 0, 0, 0));
answers.push(new Answer('answer to 2nd question', 0, 1));
answers.push(new Answer('answer to 3rd question', 0, 2));


// notice
notices.push(new Notice('notice title', 'notice content', 2))

