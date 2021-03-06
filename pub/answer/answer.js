"use strict"

//Getting the main question from database
let myquestionid;
let currentuser;
let myquestion;

fetch('/users/current')
.then((res) => {
	if (res.status === 200) {
        // return a promise that resolves with the JSON body
        return res.json();
    } else {
        alert('Could not get user');
    } 
})
.then((json) => {
	currentuser = json;
	getQuestionByURL();

})
.catch((error) => {
	console.log(error)
})

	
// find question with given question id in URL
function getQuestionByURL() {
	const params = new URLSearchParams(window.location.search)
	const urlquestionid = params.get('question_id');

	if (urlquestionid != null){
		myquestionid = urlquestionid;
		getQuestionByID(myquestionid).then((question) => {
			myquestion = question;
			$(document).prop('title', 'Question - '+question.title);
			showQuestion();
		})
		.then((res) => {
			if(myquestion.answers.length > 0){
				showAnswers();
			}
		})
		.then((res) => {
			setOnclicks();
		})
	}
}


function showQuestion(){
	// add question title to head title
	if(myquestion.isFlagged){
		$('#ptitle').text("This question has been flagged by an Admin of LOQAL");
		$('#pdesc').text("Please contact us if you need further information");	
	}else{
		$('#ptitle').text(myquestion.title);
		$('#pdesc').text(myquestion.content);	
	}


	const url = '/tag/names';
	const data = {
		ids: myquestion.tags
	}
	const request = new Request(url, {
		method: 'post',
		body: JSON.stringify(data),
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});

	fetch(request)
	.then((res) => {
		return res.json();
	})
	.then((json) => {
		let newDiv = '';
		for(let i=0; i < json.length; i++){
			//newDiv = '<span class="tag">' + json[i] + '</span>';
			newDiv = `<a class="tag" href="/search?search_key=${json[i]}">${json[i]}</a>`;
			$('#ptags').prepend(newDiv);
		}
	})
	.catch((error) => {
		console.log(error);
	})


	getUserInfo(myquestion.user).then((quesUser) => {
		$('#pdate').html('Asked by <a href="/profile?user_id='+myquestion.user+ '">'
			+
			quesUser.displayname
			+
			" (@"
			+
			quesUser.username
			+
			")</a> - "
			+
			readableDate(myquestion.time)
		);
	})
	

	let extrabutt = "<a href='/report?type=q&target_id="+myquestionid+"&user_id="+currentuser._id+"&back_url="+window.location.href+"'>Report this question</a>";

	let is_solved = "Mark Solved";
	if(myquestion.isResolved){
		is_solved = "Mark Unsolved";
	}

	if(myquestion.isResolved){
		$('#pinfo').html("Solved");
		$('#pinfo').attr('class','green');
	}else{
		$('#pinfo').html("Unsolved");
	}

	if(currentuser._id == myquestion.user){
		extrabutt += ` <a href="/edit/question?question_id=${myquestionid}">Edit question</a> <a href="javascript:void(0);" id="solvedbutt">${is_solved}</a>`
	}


	$('#pbutts').html(extrabutt);
}

let i = 0;
async function showAnswers(){
	let answer = myquestion.answers[i];

	await getUserInfo(answer.user).then((ansUser) => {

		let report_answer_btn_url = "/report?type=a&target_id="+answer._id+"&user_id="+currentuser._id+"&back_url="+window.location.href;
		
		let bestText = ''
		if(answer.isBest){
			bestText = "id='isbest'"
		}

		let myanswertext = answer.content;
		if(answer.isFlagged){
			myanswertext = "This answer has been flagged by an Admin of LOQAL"
		}

		let oneanswer = '<div '+bestText+' class="answer"><div id="'+answer._id+'" class="answertext">'
		+ myanswertext
		+ '</div><div class="answerinfo">Answered by <a href="/profile?user_id='+answer.user+'">'
		+ ansUser.displayname + ' (@' + ansUser.username + ')</a> - ' 
		+ readableDate(answer.time)+' </div>';

		if(currentuser._id == answer.user){
			oneanswer += "<div class='answerbuttons'> <a href="+report_answer_btn_url
					  + ">Report this answer</a> <a href='/edit/answer?question_id="
					  + myquestionid + "&answer_id="+answer._id+"'>Edit Answer</a>";
		} else{
			oneanswer += "<div class='answerbuttons'> <a href="
					  + report_answer_btn_url+">Report this answer</a>";
		}

		if(currentuser._id == myquestion.user){
			oneanswer += ' <a href="javascript:void(0);" onclick="'+ `pickAsBest('${myquestionid}', '${answer._id}')` 
					  + '" class="pickbest">Pick as Best Answer</a></div></div>';
		} else{
			oneanswer += '</div></div>'
		}

		$('#answers').prepend(oneanswer);
		i++;
	})
	.catch((error) => {
		console.log(error);
	})

	if(i < myquestion.answers.length){
		showAnswers();
	}else{
		goAnchor();
	}
}

