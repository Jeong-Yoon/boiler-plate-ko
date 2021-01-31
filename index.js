// express.js - node js의 프레임워크
const express = require('express') // express를 다운받아서 사용 가능
const app = express();
const port = 5000; // 백엔드 포트


const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://jyoon:1234@boilerplate.oesgq.mongodb.net/<dbname>?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.get('/', (req, res) => res.send('Hello World'));
app.listen(port, () => console.log(`example app listen on port ${port}!`));
