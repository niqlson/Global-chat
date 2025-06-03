create table "users" (
  "id" char(32)
);

alter table if not exists "users" add constraint "pkUsers" primary key ("id");

create table if not exists "messages" (
  "message"   text not null check (length("message") >= 1),
  "userId"    char(32),
  "createdAt" timestamptz default current_timestamp
);

alter table "messages" add constraint "fkMessagesUserIdUsers"
  foreign key ("userId") references "users" ("id");
