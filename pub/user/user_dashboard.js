"use strict"

// let pageUser = curr_user;
let backendUser = null;

$(document).ready(function() {
    $("#everyonebutt").click(function(){
        $('#everyonesection').removeClass("hideme");
        $('#tagssection').addClass("hideme");
        $('#followingsection').addClass("hideme");
    });
    
    $("#tagsbutt").click(function(){
        $('#everyonesection').addClass("hideme");
        $('#tagssection').removeClass("hideme");
        $('#followingsection').addClass("hideme");
    });
    
    $("#followingbutt").click(function(){
        $('#everyonesection').addClass("hideme");
        $('#tagssection').addClass("hideme");
        $('#followingsection').removeClass("hideme");
    });
    
});

function getCurrentUser() {
    const url = '/users/current';

    // Since this is a GET request, simply call fetch on the URL
    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
            return res.json()
       } else {
            alert('Could not get current user')
       }                
    })
    .then((json) => {  // the resolved promise with the JSON body
        backendUser = json
        //getUserTags();
        getUserTagsFilter();
        basicInfo();
        getNotice();
        getAllTagQ();
        // Unblock this to disable pagination
        //getAllQ();
        allQuestionsPagination();
        getAllFollowingQ();
    }).catch((error) => {
        console.log(error)
    })
}

getCurrentUser();

function getUserTags(){
    if(backendUser.tags.length>0){
        getTagList(backendUser.tags).then((tags) => {
            let mytags = '';
            for(let i=0; i < tags.length; i++){
                mytags+=`<span class="tag">${tags[i]}</span>`;
            }
    
            $('#mytags').html(`<h3>My Tags</h3>${mytags}`);
        })
    }
}

function getUserTagsFilter(){
    if(backendUser.tags.length>0){
        
        getTagListObjects(backendUser.tags).then((tags) => {
            let mytags = '';
            for(let i=0; i < tags.length; i++){
                //mytags+=`<span class="tag">${tags[i]}</span>`;
                mytags+=`<li><input type="checkbox" name="tagtype" value="${tags[i]._id}" checked/>${tags[i].name}</li>`;
            }
    
            $('#checkboxes').html(mytags);
        })
    }else{
        let notagDesc = `
        <div class="userheading">Newest Questions From Tags You Follow</div>
        <div id="filtersection">
            <h3>You are not following any tags yet</h3>
            <a class="sidebutton" href="/subscribe">Follow Some Tags</a>
        </div>
        <div class="listcontainter" id="tagquestionlist">								
        </div>
        `
        $('#tagssection').html(notagDesc);
    }
}

function getQBySelectedTag(){

    let selectedTags = []
    $("input:checkbox[name=tagtype]:checked").each(function(){
        selectedTags.push($(this).val());
    });

    const wanted = document.getElementById('tagquestionlist');
    wanted.innerHTML = ''

    const url = '/questions/tags';
	const data = {
		tag_ids: selectedTags
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
		json.forEach(function(q) {
            
            const numA = q.answers.length;

            let resolve ='Unresolved';
            if (q.isResolved == true)
            {
                resolve = 'Resolved';
            }

            getUserInfo(q.user).then((myUser) => {

                if (q.isFlagged){
                    // Don't show anything
                    // Modify this if you wanna show some sort of message instead
                }else{
                    wanted.innerHTML+=`<div class="shortquestion">
                <a class="squestion" href="/answer?question_id=${q._id}">${q.title}</a>
                <div class="sinfo">Asked by <a href="/profile?user_id=${q.user}">${myUser.displayname}</a> - ${readableDate(q.time)} - ${numA} Answers - ${resolve}</div>
                </div>`;
                }
            })

        });
	})
	.catch((error) => {
		console.log(error);
	})
}

// Loads left hand side information about the user
function basicInfo(){

    let userph = '/images/staticphoto.jpg'

    if(backendUser.image_url !== ''){
        userph = backendUser.image_url
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date();
    const dayName = days[d.getDay()];
    
    let myhtml = `
    <div id="dashheading">User Dashboard</div>
    <div id="dashname">Welcome back ${backendUser.displayname}<br><br>
    We hope you are having a great ${dayName}
    
    </div>
    `
    myhtml += `<div id="notification"></div>`

    myhtml += `<a class="sidebutton" href="/ask">Ask a Question</a>`

    myhtml += `<a class="sidebutton" href="/profile?user_id=${backendUser._id}">Your Profile</a>`

    if(backendUser.isAdmin){
        myhtml += `<a class="sidebutton" id="adminbutt" href="/admin/dashboard">Admin Dashboard</a>`  
    }

    $('#userinfo').prepend(myhtml);
}


// Loads the latest notification
function getNotice(){
    const url = '/notice/current';

    // Since this is a GET request, simply call fetch on the URL
    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            //console.log('No notice')
       }         
    })
    .then((json) => {
        if(json){
            let myhtml =`
            <h4>Latest Notice</h4>
            <div id="noticetitle">${json.title}</div>
            <div id="noticedesc">${json.content}</div>
            <div id="noticedate">Posted on ${readableDate(json.time)}</div>`
            $('#notification').prepend(myhtml);    
        }else{
            let myhtml =`
            <div id="noticetitle">No New Notice</div>`
            $('#notification').prepend(myhtml);
        }
    }).catch((error) => {
        //console.log(error)
    })
}