function pickAsBest(questionid, answerid){	
	const url = `/answers/best/${questionid}/${answerid}`;

	const request = new Request(url, {
		method: 'post', 
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		},
	});

	fetch(request)
	.then(function(res) {
		if (res.status === 200) {
			alert('Picked Best Answer!');
		} else {
			alert('Failed to pick the best answer!');
		}
	}).catch((error) => {
		console.log(error)
	})
}

function setOnclicks(){
	// Handling selecting best answer
	$('body').on('click', '.pickbest', function () {
		$('#isbest').removeAttr('id');
		$(this).parent().parent().attr('id', 'isbest');
	});


	// Marking question as solved or unsolved
	$("#solvedbutt").click(function(){
		
		const solvstatus = $('#pinfo').text();
		let isResolved;
		if(solvstatus === 'Solved'){
			$('#solvedbutt').text('Mark Solved');
			$('#pinfo').attr('class','red');
			$('#pinfo').text('Unsolved');
			isResolved = false;
		}else{
			$('#solvedbutt').text('Mark Unsolved');
			$('#pinfo').attr('class','green');
			$('#pinfo').text('Solved');
			isResolved = true;
		}
		//Send data to server to mark question as solved or unsolved
		userUpdateQuestion(myquestionid, myquestion.title, myquestion.content,
						   myquestion.tags, isResolved);
	});

	// A New answer is submitted
	$('#answerForm').submit(function(e) {
	    e.preventDefault();

		let hasError = false;
		$('#myans').prev().prev().text('');

	    const myanswer = $('#myans').val();

	    if (myanswer.length<1) {
			hasError = true;
			$('#myans').prev().prev().text('Your answer cannot be empty');
	    }

		if(!hasError){
			//Answer add to database 
			let newDiv = '';
			saveAnswer(myanswer,myquestionid).then((res) => {

				const report_answer_btn_url = "/report?type=a&target_id="+res._id+"&user_id="+currentuser._id+"&back_url="+window.location.href;

				newDiv = "<div class='answerbuttons'> <a href='"+ report_answer_btn_url +"'>Report this answer</a> <a href='/edit/answer?question_id="
				+ myquestionid + "&answer_id=" + res._id + "'>Edit Answer</a>";

				newDiv = "<div class='answer'><div class='answertext'>"
				+
				myanswer
				+
				"</div><div class='answerinfo'>Answered by <a href='/profile?user_id="+currentuser._id+"''>" + currentuser.displayname + " (@" + currentuser.username + ")</a>. Just now. </div>"
				+
				newDiv;

				if(currentuser._id == myquestion.user){
					newDiv += ' <a href="javascript:void(0);" onclick="'+ `pickAsBest('${myquestionid}', '${res._id}')` +'" class="pickbest">Pick as Best Answer</a></div></div>';
				} else{
					newDiv += '</div></div>'
				}
				
				$('#answers').prepend(newDiv);
				$('#myans').val("");
			})
			
		}
	});
}

async function saveAnswer(myanswer,myquestionid){
	const url = '/answers/'+myquestionid;

	let data = {
		content: myanswer
	}

	const request = new Request(url, {
		method: 'post',
		body: JSON.stringify(data),
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});

	let answer;
	await fetch(request)
	.then(function(res) {
		return res.json();
	})
	.then((json) => {
		answer = json;
	})
	.catch((error) => {
		console.log(error)
	})
	return answer;
}

function getAnchor() {
    let currentUrl = document.URL,
	urlParts   = currentUrl.split('#');
    return (urlParts.length > 1) ? urlParts[1] : null;
}

function goAnchor() {
	let element_to_scroll_to = document.getElementById(getAnchor());
	if(element_to_scroll_to){
		element_to_scroll_to.scrollIntoView({ behavior: 'smooth'});
	}
}