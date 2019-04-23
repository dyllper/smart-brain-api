const getProfile = (req, res, db) => {
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
};

module.exports = {
   getProfile: getProfile,
};
