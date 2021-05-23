# Install
1. Clone this project from master branch
2. Run `npm i` on project directory
3. Set configurations on `.env` file
4. Now you can run `node app.js` to start the application

# Configuration
You can find the configuration options in `.env` file.

| Name | Default value | Description
| ------------ | ------------ |
| TEST_DALEY | 3600000 | If you want to repeat test you can select the deleay betweeb two tests |
| RESTART_AFTER_TEST  | false | After a successfull test start an other one |
| SAVE_TO_DB  | false | If you want to save test result to database you can enable it |
| DB_HOST | empty | Database hostname |
| DB_PORT | empty | Database server port |
| DB_USER | empty | Database username |
| DB_PASSWORD | empty | Database user password |
| DB_DATABASE | empty | Database| 


# Database

If you want to use save to database function you need to create a database with following table: 

    create table `speedtest`.`tests` ( `id` int not null auto_increment , `tester` varchar(255) null , `server` varchar(255) null , `ping` int null , `download` int null , `upload` int null , `url` text null , `created_at` datetime not null default current_timestamp , primary key (`id`)) engine = innodb;
