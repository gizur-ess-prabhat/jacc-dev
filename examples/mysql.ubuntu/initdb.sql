/* Allow the root user to login from any host */

use mysql;

update user set Host='%' where User='root' and Host='localhost';
select * from user where User='root' and Host='%';


/* Set the password for the root user, CAHNGE THIS */
SET PASSWORD FOR root = PASSWORD('my_root_password');
