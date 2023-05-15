CREATE TABLE IF NOT EXISTS Statements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        spent INTEGER NOT NULL,
        deposited INTEGER NOT NULL,
        keep INTEGER NOT NULL,
        date DATE NOT NULL,
        startingBalance INTEGER NOT NULL,
        accountId UUID NOT NULL,
        FOREIGN KEY (accountId) REFERENCES Accounts(id)
);