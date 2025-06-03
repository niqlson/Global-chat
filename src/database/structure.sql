create table "users" (
  "id" char(16)
);

alter table "users" add constraint "pkUsers" primary key ("id");

create table "messages" (
  "message"   text not null check (length("message") >= 1),
  "userId"    char(16),
  "createdAt" timestamptz default current_timestamp
);

alter table "messages" add constraint "fkMessagesUserIdUsers"
  foreign key ("userId") references "users" ("id");
  