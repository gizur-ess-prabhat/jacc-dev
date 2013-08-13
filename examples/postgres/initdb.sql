/* Create a user (same as role) named 'openerp' in Postgres with the password 'openerp'  */

CREATE ROLE openerp WITH SUPERUSER LOGIN PASSWORD 'openerp';

SELECT rolname FROM pg_roles;
