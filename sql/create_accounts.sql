CREATE TABLE Accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
  name varchar(12) UNIQUE NOT NULL,
  bank INTEGER NOT NULL,
  userId UUID NOT NULL,
  FOREIGN KEY (userId) REFERENCES Users(id)
);