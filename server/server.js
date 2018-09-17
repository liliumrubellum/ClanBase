// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
//var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
require('sqlite3').Database.prototype = require('bluebird').promisifyAll(require('sqlite3').Database.prototype)
var sqlite3 = new require('sqlite3').verbose();

const dbDir = path.resolve(__dirname, '../.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new sqlite3.Database(path.resolve(dbDir, 'clanbase.db'));

// テーブル作成
db.run('\
  CREATE TABLE IF NOT EXISTS vote ( \
    id int, \
    data text, \
    discord_id int, \
    name text, \
    active int, \
    create_date int, \
    ip text, \
    PRIMARY KEY(id) \
  )');
console.log('table is created');

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, '../public/index.html'));
});

app.post('/api/vote', function (req, res) {

  console.log('***** POST *****');
  console.log(req.body);

  let generateId = async function () {
    let id = Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
    let ret = await db.getAsync('SELECT 1 FROM vote WHERE id = ?', id);
    if (ret) {
      console.log('%d is duplex id.', id);
      id = await generateId();
    }
    return id;
  };

  let proc = async function () {

    await db.execAsync('BEGIN');
    console.log('transaction begun');

    try {
      // ID採番
      let id = await generateId();
      console.log('id is generated: %d', id);

      // データ挿入
      await db.runAsync('\
        INSERT INTO vote \
        VALUES (?, ?, ?, ?, ?, ?, ?)',
        id, JSON.stringify(req.body), -1, '', 0, Date.now(), '192.168.0.1');
      console.log('inserted');

      await db.execAsync('COMMIT');
      console.log('commited');

      return id;

    } catch (error) {
      await db.execAsync('ROLLBACK');
      console.log('rollbacked');
      throw error;
    }
  }

  proc()
    .then(id => {
      console.log('completed');
      res.status(200).send(id + '');
    })
    .catch(err => {
      console.log('error occurred');
      console.error(err);
      res.status(500).send(err);
    });
});

app.get('/api/vote', function(req, res) {

  console.log('***** GET *****');
  console.log(req.query);

  let all = req.param('all');
  let proc = async function () {

    // 取得
    let ret = all ?
      await db.allAsync('\
        SELECT * \
        FROM vote') :
      await db.allAsync('\
        SELECT name, data \
        FROM vote \
        WHERE active = 1');
    console.log('selected');

    ret.forEach(x => {
      x.data = JSON.parse(x.data);
    });
    console.log(ret);
    return ret;
  }

  proc()
    .then(data => {
      console.log('completed');
      res.status(200).send(data);
    })
    .catch(err => {
      console.log('error occurred');
      console.error(err);
      res.status(500).send(err);
    });
});

app.put('/api/vote', function(req, res) {

  console.log('***** PUT *****');
  console.log(req.body);

  // SQLite3 の named parameter は使わないものが含まれているとエラーになるっぽい
  // let params = {
  //   $vote_id = req.body.voteId,
  //   $discord_id = req.body.discordId,
  //   $name = req.body.name
  // };

  let proc = async function () {

    // 仮登録済みか確認
    let ret = await db.getAsync('\
      SELECT 1 \
      FROM vote \
      WHERE id = ?',
      req.body.voteId);

    if (!ret) {
      throw req.body.voteId + ' は無効です。';
    }

    await db.execAsync('BEGIN');
    console.log('transaction begun');

    try {
      // 同一人物の既存の投票を無効化
      await db.runAsync('\
        UPDATE vote \
        SET active = 0, \
            name = ? \
        WHERE discord_id = ?',
        req.body.name, req.body.discordId);
      console.log('deactivated');

      // 指定IDの投票を有効化
      await db.runAsync('\
        UPDATE vote \
        SET active = 1, \
            discord_id = ?, \
            name = ? \
        WHERE id = ?',
        req.body.discordId, req.body.name, req.body.voteId);
      console.log('activated');

      await db.execAsync('COMMIT');
      console.log('commited');

    } catch (error) {
      await db.execAsync('ROLLBACK');
      console.log('rollbacked');
      throw error;
    }
  }

  proc()
    .then(_ => {
      console.log('completed');
      res.status(200).send({});
    })
    .catch(err => {
      console.log('error occurred');
      console.error(err);
      res.status(500).send(err);
    });
});

app.delete('/api/vote/*', function(req, res) {

  console.log('***** DELETE *****');

  let id = req.url.replace('/api/vote/', '');
  let proc = async function () {

    // 削除
    await db.runAsync('\
      DELETE FROM vote \
      WHERE id = ?', id);
    console.log('deleted');
  }

  proc()
    .then(data => {
      console.log('completed');
      res.status(200).send({});
    })
    .catch(err => {
      console.log('error occurred');
      console.error(err);
      res.status(500).send(err);
    });
});

// listen for requests :)
var listener = app.listen(process.env.PORT | 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
