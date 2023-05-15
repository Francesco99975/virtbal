CREATE TABLE IF NOT EXISTS Transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        description VARCHAR NOT NULL,
        amount INTEGER NOT NULL,
        isDeposit BOOLEAN NOT NULL,
        date VARCHAR NOT NULL,
        statementId UUID NOT NULL,
        FOREIGN KEY (statementId) REFERENCES Statements(id)
);