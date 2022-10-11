-- database => coffee_shop

CREATE TABLE weekday_key(
    id SERIAL NOT NULL PRIMARY KEY,
    weekdays VARCHAR(10) NOT NULL
);

CREATE TABLE waiters_key(
    id SERIAL NOT NULL PRIMARY KEY,
    waiters VARCHAR(100) NOT NULL,
    password VARCHAR(10) NOT NULL
);

CREATE TABLE schedule(
    id SERIAL NOT NULL PRIMARY KEY,
    waiters_id integer not null,
    weekday_id integer not null,
    foreign key (waiters_id) references waiters_key(id),
     foreign key (weekday_id) references weekday_key(id)
);

insert into weekday_key (weekdays) values ('Monday'), ('Tuesday'), ('Wednesday'), ('Thursday'), ('Friday'), ('Saterday'), ('Sunday');



