import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// MySQL connection
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root', // username
  password: 'Student1!', // password
  database: 'lab2' // DB name
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

app.get("/recomendation", (req, res) => {
  res.render("recomendation.ejs");
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

app.get("/searchBooks", (req, res) => {
  res.render("search.ejs");
});

app.get("/books", async (req, res) => {
  try {
    const [rows, fields] = await db.execute("SELECT * FROM books");
    res.render("searchResults.ejs", { books: rows });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.get("/searchGenre", async (req, res) => {
  const genre = req.query.genre;
  try {
    const [rows, fields] = await db.execute("SELECT * FROM books WHERE LOWER(genre) = ?", [genre.toLowerCase()]);
    res.render("searchResults.ejs", { books: rows, genre: genre });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.get("/searchAuthor", async (req, res) => {
  const author_name = req.query.author;
  try {
    const [rows, fields] = await db.execute(
      `SELECT books.title AS book_title, authors.name_a AS author_name, books.publication_year 
       FROM books 
       JOIN authors ON books.id_authors = authors.id_authors 
       WHERE LOWER(authors.name_a) = ?`,
      [author_name.toLowerCase()]
    );
    res.render("searchResults.ejs", { books: rows, author_name: author_name });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.get("/searchTitle", async (req, res) => {
  const title = req.query.title;
  try {
    const [rows, fields] = await db.execute(
      "SELECT * FROM books WHERE LOWER(title) LIKE ?",
      [`%${title.toLowerCase()}%`]
    );
    res.render("searchResults.ejs", { books: rows, title: title });
  } catch (error) {
    console.error(error);
    res.send("Error retrieving books.");
  }
});

app.post("/recommendation", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books");
  var randBook = Math.floor(Math.random() * rows.length);
  var randomaiser = rows[randBook].title;
  res.render("recomendation", { randomWord: randomaiser });
});

app.post("/fantasy", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'fantasy'");
  var fantasyBook = Math.floor(Math.random() * rows.length);
  var fantasyRandom = rows[fantasyBook].title;
  res.render("recomendation.ejs", { randomFantasy: fantasyRandom });
});

app.post("/novel", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Novel'");
  var novelBook = Math.floor(Math.random() * rows.length);
  var novelRandom = rows[novelBook].title;
  res.render("recomendation.ejs", { randomNovel: novelRandom });
});

app.post("/SciFi", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Science Fiction'");
  var sciFiBook = Math.floor(Math.random() * rows.length);
  var sciFiRandom = rows[sciFiBook].title;
  res.render("recomendation.ejs", { randomSciFi: sciFiRandom });
});

app.post("/dystopia", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Dystopian'");
  var dystopianBook = Math.floor(Math.random() * rows.length);
  var dystopiaRandom = rows[dystopianBook].title;
  res.render("recomendation.ejs", { randomDystopia: dystopiaRandom });
});

app.post("/romantic", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Romance'");
  var romanticBook = Math.floor(Math.random() * rows.length);
  var romanticRandom = rows[romanticBook].title;
  res.render("recomendation.ejs", { randomRomantic: romanticRandom });
});

app.post("/poem", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Poetry'");
  var poemBook = Math.floor(Math.random() * rows.length);
  var poemRandom = rows[poemBook].title;
  res.render("recomendation.ejs", { randomPoem: poemRandom });
});

app.post("/new", async (req, res) => {
  const { title, id_authors, publication_year, genre } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO books (title, id_authors, publication_year, genre) VALUES (?, ?, ?, ?)",
      [title, id_authors, publication_year, genre]
    );
    res.render("librarian.ejs", { newThink: "Book added successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { newThink: "Error adding book." });
  }
});

app.post("/delete", async (req, res) => {
  const id_books = req.body.id_books;

  try {
    await db.execute("DELETE FROM books WHERE id_books = ?", [id_books]);
    res.render("librarian.ejs", { deleteThink: "Book deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { deleteThink: "Error deleting book." });
  }
});

app.post("/update", async (req, res) => {
  const { id_books, title, id_authors, publication_year, genre } = req.body;

  try {
    await db.execute(
      "UPDATE books SET title = ?, id_authors = ?, publication_year = ?, genre = ? WHERE id_books = ?",
      [title, id_authors, publication_year, genre, id_books]
    );
    res.render("librarian.ejs", { updateThink: "Book updated successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { updateThink: "Error updating book." });
  }
});

//Book loan route
app.get("/loan", (req, res) => {
  const { name_r, email } = req.query;
  if (!name_r || !email) {
    return res.redirect("/login");
  }
  res.render("booksLoan.ejs", { name_r, email });
});

app.post("/addLoan", async (req, res) => {
  const { id_books, loan_date, name_r, email } = req.body;

  if (!name_r || !email) {
    return res.render("booksLoan.ejs", { message: "User information missing." });
  }

  try {
    const [reader] = await db.execute(
      "SELECT id_readers FROM readers WHERE name_r = ? AND email = ?",
      [name_r, email]
    );

    if (reader.length === 0) {
      return res.redirect("/login");
    }

    const id_readers = reader[0].id_readers;

    await db.execute(
      "INSERT INTO book_loan (id_books, id_readers, loan_date) VALUES (?, ?, ?)",
      [id_books, id_readers, loan_date]
    );
    res.render("booksLoan.ejs", { message: "Loan added successfully!", name_r, email });
  } catch (error) {
    console.error(error);
    res.render("booksLoan.ejs", { message: "Error adding loan." });
  }
});

app.post("/updateLoan", async (req, res) => {
  const { id_loan, return_date } = req.body;

  try {
    await db.execute(
      "UPDATE book_loan SET return_date = ? WHERE id_loan = ?",
      [return_date, id_loan]
    );
    res.render("librarian.ejs", { updateLoan: "Loan updated successfully!" });
  } catch (error) {
    console.error(error);
    res.render("librarian.ejs", { updateLoan: "Error updating loan." });
  }
});

// Registration route
app.post("/register", async (req, res) => {
  const { name_r, email } = req.body;

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
      res.render("login.ejs", { message: "Registration successful. Please log in." });
    }
  } catch (error) {
    console.error(error);
    res.render("register.ejs", { message: "Error registering user." });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { name_r, email } = req.body;


  try {
    const [user] = await db.execute(
      "SELECT * FROM readers WHERE name_r = ? AND email = ?",
      [name_r, email]
    );

    if (user.length > 0) {
      res.redirect(`/loan?name_r=${encodeURIComponent(name_r)}&email=${encodeURIComponent(email)}`);
    } else {
      res.render("login.ejs", { message: "Invalid name or email." });
    }
  } catch (error) {
    console.error(error);
    res.render("login.ejs", { message: "Error logging in." });
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
