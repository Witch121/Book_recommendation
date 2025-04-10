import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import { readFile } from "fs/promises";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// MySQL connection
const config = JSON.parse(
  await readFile(new URL('./config.json', import.meta.url))
);

const db = await mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/librarian_modify_loan", async (req, res) => {
  const { id_loan } = req.query;

  try {
    const [loanDetails] = await db.execute(
      "SELECT * FROM book_loan WHERE id_loan = ?",
      [id_loan]
    );

    if (loanDetails.length > 0) {
      res.render("librarian_modify_loan.ejs", { loan: loanDetails[0] });
    } else {
      res.render("librarian_modify_loan.ejs", { message: "No loan details found." });
    }
  } catch (error) {
    console.error("Error fetching loan details: ", error);
    res.render("librarian_modify_loan.ejs", { message: "Error fetching loan details." });
  }
});

app.get("/recommendation", (req, res) => {
  res.render("recommendation.ejs");
});

app.get("/moodBoards", (req, res) => {
  res.render("moodBoard.ejs");
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/librarian", (req, res) => {
  res.render("librarian.ejs");
});

app.get("/books", async (req, res) => {
  try {
    const [rows, fields] = await db.execute(
      `SELECT books.id_books, books.title, books.id_authors, authors.name_a AS author_name, books.publication_year, books.genre 
      FROM books 
      JOIN authors ON books.id_authors = authors.id_authors`
    );
    res.render("searchResults.ejs", { books: rows });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.get("/loanDetails", async (req, res) => {
  try {
    const [loanDetails] = await db.execute(`
      SELECT 
        book_loan.id_loan,
        book_loan.id_books, 
        book_loan.id_readers, 
        book_loan.loan_date,  
        book_loan.return_date, 
        books.title, 
        books.id_authors, 
        authors.name_a AS author_name,
        readers.name_r AS reader_name
      FROM book_loan
      JOIN books ON book_loan.id_books = books.id_books
      JOIN authors ON books.id_authors = authors.id_authors
      JOIN readers ON book_loan.id_readers = readers.id_readers
    `);

    res.render("loanDetails.ejs", { loanDetails });
  } catch (error) {
    console.error("Error fetching loan details: ", error);
    res.render("loanDetails.ejs", { message: "Error fetching loan details." });
  }
});

app.get("/searchBooks", (req, res) => {
  res.render("search.ejs");
});

app.get("/searchBook", async (req, res) => {
  const genre = req.query.genre;
  const author_name = req.query.author;
  const title = req.query.title;
  let sql = 
  `SELECT books.id_books, books.title, books.id_authors, authors.name_a AS author_name, books.publication_year, books.genre 
   FROM books 
     JOIN authors ON books.id_authors = authors.id_authors
   `;
  const values = [];   
  const filter = [];
  if (genre){ 
    filter.push(" LOWER(books.genre) = ? ");
    values.push(genre.toLowerCase());
  }
  if (author_name) {
    filter.push(" LOWER(authors.name_a) = ? ");
    values.push(author_name.toLowerCase());
  }
  if (title) {
    filter.push(" LOWER(books.title) LIKE ? ");
    values.push(`%${title.toLowerCase()}%`);
  }
  if (filter.length > 0) {
    sql = sql + "WHERE" + filter.join("AND")
  }
  try {
    const [rows, fields] = await db.execute(sql, values);
    res.render("searchResults.ejs", { books: rows, genre: genre });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.get("/update_book", async (req, res) => {
  const id = req.query.id_books;
  const sql = 
  `SELECT b.id_books, b.title, b.id_authors, a.name_a AS author_name, b.publication_year, b.genre 
   FROM books as b
     JOIN authors as a ON b.id_authors = a.id_authors
   WHERE b.id_books = ?`;
  try {
    const [rows, fields] = await db.execute(sql, [id]);
    res.render("librarian.ejs", {books: rows});
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.post("/delete", async (req, res) => {
  const id_books = req.body.id_books;
  const sql = `DELETE FROM books WHERE id_books = ?`
  try {
    const [rows, fields] = await db.execute(sql, [id_books]);
    res.render("librarian.ejs", { deleteThink: "Book deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { deleteThink: "Error deleting book." });
  }
});

app.post("/updateLoan", async (req, res) => {
  const { id_loan, return_date } = req.body;

  const sql = "UPDATE book_loan SET return_date = ? WHERE id_loan = ?";

  try {
    await db.execute(sql, [return_date, id_loan]);
    res.redirect("/loanDetails");
  } catch (error) {
    console.error("Error updating loan: ", error);
    res.send("Error updating loan.");
  }
});

app.post("/recommendation", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT book_title, author_name FROM lab2.books_with_authors;");
    
    if (rows.length > 0) {
      const randBook = Math.floor(Math.random() * rows.length);
      const { book_title, author_name } = rows[randBook];
      const randomBook = `${book_title} by ${author_name}`;
      res.render("recommendation.ejs", { randomWord: randomBook });
    } else {
      res.render("recommendation.ejs", { randomWord: "No books available." });
    }
  } catch (error) {
    console.error("Error fetching books: ", error);
    res.render("recommendation.ejs", { randomWord: "Error fetching books." });
  }
});

app.post("/fantasy", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'fantasy'");
  var fantasyBook = Math.floor(Math.random() * rows.length);
  var fantasyRandom = rows[fantasyBook].title;
  res.render("recommendation.ejs", { randomFantasy: fantasyRandom });
});

app.post("/novel", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Novel'");
  var novelBook = Math.floor(Math.random() * rows.length);
  var novelRandom = rows[novelBook].title;
  res.render("recommendation.ejs", { randomNovel: novelRandom });
});

app.post("/SciFi", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Science Fiction'");
  var sciFiBook = Math.floor(Math.random() * rows.length);
  var sciFiRandom = rows[sciFiBook].title;
  res.render("recommendation.ejs", { randomSciFi: sciFiRandom });
});

app.post("/dystopia", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Dystopian'");
  var dystopianBook = Math.floor(Math.random() * rows.length);
  var dystopiaRandom = rows[dystopianBook].title;
  res.render("recommendation.ejs", { randomDystopia: dystopiaRandom });
});

app.post("/romantic", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Romance'");
  var romanticBook = Math.floor(Math.random() * rows.length);
  var romanticRandom = rows[romanticBook].title;
  res.render("recommendation.ejs", { randomRomantic: romanticRandom });
});

app.post("/poem", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Poetry'");
  var poemBook = Math.floor(Math.random() * rows.length);
  var poemRandom = rows[poemBook].title;
  res.render("recommendation.ejs", { randomPoem: poemRandom });
});

app.get("/new", async (req, res) => {
  res.render("librarian_adding.ejs");
});

app.post("/new", async (req, res) => {
  const { title, name_a, nationality, publication_year, genre } = req.body;
  try {
    const [authorResult] = await db.execute(
      "SELECT id_authors FROM authors WHERE LOWER(name_a) = ? ",
      [name_a.toLowerCase()]
    );
    let authorId;
    if (authorResult.length > 0) {
      authorId = authorResult[0].id_authors;
    } else {
      const [newAuthorResult] = await db.execute(
        "INSERT INTO authors (name_a, nationality) VALUES (?, ?)",
        [name_a, nationality]
      );
      authorId = newAuthorResult.insertId;
    }
    const [bookResult] = await db.execute(
      "INSERT INTO books (title, id_authors, publication_year, genre) VALUES (?, ?, ?, ?)",
      [title, authorId, publication_year, genre]
    );
    res.render("librarian.ejs", { newThink: "Book and author added successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { newThink: "Error adding book and author." });
  }
});

app.get("/loan", (req, res) => {""
  const { id_books } = req.query;
  res.render("booksLoan.ejs", { id_books });
});

app.post("/addLoan", async (req, res) => {
  const { name_r, email, id_books, loan_date } = req.body;

  if (!name_r || !email || !id_books || !loan_date) {
    return res.render("booksLoan.ejs", { message: "Missing required information." });
  }

  try {
    const [readerResult] = await db.execute(
      "SELECT id_readers FROM readers WHERE name_r = ? AND email = ?",
      [name_r, email]
    );

    let id_readers;

    if (readerResult.length > 0) {
      id_readers = readerResult[0].id_readers;
    } else {
      const [newReaderResult] = await db.execute(
        "INSERT INTO readers (name_r, email) VALUES (?, ?)",
        [name_r, email]
      );
      id_readers = newReaderResult.insertId;
    }
    await db.execute(
      "INSERT INTO book_loan (id_books, id_readers, loan_date) VALUES (?, ?, ?)",
       [parseInt(id_books), parseInt(id_readers), loan_date]
    );

    res.render("booksLoan.ejs", { message: "Loan added successfully!", name_r, email, id_books });
  } catch (error) {
    console.error(error);
    res.render("booksLoan.ejs", { message: "Error adding loan." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { name_r, email } = req.body;
  const id_books = req.id_books;
  try {
    const [user] = await db.execute(
      "SELECT * FROM readers WHERE name_r = ? AND email = ?",
      [name_r, email]
    );
    if (user.length > 0) {
      res.redirect(`/books?name_r=${encodeURIComponent(name_r)}&email=${encodeURIComponent(email)}`);
    } else {
      res.render("login.ejs", { message: "Invalid name or email." });
    }
  } catch (error) {
    console.error(error);
    res.render("login.ejs", { message: "Error logging in." });
  }
});
// Registration route
app.post("/register", async (req, res) => {
  const { name_r, email } = req.body;
  const { id_books } = req.query;
  try {
    const [existingUser] = await db.execute(
      "SELECT * FROM readers WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      res.render("register.ejs", { message: "Email already registered." });
    } else {
      await db.execute(
        "INSERT INTO readers (name_r, email) VALUES (?, ?)",
        [name_r, email]
      );
      res.render("login.ejs", { message: "Registration successful. Please log in.", id_books });
    }
  } catch (error) {
    console.error(error);
    res.render("register.ejs", { message: "Error registering user." });
  }
});

app.get("/booksLoan", (req, res) => {
  const { name_r, email } = req.query;
  if (!name_r || !email) {
    return res.redirect("/login");
  }
  res.render("booksLoan.ejs", { name_r, email });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

app.post("/update", async (req, res) => {
  const { id_books, title, id_authors, author_name, publication_year, genre } = req.body;
  try {
    await db.execute(
      "UPDATE books SET title = ?, publication_year = ?, genre = ? WHERE id_books = ?",
      [title, publication_year, genre, id_books]
    );
    await db.execute(
      "UPDATE authors SET name_a = ? WHERE id_authors = ?",
      [author_name, id_authors]
    );
    res.render("librarian.ejs", { updateThink: "Book updated successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { updateThink: "Error updating book." });
  }
});