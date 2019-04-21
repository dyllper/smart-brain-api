const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
   client: 'pg',
   connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'Maehara77',
      database: 'smart-brain',
   },
});

const app = express();

app.use(bodyParser.json());

app.use(cors());

app.post('/signin', (req, res) => {
   const { email, password } = req.body;
   db.select('email', 'hash')
      .from('login')
      .where('email', '=', email)
      .then(data => {
         const isValid = bcrypt.compareSync(password, data[0].hash);
         if (isValid) {
            return db
               .select('*')
               .from('users')
               .where('email', '=', email)
               .then(user => {
                  res.json(user[0]);
               })
               .catch(err => {
                  res.status(400).json(
                     `Unable to find user with email: ${email}`
                  );
               });
         } else {
            res.status(400).json('Invalid Credentials');
         }
      })
      .catch(err => {
         res.status(400).json('Invalid Credentials');
      });
});

app.post('/register', (req, res) => {
   const { email, name, password } = req.body;
   const hash = bcrypt.hashSync(password);
   db.transaction(trx => {
      trx.insert({
         hash: hash,
         email: email,
      })
         .into('login')
         .returning('email')
         .then(loginEmail => {
            return trx
               .insert({
                  email: loginEmail[0],
                  name: name,
                  joined: new Date(),
               })
               .into('users')
               .returning('*')
               .then(user => {
                  res.status(201).json(user[0]);
               })
               .catch(err => {
                  res.status(400).json('Unable to register user');
               });
         })
         .then(trx.commit)
         .catch(trx.rollback);
   }).catch(err => res.status(400).json('Unable to register'));
});

app.get('/profile/:id', (req, res) => {
   const { id } = req.params;
   db.select('*')
      .from('users')
      .where({
         id: id,
      })
      .then(user => {
         if (user.length) {
            res.json(user[0]);
         } else {
            res.status(404).json(`No user with id ${id}`);
         }
      });
});

app.put('/image', (req, res) => {
   const { id } = req.body;
   db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries')
      .then(entries => {
         res.json(entries[0]);
      })
      .catch(err => res.status(400).json('Unable to update entries count'));
});

app.listen(3000, () => {
   console.log('app is running on port 3000');
});
