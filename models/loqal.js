/* Models */

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')


const TagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
	},
	count: {
		type: Number,
		default:0
	}
});

const UserSchema = new mongoose.Schema({
    displayname: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    username: {
		type: String,
		lowercase: true,
        required: true,
        unique: true,
        minlength: 1,
        trim: true
    },    
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isEmail,   // custom validator
			message: 'Not valid email'
		}
	}, 
	password: {
		type: String,
		required: true,
		minlength: 3
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    isAdmin:{
        type: Boolean,
		required: true,
		default: false
    },
    following:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    followers:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
	tags: [mongoose.Schema.Types.ObjectId],
	image_id: {
        type: String,
		default: ''
    },
    image_url: {
        type: String,
		default: ''
    }
})

//Some functions from the lecture notes
// An example of Mongoose middleware.
// This function will run immediately prior to saving the document
// in the database.
UserSchema.pre('save', function(next) {
	const user = this; // binds this to User document instance

	// checks to ensure we don't hash password more than once
	if (user.isModified('password')) {
		// generate salt and hash the password
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next()
	}
})

// A static method on the document model.
// Allows us to find a User document by comparing the hashed password
//  to a given one, for example when logging in.
UserSchema.statics.findByEmailPassword = function(email, password) {
	const User = this // binds this to the User model

	// First find the user by their email
	return User.findOne({ email: email }).then((user) => {
		if (!user) {
			return Promise.reject()  // a rejected promise
		}
		// if the user exists, make sure their password is correct
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, result) => {
				if (result) {
					resolve(user)
				} else {
					reject()
				}
			})
		})
	})
}

const NoticeSchema = new mongoose.Schema({
	title:{
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	content:{
		type: String,
		required: true,
		minlength: 1,
		maxlength: 1000,
		trim: true
	},
	time:{
		type: Date,
		default:Date.now
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	isShowing: {
		type: Boolean,
		default: true
	}
});

const AnswerSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	content: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	isFlagged: {
		type: Boolean,
	    default: false
	},
	isBest: {
		type: Boolean,
	    default: false
	},
	time: {
		type:Date, 
		default: Date.now
	},
	lastUpdated: {
		type:Date, 
		default: Date.now
	}
})


const QuestionSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	content: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	tags: {
		type: [mongoose.Schema.Types.ObjectId],
		required: true
	},
	answers: {
		type: [AnswerSchema]
		//required: true
	},
	isResolved: {
		type: Boolean,
		default: false
	    //required: true
	},
	isFlagged: {
		type: Boolean,
		default: false
	    //required: true
	},
	time: {
		type:Date, 
		default: Date.now
	},
	lastUpdated: {
		type:Date, 
		default: Date.now
	}
})

const ReportSchema = new mongoose.Schema({
    type:{
        type: String,
        required: true,
        enum: ['u', 'q', 'a']
    },
    targetId:{
    	type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason:{
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    user: { // user who is reporting
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reviewer: { // admin who is review
        type: mongoose.Schema.Types.ObjectId
        //required: true // can be not review yet
    },
    time:{
        type: Date,
        default:Date.now
    },
    isReviewed: {
        type: Boolean,
        default: false
    }
});


const User = mongoose.model('User', UserSchema)
const Tag = mongoose.model('Tag', TagSchema)
const Question = mongoose.model("Question", QuestionSchema)
const Notice = mongoose.model("Notice",NoticeSchema)
const Report = mongoose.model("Report",ReportSchema)
module.exports = { 
	User:User,
	Tag:Tag,
	Question:Question,
	Notice:Notice,
	Report:Report
}