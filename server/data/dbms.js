module.exports = {
  "Joins": [
    {
      question: "Which JOIN returns only the matching rows from both tables?",
      options: ["LEFT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN"],
      answer: "INNER JOIN",
      explanation: "INNER JOIN returns only rows where there is a match in both tables."
    },
    {
      question: "Which JOIN returns all rows from the left table and matched rows from right?",
      options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
      answer: "LEFT JOIN",
      explanation: "LEFT JOIN returns all rows from the left table, with NULLs for unmatched right rows."
    },
    {
      question: "What does a CROSS JOIN produce?",
      options: ["Only matching rows", "Cartesian product", "Only left rows", "Only right rows"],
      answer: "Cartesian product",
      explanation: "CROSS JOIN produces the cartesian product — every row of left combined with every row of right."
    },
    {
      question: "Which JOIN returns all rows from both tables, with NULLs where no match?",
      options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
      answer: "FULL OUTER JOIN",
      explanation: "FULL OUTER JOIN returns all rows from both tables, filling NULLs where matches don't exist."
    },
    {
      question: "What is a self join?",
      options: ["Join of two different tables", "Join of a table with itself", "Join without a condition", "Join with NULL values"],
      answer: "Join of a table with itself",
      explanation: "A self join joins a table to itself, useful for hierarchical or comparative queries."
    },
    {
      question: "Which clause is used to specify the condition in a JOIN?",
      options: ["WHERE", "HAVING", "ON", "USING only"],
      answer: "ON",
      explanation: "The ON clause specifies the join condition between two tables."
    },
    {
      question: "What happens if no ON condition is given in a JOIN?",
      options: ["Error always", "Cartesian product", "Empty result", "Random match"],
      answer: "Cartesian product",
      explanation: "Without a condition, JOIN behaves like CROSS JOIN producing a cartesian product."
    },
    {
      question: "Which join type is most commonly used in practice?",
      options: ["CROSS JOIN", "FULL OUTER JOIN", "INNER JOIN", "NATURAL JOIN"],
      answer: "INNER JOIN",
      explanation: "INNER JOIN is the most commonly used as it fetches only relevant matching data."
    },
    {
      question: "NATURAL JOIN joins tables based on?",
      options: ["Primary key only", "All columns with same name", "Foreign key only", "First column"],
      answer: "All columns with same name",
      explanation: "NATURAL JOIN automatically joins on all columns that share the same name in both tables."
    },
    {
      question: "Which JOIN returns all rows from the right table and matched rows from left?",
      options: ["LEFT JOIN", "INNER JOIN", "RIGHT JOIN", "SELF JOIN"],
      answer: "RIGHT JOIN",
      explanation: "RIGHT JOIN returns all rows from the right table with NULLs for unmatched left rows."
    }
  ],
  "Normalization": [
    {
      question: "What is the main goal of normalization?",
      options: ["Increase redundancy", "Eliminate redundancy", "Increase tables", "Reduce queries"],
      answer: "Eliminate redundancy",
      explanation: "Normalization organizes data to eliminate redundancy and improve data integrity."
    },
    {
      question: "A table is in 1NF if?",
      options: ["No partial dependency", "All values are atomic", "No transitive dependency", "Has a primary key only"],
      answer: "All values are atomic",
      explanation: "1NF requires all column values to be atomic — no repeating groups or arrays."
    },
    {
      question: "2NF eliminates?",
      options: ["Transitive dependency", "Partial dependency", "Multi-valued dependency", "Join dependency"],
      answer: "Partial dependency",
      explanation: "2NF removes partial dependencies — non-key attributes must depend on the whole primary key."
    },
    {
      question: "3NF eliminates?",
      options: ["Partial dependency", "Join dependency", "Transitive dependency", "Functional dependency"],
      answer: "Transitive dependency",
      explanation: "3NF removes transitive dependencies — non-key attributes should not depend on other non-key attributes."
    },
    {
      question: "BCNF is stricter than?",
      options: ["1NF", "2NF", "3NF", "4NF"],
      answer: "3NF",
      explanation: "BCNF (Boyce-Codd Normal Form) is a slightly stronger version of 3NF."
    },
    {
      question: "Which normal form deals with multi-valued dependencies?",
      options: ["1NF", "2NF", "3NF", "4NF"],
      answer: "4NF",
      explanation: "4NF deals with multi-valued dependencies, ensuring no non-trivial multi-valued dependencies exist."
    },
    {
      question: "Denormalization is done to?",
      options: ["Remove redundancy", "Improve read performance", "Achieve BCNF", "Add foreign keys"],
      answer: "Improve read performance",
      explanation: "Denormalization intentionally adds redundancy to reduce expensive joins and improve read speed."
    },
    {
      question: "Partial dependency exists when a non-key attribute depends on?",
      options: ["Full composite key", "Part of composite key", "Another non-key", "Foreign key"],
      answer: "Part of composite key",
      explanation: "Partial dependency means a non-key attribute depends on only part of a composite primary key."
    },
    {
      question: "Which is the correct order of normal forms?",
      options: ["3NF → 2NF → 1NF", "1NF → 2NF → 3NF", "2NF → 1NF → 3NF", "BCNF → 3NF → 1NF"],
      answer: "1NF → 2NF → 3NF",
      explanation: "Normalization progresses from 1NF to 2NF to 3NF, each building on the previous."
    },
    {
      question: "A relation in BCNF must satisfy?",
      options: ["Every determinant is a candidate key", "No foreign keys", "All attributes are atomic", "No NULL values"],
      answer: "Every determinant is a candidate key",
      explanation: "In BCNF, for every functional dependency X→Y, X must be a superkey/candidate key."
    }
  ],
  "Transactions": [
    {
      question: "What does ACID stand for?",
      options: ["Atomicity Consistency Isolation Durability", "Access Control Integrity Data", "Atomic Concurrent Isolated Durable", "None of these"],
      answer: "Atomicity Consistency Isolation Durability",
      explanation: "ACID properties ensure reliable database transactions."
    },
    {
      question: "Atomicity means?",
      options: ["Transaction runs partially", "All or nothing execution", "Data is consistent", "Transactions are isolated"],
      answer: "All or nothing execution",
      explanation: "Atomicity ensures a transaction either completes fully or has no effect at all."
    },
    {
      question: "Which command saves a transaction permanently?",
      options: ["ROLLBACK", "SAVEPOINT", "COMMIT", "BEGIN"],
      answer: "COMMIT",
      explanation: "COMMIT permanently saves all changes made during the transaction."
    },
    {
      question: "Which command undoes a transaction?",
      options: ["COMMIT", "SAVEPOINT", "ROLLBACK", "END"],
      answer: "ROLLBACK",
      explanation: "ROLLBACK reverts all changes made during the current transaction."
    },
    {
      question: "Durability means?",
      options: ["Data survives system failures", "Transactions are isolated", "No partial updates", "Data is consistent"],
      answer: "Data survives system failures",
      explanation: "Durability ensures committed transactions persist even after crashes or failures."
    },
    {
      question: "Isolation property ensures?",
      options: ["Transactions complete fully", "Concurrent transactions don't interfere", "Data remains consistent", "Changes are permanent"],
      answer: "Concurrent transactions don't interfere",
      explanation: "Isolation ensures that concurrent transactions execute as if they were sequential."
    },
    {
      question: "A deadlock in DBMS occurs when?",
      options: ["Two transactions commit together", "Transactions wait for each other indefinitely", "A transaction rolls back", "Data is lost"],
      answer: "Transactions wait for each other indefinitely",
      explanation: "Deadlock occurs when two or more transactions wait for each other's locks, creating a cycle."
    },
    {
      question: "Which isolation level has the highest consistency?",
      options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
      answer: "Serializable",
      explanation: "Serializable is the strictest isolation level, ensuring full transaction isolation."
    },
    {
      question: "Dirty read problem occurs in which isolation level?",
      options: ["Serializable", "Repeatable Read", "Read Committed", "Read Uncommitted"],
      answer: "Read Uncommitted",
      explanation: "Read Uncommitted allows reading uncommitted data from other transactions, causing dirty reads."
    },
    {
      question: "What is a savepoint?",
      options: ["A full commit", "A checkpoint within a transaction", "A new transaction", "A rollback point to start"],
      answer: "A checkpoint within a transaction",
      explanation: "A savepoint marks a point within a transaction to which you can partially rollback."
    }
  ]
};