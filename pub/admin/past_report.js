"use strict"

const rep_users = document.querySelector("#rep_users");
const rep_ques = document.querySelector("#rep_questions");
const rep_ans = document.querySelector("#rep_answers");
let admin_user = null;

checkAdminUser().then((res) => {
	if (res){
		show_reports();
		admin_user = res._id;
	}
})
.catch((error) => {
	console.log(error);
})


function show_reports(){
	const report_url = '/reports';
	const report_request = new Request(report_url, {
		method: 'get',
		headers: {
			'Accept': 'application/json, text/plain, */*',
		}
	});
	fetch(report_request)
	.then(res => {
		if(res.status === 200){
			return res.json();
		}else{
			alert('could not get reports');
		}
	})
	.then(data => {
		render_reports(data);
	})
	.catch((error) => {
		console.log(error)
	});
}


function render_reports(reports){
	
	let rep_u_count = 0;
	let rep_q_count = 0;
	let rep_a_count = 0;

	for (const report of reports){
		if (!report.isReviewed){
			continue;
		}
		const div = document.createElement("div");
		div.className = 'lrDiv';
		const left = document.createElement("div");
		left.className = 'leftDiv';
		const right = document.createElement("div");
		right.className = 'rightDiv';
		div.appendChild(left);
		div.appendChild(right);

		let type_output;
		let html_name;
		
		right.innerHTML = "<p></p>";
		const button = document.createElement("button");
		if(report.type === 'u'){
			rep_u_count++;
			getUserInfo(report.targetId,data=>{
				type_output = "User"; 
				html_name = "/profile?user_id=" + report.targetId;
				left.innerHTML = "<p>Reported: <strong>" + data.username + "</strong></p>";
				rep_users.appendChild(div);

				button.setAttribute("onclick", " location.href='" + html_name + "' ");
				button.innerHTML = "View " + type_output;
				right.children[0].appendChild(button);
				right.innerHTML += `<p><button class='urem'>Remove Report</button></p>`;

				let urem = document.querySelectorAll(".urem");
				
				let rem_button = urem[urem.length-1];
				rem_button.addEventListener('click', remove_report);
				rem_button.myParam = ['u',report._id,report.targetId];
				getUserInfo(report.user,data=>{
					left.innerHTML += "<p>Reported by: " + data.username + "</p>";
					left.innerHTML += "<p>Reason: " + report.reason + "</p>";
					left.innerHTML += "<p>Report ID:<strong>"+report._id+"</strong></p>"
					left.innerHTML += "<p class='report_time'>Reported at:  " + readableDate(report.time) + "</p>";
				});
			});
		}else if(report.type === 'q'){
			rep_q_count++;
			getQuestionInfo(report.targetId,data=>{
				left.innerHTML = "<p>Reported: <strong>" + data.question.title + "</strong></p>";
				type_output = "Question"; 
				html_name = "/answer?question_id=" + report.targetId;
				rep_ques.appendChild(div);

				button.setAttribute("onclick", " location.href='" + html_name + "' ");
				button.innerHTML = "View " + type_output;
				right.children[0].appendChild(button);
				right.innerHTML += `<p><button class='qrem'>Remove Report</button></p>`;

				let qrem = document.querySelectorAll(".qrem");

				let rem_button = qrem[qrem.length-1];
				rem_button.addEventListener('click', remove_report);
				rem_button.myParam = ['q',report._id,report.targetId];
				getUserInfo(report.user,data=>{
					left.innerHTML += "<p>Reported by: " + data.username + "</p>";
					left.innerHTML += "<p>Reason: " + report.reason + "</p>";
					left.innerHTML += "<p>Report ID:<strong>"+report._id+"</strong></p>"
					left.innerHTML += "<p class='report_time'>Reported at:  " + readableDate(report.time) + "</p>";
				});
			});
		}else if(report.type === 'a'){
			rep_a_count++;
			getAnswerInfo(report.targetId,data=>{
				type_output = "Answer";
				html_name = `/answer?question_id=${data.question._id}#${report.targetId}`;
				left.innerHTML = "<p>Reported: <strong>" + data.answer.content + "</strong></p>";
				rep_ans.appendChild(div);

				button.setAttribute("onclick", " location.href='" + html_name + "' ");
				button.innerHTML = "View " + type_output;
				right.children[0].appendChild(button);
				right.innerHTML += `<p><button class='arem'>Remove Report</button></p>`;

				let arem = document.querySelectorAll(".arem");

				let rem_button = arem[arem.length-1];
				rem_button.addEventListener('click', remove_report);
				rem_button.myParam = ['a',report._id,report.targetId];
				getUserInfo(report.user,data=>{
					left.innerHTML += "<p>Reported by: " + data.username + "</p>";
					left.innerHTML += "<p>Reason: " + report.reason + "</p>";
					left.innerHTML += "<p>Report ID:<strong>"+report._id+"</strong></p>"
					left.innerHTML += "<p class='report_time'>Reported at:  " + readableDate(report.time) + "</p>";
				});
			});
		}
	}
	if (rep_u_count === 0){
		const div = document.createElement("div");
		div.className = 'lrDiv';
		rep_users.appendChild(div);
	}
	if (rep_q_count === 0){
		const div = document.createElement("div");
		div.className = 'lrDiv';
		rep_ques.appendChild(div);
	}
	if (rep_a_count === 0){
		const div = document.createElement("div");
		div.className = 'lrDiv';
		rep_ans.appendChild(div);
	}
}


