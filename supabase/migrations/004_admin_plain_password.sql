-- Store plain password for super admin to view/share with district admins
alter table admins add column if not exists password_plain varchar(200);
