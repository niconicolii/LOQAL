/* server.js */
'use strict';
const log = console.log
const path = require('path')

const express = require('express')
const app = express();

// mongoose and mongo connection
const { mongoose } = require('./db/mongoose')
mongoose.set('bufferCommands', false);
mongoose.set('useFindAndModify', false);

// body-parser: middleware for parsing HTTP JSON body into a usable object
const bodyParser = require('body-parser') 
app.use(bodyParser.json())

// express-session for managing user sessions
const session = require('express-session')
app.use(bodyParser.urlencoded({ extended: true }));

// Our own express middleware to check for 
// an active user on the session cookie (indicating a logged in user.)
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/dashboard'); // redirect to dashboard if logged in.
    } else {
        next(); // next() moves on to the route.
    }    
};

const {
	User,
	Question,
	authenticate,
	adminAuthenticate
 } = require('./routes/setups');

/*** Session handling **************************************/
// Create a session cookie
app.use(session({
    secret: 'oursecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 3600000,
        httpOnly: true
    }
}));

const users = require('./routes/users')
app.use('/users', users)

const questions = require('./routes/questions')
app.use('/questions', questions)

const answers = require('./routes/answers')
app.use('/answers', answers)

const reports = require('./routes/reports')
app.use('/reports', reports)

const tag = require('./routes/tag')
app.use('/tag', tag)

const notice = require('./routes/notice')
app.use('/notice', notice)


/*** Webpage routes below **********************************/
// Inject the sessionChecker middleware to any routes that require it.
// sessionChecker will run before the route handler and check if we are
// logged in, ensuring that we go to the dashboard if that is the case.

// The various redirects will ensure a proper flow between login and dashboard
// pages so that your users have a proper experience on the front-end.

// route for root: should redirect to login route
app.get('/', sessionChecker, (req, res) => {
	//res.redirect('/login')
	res.sendFile(path.join(__dirname, '/pub/index.html'));
})

app.get('/404', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/errorPages/404.html'));
})

app.get('/403', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/errorPages/403.html'));
})

app.get('/500', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/errorPages/500.html'));
})

// login route serves the login page
app.get('/login', sessionChecker, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/register/register.html'))
})

// dashboard route will check if the user is logged in and server
// the dashboard page
app.get('/dashboard', (req, res) => {
	if (req.session.user) {
		res.sendFile(path.join(__dirname, '/pub/user/user_dashboard.html'))
	} else {
		res.redirect('/login')
	}
})

app.get('/profile', authenticate, (req, res) => {
	const profileID = req.query.user_id;
	if(profileID){
		User.findById(profileID).then((user) => {
			if (!user) {
				res.redirect('/404')
			}else{
				res.sendFile(path.join(__dirname, '/pub/user/user_profile.html'));
			}
		})
		.catch((error) => {
			res.redirect('/500')
		})
	}else{
		res.sendFile(path.join(__dirname, '/pub/user/user_profile.html'));
	}
})

app.get('/edit/profile', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/user/edit_profile.html'));
})

app.get('/edit/password', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/user/edit_password.html'));
})

app.get('/answer', authenticate, (req, res) => {
	const questionID = req.query.question_id;
	if(questionID){
		Question.findById(questionID).then((question) => {
			if (!question) {
				res.redirect('/404')
			}else{
				res.sendFile(path.join(__dirname, '/pub/answer/answer.html'));
			}
		})
		.catch((error) => {
			res.redirect('/500')
		})
	}else{
		res.redirect('/404')
	}
})

app.get('/edit/answer', authenticate, (req, res) => {
	const questionID = req.query.question_id;
	const answerID = req.query.answer_id;
	if(!questionID || !answerID){
		res.redirect('/404')
	}else{
		Question.findById(questionID).then((question) => {
			if (!question) {
				res.redirect('/404')
			} else {
				const answer = (question.answers.filter((ans)=>ans._id == answerID))[0];
				if(answer && answer.user == req.session.user){
					res.sendFile(path.join(__dirname, '/pub/answer/edit_answer.html'));
				} else if(answer){
					res.redirect('/403')
				} else{
					res.redirect('/404')
				}
			}
		})
		.catch((error) => {
			res.redirect('/500')
		})
	}
})

app.get('/ask', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/question/question.html'));
})

app.get('/edit/question', authenticate, (req, res) => {
	const questionID = req.query.question_id;
	if(questionID){
		Question.findById(questionID).then((question) => {
			if (question && question.user == req.session.user) {
				res.sendFile(path.join(__dirname, '/pub/question/edit_question.html'));
			}else if(question){
				res.redirect('/403')
			}else{
				res.redirect('/404')
			}
		})
		.catch((error) => {
			res.redirect('/500')
		})
	}else{
		res.redirect('/404')
	}
})

app.get('/subscribe', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/register/subscribe.html'));
})

app.get('/report', authenticate, (req, res) => {
	const passedType = req.query.type;
	const passedTarget = req.query.target_id;
	const passedUser = req.query.user_id;
	if((passedUser && passedTarget) && passedType){
		res.sendFile(path.join(__dirname, '/pub/report/report.html'));
	}else{
		res.redirect('/404')
	}
})

app.get('/search', authenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/searchQuestion/search_question.html'));
})

app.get('/admin/dashboard', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/admin_dashboard.html'));
})

app.get('/admin/editquestion', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/edit_question.html'));
})

app.get('/admin/editanswer', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/edit_answer.html'));
})

app.get('/admin/edituser', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/edit_user.html'));
})

app.get('/admin/edittag', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/edit_tag.html'));
})

app.get('/admin/notice', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/notice.html'));
})

app.get('/admin/pastreport', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/past_report.html'));
})

app.get('/admin/editnotice', adminAuthenticate, (req, res) => {
	res.sendFile(path.join(__dirname, '/pub/admin/edit_notice.html'));
})

app.use(express.static(__dirname + '/pub'));

app.get('*', (req, res) => {
	res.redirect('/404')
})

/*************************************************/
// Express server listening...
const port = process.env.PORT || 5000
app.listen(port, () => {
	log(`Listening on port ${port}...`)
})