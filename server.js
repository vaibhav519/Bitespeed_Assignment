const express = require('express');
const sequelize = require('./model/sequelize');
const bodyParser = require('body-parser');
const {identify} = require("./identifyContact")
require('dotenv').config();


const app = express();

//Middleware
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/identify', async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        const response = await identify(email, phoneNumber); 
        res.json(response);
    } catch (error) {
        
        console.error('Error identifying user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
