USE bssccbot
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
    BEGIN
        CREATE TABLE users
        (
         user_id      bigint not null
                      constraint users_pk
                      primary key nonclustered,
         is_admin     bit default 0,
         is_jailed    bit default 0,
         num_messages int default 0
        )

        CREATE UNIQUE index users_user_id_uindex
         ON users (user_id)
    END
