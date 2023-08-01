# Bitespeed_Assignment

A Node.js application that provides an API for identifying and managing contact information.It allows users to submit JSON requests
containing email and phone number data, and the service will process the information to identify multiple contacts linked to single user.

**How to Use:**<br/>
- Clone the repository to your local machine.<br/>
- Install the required dependencies by running npm install.<br/>
- Set up your MySQL database and update the .env file with your database credentials.<br/>
- Start the Node.js server by running npm start.<br/>
- Access the front-end interface by opening index.html in your web browser.<br/>

**API Endpoint:**<br/>
- POST /identify: Accepts JSON requests with email and phone number. Identifies contacts and returns the information as a JSON response.
  [Link]: https://bitespeed-assignment-81r8.onrender.com

**Dependencies**
- Node.js
- Express.js
- Sequelize
- MySQL2
