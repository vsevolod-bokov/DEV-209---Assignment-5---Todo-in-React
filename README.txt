To get the app running follow these directions.

Prequisite: you must have Node.js installed on your computer

1. Install backend dependencies (from the root folder):

   npm install

2. Install and build the React frontend (from the todo-react folder):

   cd todo-react
   npm install
   npm run build
   cd ..

3. Start the server (from the root folder):

   node backend.js

4. Open http://localhost:3000 in your browser.

Note: You only need to run "npm install" once. If you make changes to the
React app, you will need to run "npm run build" again from the todo-react folder.