// Displays the list of all questions
function getAllQ(){
    const wanted = document.getElementById('everyonequestionlist');

    const url = '/questions';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
            return res.json()
       } else {
            //
       }                
    })
    .then((json) => {
        const user_ids = json.map(q => q.user);
        getUserList(user_ids).then((user_mapping) => {
            json.forEach(function(q) {
                const myUser = user_mapping[q.user];

                let resolve ='Unresolved';
                if (q.isResolved == true)
                {
                    resolve = 'Resolved';
                }

                const numA = q.answers.length;

                if (q.isFlagged){
                    // Don't show anything
                    // Modify this if you wanna show some sort of message instead
                }else{
                    wanted.innerHTML+=`<div class="shortquestion">
                    <a class="squestion" href="/answer?question_id=${q._id}">${q.title}</a>
                    <div class="sinfo">Asked by <a href="/profile?user_id=${q.user}">${myUser.displayname}</a> - ${readableDate(q.time)} - ${numA} Answers - ${resolve}</div>
                    </div>`;
                }

            });
        })

        
    }).catch((error) => {
        console.log(error)
    })
}

function getAllFollowingQ(){
    const wanted = document.getElementById('followquestionlist');
    
    const url = '/questions/following';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
            return res.json()
       } else {
            //
       }                
    })
    .then((json) => {
        const user_ids = json.map(q => q.user);
        getUserList(user_ids).then((user_mapping) => {
            json.forEach(function(q) {
                const myUser = user_mapping[q.user];
                const numA = q.answers.length;

                let resolve ='Unresolved';
                if (q.isResolved == true)
                {
                    resolve = 'Resolved';
                }

                if (q.isFlagged){
                    // Don't show anything
                    // Modify this if you wanna show some sort of message instead
                }else{
                    wanted.innerHTML+=`<div class="shortquestion">
                    <a class="squestion" href="/answer?question_id=${q._id}">${q.title}</a>
                    <div class="sinfo">Asked by <a href="/profile?user_id=${q.user}">${myUser.displayname}</a> - ${readableDate(q.time)} - ${numA} Answers - ${resolve}</div>
                    </div>`;
                }
            });
        })
    }).catch((error) => {
        console.log(error)
    })
}

// Displays the list of all questions which includes the tags this user follows
function getAllTagQ(){
    const wanted = document.getElementById('tagquestionlist');
    wanted.innerHTML = ''

    const url = '/questions/tags';

    const data = {
        tag_ids: backendUser.tags
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
        if (res.status === 200) {
            return res.json()
       } else {
            //
       }                
    })
    .then((json) => {
        const user_ids = json.map(q => q.user);
        getUserList(user_ids).then((user_mapping) => {
            json.forEach(function(q) {
                const myUser = user_mapping[q.user];
                
                let resolve ='Unresolved';
                if (q.isResolved == true)
                {
                    resolve = 'Resolved';
                }

                const numA = q.answers.length;

                if (q.isFlagged){
                    // Don't show anything
                    // Modify this if you wanna show some sort of message instead
                }else{
                    wanted.innerHTML+=`<div class="shortquestion">
                    <a class="squestion" href="/answer?question_id=${q._id}">${q.title}</a>
                    <div class="sinfo">Asked by <a href="/profile?user_id=${q.user}">${myUser.displayname}</a> - ${readableDate(q.time)} - ${numA} Answers - ${resolve}</div>
                    </div>`;
                }
            });
        })
    }).catch((error) => {
        console.log(error)
    })
}

/* Pagination */
// Inspired by https://stackoverflow.com/questions/25434813/simple-pagination-in-javascript

let current_page = 1;
const records_per_page = 5;

let allQuestions = null;

function allQuestionsPagination(){

    const url = '/questions';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
            return res.json()
       } else {
            //
       }                
    })
    .then((json) => {
        allQuestions = json;
        changePage(1);
    }).catch((error) => {
        console.log(error)
    })
}

function nextPagination(){
    if (current_page < numPages()) {
        current_page++;
        changePage(current_page);
    }
}

function prevPagination(){
    if (current_page > 1) {
        current_page--;
        changePage(current_page);
    }
}

function numPages()
{
    return Math.ceil(Object.keys(allQuestions).length / records_per_page);
}

function changePage(page){
    const btn_next = document.getElementById("btn_next");
    const btn_prev = document.getElementById("btn_prev");
    const listing_table = document.getElementById("everyonequestionlist");
    const page_span = document.getElementById("page");

    // Validate page
    if (page < 1) page = 1;
    if (page > numPages()) page = numPages();

    listing_table.innerHTML = "";

    const startindex = (page-1) * records_per_page;
    const endindex = Math.min(page * records_per_page, allQuestions.length);

    const questionsSliced = allQuestions.slice(startindex, endindex);

    const user_ids = questionsSliced.map(q => q.user);

    getUserList(user_ids).then((user_mapping) => {
        questionsSliced.forEach(function(q) {
            const myUser = user_mapping[q.user];

            let resolve ='Unresolved';
            if (q.isResolved == true)
            {
                resolve = 'Resolved';
            }

            const numA = q.answers.length;

            if (q.isFlagged){
                // Don't show anything
                // Modify this if you wanna show some sort of message instead
            }else{
                listing_table.innerHTML+=`<div class="shortquestion">
                <a class="squestion" href="/answer?question_id=${q._id}">${q.title}</a>
                <div class="sinfo">Asked by <a href="/profile?user_id=${q.user}">${myUser.displayname}</a> - ${readableDate(q.time)} - ${numA} Answers - ${resolve}</div>
                </div>`;
            }

        });
    })

    page_span.innerHTML = page;

    if (page == 1) {
        btn_prev.style.visibility = "hidden";
    } else {
        btn_prev.style.visibility = "visible";
    }

    if (page == numPages()) {
        btn_next.style.visibility = "hidden";
    } else {
        btn_next.style.visibility = "visible";
    }
}