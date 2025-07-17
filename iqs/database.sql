create table users
(
    id                  serial
        primary key,
    name                varchar(255) not null,
    email               varchar(255) not null
        unique,
    password_hash       text         not null,
    role                user_role    not null,
    created_at          timestamp default CURRENT_TIMESTAMP,
    reset_token         text,
    reset_token_expires timestamp
);

alter table users
    owner to postgres;

create table schools
(
    id               serial
        primary key,
    name             varchar(255) not null,
    country          varchar(100) not null,
    status           school_status default 'pending'::school_status,
    evaluator_id     integer
                                  references users
                                      on delete set null,
    certificate_path text,
    created_at       timestamp     default CURRENT_TIMESTAMP
);

alter table schools
    owner to postgres;

create table evaluations
(
    id           serial
        primary key,
    school_id    integer
        references schools
            on delete cascade,
    evaluator_id integer
        references users
            on delete set null,
    report_path  text,
    visit_date   date,
    submitted_at timestamp default CURRENT_TIMESTAMP
);

alter table evaluations
    owner to postgres;

create table applications
(
    id           serial
        primary key,
    school_id    integer
        references schools
            on delete cascade,
    type         application_type not null,
    status       school_status default 'pending'::school_status,
    submitted_at timestamp     default CURRENT_TIMESTAMP
);

alter table applications
    owner to postgres;

create table files
(
    id          serial
        primary key,
    uploader_id integer
                          references users
                              on delete set null,
    type        file_type not null,
    path        text      not null,
    related_id  integer,
    uploaded_at timestamp default CURRENT_TIMESTAMP
);

alter table files
    owner to postgres;

create table countries
(
    id      serial
        primary key,
    name_en varchar(100) not null,
    name_ar varchar(100) not null
);

alter table countries
    owner to postgres;

create table settings
(
    key   varchar(100) not null
        primary key,
    value text
);

alter table settings
    owner to postgres;

create table school_docs
(
    id          serial
        primary key,
    school_id   integer
        references schools
            on delete cascade,
    doc_path    text        not null,
    doc_type    varchar(50) not null,
    uploaded_at timestamp default CURRENT_TIMESTAMP
);

alter table school_docs
    owner to postgres;

create table tasks
(
    id           serial
        primary key,
    evaluator_id integer                                          not null
        references users
            on delete cascade,
    school_id    integer                                          not null
        references schools
            on delete cascade,
    description  text                                             not null,
    status       varchar(50) default 'pending'::character varying not null,
    created_at   timestamp   default CURRENT_TIMESTAMP
);

alter table tasks
    owner to postgres;

create table feedback
(
    id            serial
        primary key,
    school_id     integer
        references schools,
    evaluator_id  integer
        references users,
    rating        integer,
    type          varchar(100),
    description   text,
    document_path varchar(255),
    created_at    timestamp default CURRENT_TIMESTAMP
);

alter table feedback
    owner to postgres;

create table trainings
(
    id           serial
        primary key,
    trainer_id   integer
                              references users
                                  on delete set null,
    title        varchar(255) not null,
    location     varchar(255) not null,
    joining_date date         not null,
    duration     varchar(100) not null,
    created_at   timestamp default CURRENT_TIMESTAMP
);

alter table trainings
    owner to postgres;

create table attendance
(
    id          serial
        primary key,
    session_id  integer not null
        references trainings
            on delete cascade,
    report_path text    not null
);

alter table attendance
    owner to postgres;

create table conversations
(
    id           serial
        primary key,
    type         varchar(16) not null,
    user_ids     integer[],
    group_name   varchar(32),
    last_message text,
    updated_at   timestamp default now()
);

alter table conversations
    owner to postgres;

create table messages
(
    id              serial
        primary key,
    sender_id       integer
                         references users
                             on delete set null,
    receiver_id     integer
                         references users
                             on delete set null,
    message         text not null,
    created_at      timestamp default CURRENT_TIMESTAMP,
    conversation_id integer
        references conversations
);

alter table messages
    owner to postgres;

