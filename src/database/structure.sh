#!/usr/bin/env bash
set -e

psql -U marcus -d global_chat <<EOSQL
create table "users" (
  "id" char(16)
);Add commentMore actions

alter table "users" add constraint "pkUsers" primary key ("id");

create table "messages" (
  "message"   text not null check (length("message") >= 1),
  "userId"    char(16),
  "createdAt" timestamptz default current_timestamp
);

alter table "messages" add constraint "fkMessagesUserIdUsers"
  foreign key ("userId") references "users" ("id");
EOSQL
