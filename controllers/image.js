const Clarifai = require('clarifai');

const app = new Clarifai.App({
   apiKey: process.env.CLAIRIFAI_API_KEY,
});

const handleClarifaiAPICall = (req, res) => {
   app.models
      .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
      .then(data => {
         res.json(data);
      })
      .catch(err => res.status(400).json('Error submitting URL to API'));
};

const putImage = (req, res, db) => {
   const { id } = req.body;
   db('users')
      .where('id', '=', id)
      .increment('entries', 1)
      .returning('entries')
      .then(entries => {
         res.json(entries[0]);
      })
      .catch(err => res.status(400).json('Unable to update entries count'));
};

module.exports = {
   putImage,
   handleClarifaiAPICall,
};
