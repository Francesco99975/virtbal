CREATE TABLE Users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  username varchar(12) UNIQUE NOT NULL,
  hashedPassword VARCHAR NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now ()
);