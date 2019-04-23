const handleSignin = (req, res, db, bcrypt) => {
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
};

module.exports = {
   handleSignin: handleSignin,
};
