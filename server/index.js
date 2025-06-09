const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = './server/db.json';

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.post('/api/posts/:id/like', (req, res) => {
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.id);
  const userId = req.body.userId;
  if (post && !post.likedBy.includes(userId)) {
    post.likes += 1;
    post.likedBy.push(userId);
    writeDB(db);
  }
  res.json(post);
});

app.post('/api/posts/:id/favorite', (req, res) => {
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.id);
  const userId = req.body.userId;
  if (post && !post.favoritedBy.includes(userId)) {
    post.favoritedBy.push(userId);
    writeDB(db);
  }
  res.json(post);
});

app.post('/api/posts/:id/repost', (req, res) => {
  const db = readDB();
  const original = db.posts.find(p => p.id === req.params.id);
  const userId = req.body.userId;
  if (original) {
    const newPost = {
      ...original,
      id: uuidv4(),
      userId,
      text: `[Repost] ${original.text}`,
      likes: 0,
      likedBy: [],
      favoritedBy: [],
      repostedBy: [],
    };
    db.posts.push(newPost);
    writeDB(db);
    res.json(newPost);
  } else {
    res.status(404).send('Post not found');
  }
});

app.post('/api/posts/:id/follow', (req, res) => {
  const db = readDB();
  const post = db.posts.find(p => p.id === req.params.id);
  const userId = req.body.userId;
  const authorId = post.userId;
  if (!db.users[authorId].followers.includes(userId)) {
    db.users[authorId].followers.push(userId);
    writeDB(db);
  }
  res.json({ success: true });
});

app.listen(3000, () => console.log('Backend running on port 3000'));
