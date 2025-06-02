
drop database if exists global_chat;
drop user if exists marcus;
create user marcus with password 'marcus';
create database global_chat owner marcus;
