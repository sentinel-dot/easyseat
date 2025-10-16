# easyseat

Init project:
1. npm init -y
2. npm install -D typescript @types/node
3. npx tsc --init


Create Database on Ubuntu
1. sudo apt install mariadb-server
2. sudo mariadb
3. create database easyseatdb
4. use easyseatdb
5. create user 'dev'@'localhost' identified by 'devpw';
6. GRANT ALL PRIVILEGES ON easyseatdb.* TO 'dev'@'localhost';
7. FLUSH PRIVILEGES;
8. das schema einspielen
9. das seed einspielen