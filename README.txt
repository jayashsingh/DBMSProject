Project by Taha Akhtar, Umar Malik, Rushi Amin and Jayash Singh

*NOTE: NodeJS must be installed in order to run the project.

To run our web project please follow the following steps:
1. Clone this github repository
2. Open up a windows cmd prompt, and traverse to the directory that has the cloned respository
3. While in the root of the directory, run one the following command:
  npm install
4. Staying in the root directory, run one of the following commands:
  node server.js
  nodemon server.js
5. Server will be started to port 3000, if you have something else occupying the port, go into server.js, go to LINE 785, and change 3000 to a port of your choosing
6. Once the server is started, you will see a successful server started message in the console, as well as a successful database connection message
7. If you see both of these, you are ready to go to JUTR Jobs, go to localhost:3000 (OR THE PORT YOU CHOSE).

Disclaimer: If you get an error in your console for database connection, please email jayashsingh@ontariotechu.net as we've had issues with break-ins on our database due to it being hosted on Amazon RDS. He can either add your public IP to the whitelist or temporarily unrestrict access to the database!
