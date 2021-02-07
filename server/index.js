// express.js - node js의 프레임워크
const express = require('express') // express를 다운받아서 사용 가능
const app = express();
const port = 5000; // 백엔드 포트
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { User } = require("./models/User");
const { auth } = require('./middleware/auth');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World'));

app.post('/api/users/register', (req, res) => {
  
  // 회원가입 시 필요한 정보들을 client에서 가져오면 그걸 데이터베이스에 넣어준다.

  const user = new User(req.body);

  user.save((err, userInfo) => { // mongodb 메소드
    if(err){
      return res.json({ success: false, err });
    }
    return res.status(200).json({
      success: true
    });
  }); 
});

app.post('/api/users/login', (req, res) => {
  // 요청된 이메일을 데이터베이스에서 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "해당 이메일에 해당하는 유저가 없습니다."
      });
    }

    // 요청한 이메일이 데이터베이스에 있다면, 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch){
        return res.json({ loginSuccess: false, message: "비밀번호가 올바르지않습니다."});
      }
      
    // 비밀번호도 맞다면 토큰 생성
    user.generateToken((err, user) => {
      if(err) return res.status(400).send(err);

      // 토큰을 쿠키에 저장
      res.cookie("x_auth", user.token)
      .status(200)
      .json({ loginSuccess:true, userId: user._id});

    });

    });
  })
});


app.get('/api/users/auth', auth ,(req,res) => {

  // 여기까지 미들웨어를 통과해 왓다는 것은 Authentication이 true라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email : req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
});

app.get('/api/users/logout', auth, (req, res) => {
  
  User.findOneAndUpdate({_id: req.user._id}, 
    { token: "" }
    , (err, user) => {
      if(err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      });
    }
  );
});

app.listen(port, () => console.log(`example app listen on port ${port}!`));


// npm install 할 떄, dev를 붙이면 local에서 개발할 때만 사용하겠다 이런 의미.