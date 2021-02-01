// express.js - node js의 프레임워크
const express = require('express') // express를 다운받아서 사용 가능
const app = express();
const port = 5000; // 백엔드 포트
const bodyParser = require('body-parser');

const config = require('./config/key');
const { User } = require("./models/User");

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World'));

app.post('/register', (req, res) => {
  
  // 회원가입 시 필요한 정보들을 client에서 가져오면 그걸 데이터베이스에 넣어준다.

  const user = new User(req.body);

  user.save((err, doc) => { // mongodb 메소드
    if(err){
      return res.json({ success: false, err});
    }
    return res.status(200).json({
      success: true
    });
  }); 
});




app.listen(port, () => console.log(`example app listen on port ${port}!`));


// npm install 할 떄, dev를 붙이면 local에서 개발할 때만 사용하겠다 이런 의미.