function remove_report(e){
	const para = e.currentTarget.myParam;
	const report_id = para[1];


	const url = '/reports/' + report_id;

	const request = new Request(url, {
		method: 'delete',
		headers: {
			'Accept': 'application/json, text/plain, */*',
		}
	});
	fetch(request)
	.then()
	.catch((error) => {
		console.log(error);
	})

	const curr_lrdiv = e.target.parentElement.parentElement.parentElement;
	remove_lrdiv(curr_lrdiv,report_id);
}

function remove_lrdiv(curr_lrdiv,report_id){
	const parent = curr_lrdiv.parentElement;
	parent.removeChild(curr_lrdiv);
	if(parent.children.length === 1){
		const div = document.createElement("div");
		div.className = 'lrDiv';
		parent.appendChild(div);
	}
}

// below are my non async type functions different with shared
function getUserInfo(user_id, callBack){
	const url = '/users/' + user_id;
	const request = new Request(url, {
		method: 'get',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});
	fetch(request)
	.then((res) => {
		if (res.status === 200) {
           	// return a promise that resolves with the JSON body
           	return res.json();
       	} else {
            // alert('Could not get user.');
       	} 
	})
	.then(data => {
		if(data){
			callBack(data);
		}
		// userInfo = {
  //          	displayname: data.displayname,
  //          	username: data.username
  //       };
	})
	.catch((error) => {
		console.error(error)
	})
}


function getQuestionInfo(id, callBack){
	const url = '/questions/' + id;
	const request = new Request(url, {
		method: 'get',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});
	fetch(request)
	.then((res) => {
		if (res.status === 200) {
           // return a promise that resolves with the JSON body
           return res.json();
       	} else {
            alert('Could not get question');
       	} 
	})
	.then(data => {
		if(data){
			callBack(data);
		}
		//question = json.question;
	})
	.catch((error) => {
		console.error(error)
	})
}

function getAnswerInfo(id, callBack){
	const url = '/answers/' + id;
	const request = new Request(url, {
		method: 'get',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}
	});
	fetch(request)
	.then((res) => {
		if (res.status === 200) {
           	return res.json();
       	} else {
            // alert('Could not get user.');
       	} 
	})
	.then(data => {
		if(data){
			callBack(data);
		}
	})
	.catch((error) => {
		console.error(error)
	})
}