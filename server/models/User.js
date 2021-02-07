const mogoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRound = 10; // 10자리 salt를 만들어서 뿌려준다.
const jwt = require('jsonwebtoken');


const userSchema = mogoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 중간에 공백이 들어가면 없애줌
        unique: 1
    },
    password: {
        type:String,
        minlength: 5
    },
    lastname: {
        type:String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

userSchema.pre('save', function( next ) { // mongoose에서 가져온 method
    var user = this;
    if(user.isModified('password')){

        // 비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) { // 에러가 나면 err을 가져오고 아니면 salt를
            if(err){
                return next(err);
            }
            // bcrypt.hash(myPlaintextPassword, salt, function(err, hash) { // myPlaintextPassword : 내가 넣어준 비밀번호
            bcrypt.hash(user.password, salt, function(err, hash) { //hash : 암호화된 비밀번호
                if(err){
                    return next(err);
                }
                // Store hash in your password DB.
                user.password = hash;
                next();
            });
        });

    } else {
        next();
    }
});

userSchema.methods.comparePassword = function(plainPassword, cb){ // cb: callback
    // plain : 1234567 암호화 : ~
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    // jsonwebtoken 이용해서 token 생성

   var token = jwt.sign(user._id.toHexString(), 'secretToken');

   user.token = token;
   user.save(function(err, user) {
       if(err) return cb(err);
       cb(null, user);
   })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    // 토큰 복호화
    jwt.verify(token, 'secretToken', function(err, decoded) {
        // 유저 아이디를 이용해서 유저를 찾은 다음 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id" : decoded, "token": token }, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mogoose.model('User', userSchema);
module.exports = { User };