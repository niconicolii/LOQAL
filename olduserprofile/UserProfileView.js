const pageUser = users[2];
curr_user = users[0];
function getAllQeustions(user){
    for(var i=0; i<userTags.length; i++)
    {
        var currQeustion = userQeustion[i];
        var Ttable = document.getElementById('questionTable');
        var row = table.insertRow(-1);
        newTag.innerHTML=`${user}`;
    }
}

function uploadPhoto(e){
    var newP = document.getElementById('importForm');
    var newPsrc = newP.datafile.value;
}

function following(){
    var status = document.getElementById("follow");
    if (status.innerHTML === "follow") {
        curr_user.following.push(pageUser);
        pageUser.followed.push(curr_user);
        status.innerHTML = "following";
      } else 
      {
        status.innerHTML = "follow";
        curr_user.following.pop();
        pageUser.followed.pop();
      }
}
getAllTags(pageUser);
function getAllTags(user){
    var userTags = user.tag_list;
    for(var i=0; i<userTags.length; i++)
    {
        var currTag = userTags[i];
        var fit=-1;
        if(tags[currTag].is_geo==true)
        {
            fit=0;
        }
        var Ttable = document.getElementById('tagsTable');
        var row = Ttable.insertRow(-1);
        var newTag = row.insertCell(fit);   
        newTag.innerHTML=`${tags[currTag].name}`;
    }
}
listAllquestions(pageUser);
function listAllquestions(user){
    var question;
    for (question of questions)
    {
        if (question.user_id == user.user_id)
        {
            var newQ = document.getElementById("questions").innerHTML=question.is_solved();
            var newR = newQ.insertRow(-1);
            var newStatus = newR.insertCell(0);
            var newContent = newR.insertCell(1);
            newStatus.innerHTML = `${question.content}`;
            newContent.innerHTML = `${question.is_solved}`;
        }
    }
}
var shown = 0;
pageUser.follower = [users[0],users[1],users[2]];
function loadFollowInfo(e){
    var fInfo = document.getElementById("followerinfo");
    if (shown == 0){
        fInfo.style.visibility = "visible";
        shown = 1;
        var follower;
        for (follower of pageUser.follower)
        {
            var newFo = document.getElementById("followerinfotable");
            var row = newFo.insertRow(-1);
            var f = row.insertCell(0);
            f.innerHTML = `${follower.username}`;
        }
    } else{
        fInfo.style.visibility = "hidden";
        var newFo = document.getElementById("followerinfotable");
        newFo.innerHTML = `<th>Followers</th>`;
        shown = 0;
    }
}