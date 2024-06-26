import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Підключення до MySQL бази даних
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root', // ім'я користувача
  password: 'Student1!', // пароль
  database: 'lab2' // назвa вашої бази даних
});

  app.get("/", (req, res) => {
    res.render("index.ejs");
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
  app.get ("/librarian",(req, res) => {
    res.render("librarian.ejs")
  });
  app.get("/searchBooks",(req, res) => {
    res.render("search.ejs")
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
    const author_name = req.query.author_name;
    try {
      const [rows, fields] = await db.execute("SELECT * FROM books_with_authors WHERE author_name = ?");
      res.render("searchResults.ejs", { rows});
    } catch (error) {
      console.error(error);
      res.send("Error retrieving books.");
    }
  });


  // Приклад запиту для отримання рекомендацій з бази даних
app.post("/recommendation", async (req, res) => {
  const [rows, fields] = await db.execute("SELECT title FROM lab2.books");
  var randBook = Math.floor(Math.random() * rows.length);
  var randomaiser = rows[randBook].title;
  res.render("recomendation", { randomWord: randomaiser });
});

  // app.post("/recommendation", (req, res) => {
  //   var randBook = Math.floor(Math.random() * books.length);
  //   var randomaiser = books[randBook];
  //   res.render("recomendation.ejs", {randomWord: randomaiser})
  // });


  app.post("/fantasy", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'fantasy'");
    var fantasyBook = Math.floor(Math.random() * rows.length);
    var fantasyRandom = rows[fantasyBook].title;
    res.render("recomendation.ejs", {randomFantasy: fantasyRandom})
  });

  app.post("/novel", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Novel'");
    var novelBook = Math.floor(Math.random() * rows.length);
    var novelRandom = rows[novelBook].title;
    res.render("recomendation.ejs", {randomNovel: novelRandom})
  });

  app.post("/SciFi", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Science Fiction'");
    var sciFiBook = Math.floor(Math.random() * rows.length);
    var sciFiRandom = rows[sciFiBook].title;
    res.render("recomendation.ejs", {randomSciFi: sciFiRandom})
  });

  app.post("/dystopia", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Dystopian'");
    var dystopianBook = Math.floor(Math.random() * rows.length);
    var dystopiaRandom = rows[dystopianBook].title;
    res.render("recomendation.ejs", {randomDystopia: dystopiaRandom})
  });

  app.post("/romantic", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Romance'");
    var romanticBook = Math.floor(Math.random() * rows.length);
    var romanticRandom = rows[romanticBook].title;
    res.render("recomendation.ejs", {randomRomantic: romanticRandom})
  });

  app.post("/poem", async (req, res) => {
    const [rows, fields] = await db.execute("SELECT title FROM lab2.books WHERE genre = 'Poetry'");
    var poemBook = Math.floor(Math.random() * rows.length);
    var poemRandom = rows[poemBook].title;
    res.render("recomendation.ejs", {randomPoem: poemRandom})
  });

  app.post("/new", async (req, res) => {
    const title = req.body.title;
    const id_authors = req.body.id_authors;
    const publication_year = req.body.publication_year;
    const genre = req.body.genre;
  
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
    const id_books = req.body.id_books;
    const title = req.body.title;
    const id_authors = req.body.id_authors;
    const publication_year = req.body.publication_year;
    const genre = req.body.genre;
  
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

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

//   var books = [
//     "1984 by George Orwell, England, (1903-1950)",
//     "A Doll's House by Henrik Ibsen, Norway (1828-1906)",
//     "A Sentimental Education by Gustave Flaubert, France, (1821-1880)",
//     "Absalom, Absalom! by William Faulkner, United States, (1897-1962)",
//     "The Adventures of Huckleberry Finn by Mark Twain, United States, (1835-1910)",    
//     "The Aeneid by Virgil, Italy, (70-19 BC)",    
//     "Beloved by Toni Morrison, United States, (b. 1931)",
//     "Berlin Alexanderplatz by Alfred Doblin, Germany, (1878-1957)",    
//     "Blindness by Jose Saramago, Portugal, (1922-2010)",    
//     "The Book of Disquiet by Fernando Pessoa, Portugal, (1888-1935)",
//     "The Book of Job, Israel. (600-400 BC)",
//     "The Brothers Karamazov by Fyodor M Dostoyevsky, Russia, (1821-1881)",
//     "Buddenbrooks by Thomas Mann, Germany, (1875-1955)",
//     "Canterbury Tales by Geoffrey Chaucer, England, (1340-1400)",
//     "The Castle by Franz Kafka, Bohemia, (1883-1924)",
//     "Children of Gebelawi by Naguib Mahfouz, Egypt, (b. 1911)",
//     "Collected Fictions by Jorge Luis Borges, Argentina, (1899-1986)",
//     "Complete Poems by Giacomo Leopardi, Italy, (1798-1837)",
//     "The Complete Stories by Franz Kafka, Bohemia, (1883-1924)",
//     "The Complete Tales by Edgar Allan Poe, United States, (1809-1849)",
//     "Confessions of Zeno by Italo Svevo, Italy, (1861-1928)",
//     "Crime and Punishment by Fyodor M Dostoyevsky, Russia, (1821-1881)",
//     "Dead Souls by Nikolai Gogol, Russia, (1809-1852)",
//     "The Death of Ivan Ilyich and Other Stories by Leo Tolstoy, Russia, (1828-1910)",
//     "Decameron by Giovanni Boccaccio, Italy, (1313-1375)",
//     "The Devil to Pay in the Backlands by Joao Guimaraes Rosa, Brazil, (1880-1967)",
//     "Diary of a Madman and Other Stories by Lu Xun, China, (1881-1936)",
//     "The Divine Comedy by Dante Alighieri, Italy, (1265-1321)",
//     "Don Quixote by Miguel de Cervantes Saavedra, Spain, (1547-1616)",
//     "Essays by Michel de Montaigne, France, (1533-1592)",
//     "Fairy Tales and Stories by Hans Christian Andersen, Denmark, (1805-1875)",
//     "Faust by Johann Wolfgang von Goethe, Germany, (1749-1832)",
//     "Gargantua and Pantagruel by Francois Rabelais, France, (1495-1553)",
//     "Gilgamesh Mesopotamia, (c 1800 BC)",
//     "The Golden Notebook by Doris Lessing, England, (b.1919)",
//     "Great Expectations by Charles Dickens, England, (1812-1870)",
//     "Gulliver's Travels by Jonathan Swift, Ireland, (1667-1745)",
//     "Gypsy Ballads by Federico Garcia Lorca, Spain, (1898-1936)",
//     "Hamlet by William Shakespeare, England, (1564-1616)",
//     "History by Elsa Morante, Italy, (1918-1985)",
//     "Hunger by Knut Hamsun, Norway, (1859-1952)",
//     "The Iliad by Homer, Greece, (c 700 BC)",
//     "Independent People by Halldor K Laxness, Iceland, (1902-1998)",
//     "Invisible Man by Ralph Ellison, United States, (1914-1994)",
//     "Jacques the Fatalist and His Master by Denis Diderot, France, (1713-1784)",
//     "Journey to the End of the Night by Louis-Ferdinand Celine, France, (1894-1961)",
//     "King Lear by William Shakespeare, England, (1564-1616)",
//     "Leaves of Grass by Walt Whitman, United States, (1819-1892)",
//     "The Life and Opinions of Tristram Shandy by Laurence Sterne, Ireland, (1713-1768)",
//     "Lolita by Vladimir Nabokov, Russia/United States, (1899-1977)",
//     "Love in the Time of Cholera by Gabriel Garcia Marquez, Colombia, (b. 1928)",
//     "Madame Bovary by Gustave Flaubert, France, (1821-1880)",
//     "The Magic Mountain by Thomas Mann, Germany, (1875-1955)",
//     "Mahabharata, India, (c 500 BC)",
//     "The Man Without Qualities by Robert Musil, Austria, (1880-1942)",
//     "The Mathnawi by Jalal ad-din Rumi, Afghanistan, (1207-1273)",
//     "Medea by Euripides, Greece, (c 480-406 BC)",
//     "Memoirs of Hadrian by Marguerite Yourcenar, France, (1903-1987)",
//     "Metamorphoses by Ovid, Italy, (c 43 BC)",
//     "Middlemarch by George Eliot, England, (1819-1880)",
//     "Midnight's Children by Salman Rushdie, India/Britain, (b. 1947)",
//     "Moby-Dick by Herman Melville, United States, (1819-1891)",
//     "Mrs. Dalloway by Virginia Woolf, England, (1882-1941)",
//     "Njaals Saga, Iceland, (c 1300)",
//     "Nostromo by Joseph Conrad, England,(1857-1924)",
//     "The Odyssey by Homer, Greece, (c 700 BC)",
//     "Oedipus the King Sophocles, Greece, (496-406 BC)",
//     "Old Goriot by Honore de Balzac, France, (1799-1850)",
//     "The Old Man and the Sea by Ernest Hemingway, United States, (1899-1961)",
//     "One Hundred Years of Solitude by Gabriel Garcia Marquez, Colombia, (b. 1928)",
//     "The Orchard by Sheikh Musharrif ud-din Sadi, Iran, (c 1200-1292)",
//     "Othello by William Shakespeare, England, (1564-1616)",
//     "Pedro Paramo by Juan Rulfo Juan Rulfo, Mexico, (1918-1986)",
//     "Pippi Longstocking by Astrid Lindgren, Sweden, (1907-2002)",
//     "Poems by Paul Celan, Romania/France, (1920-1970)",
//     "Pride and Prejudice by Jane Austen, England, (1775-1817)",
//     "The Ramayana by Valmiki, India, (c 300 BC)",
//     "The Recognition of Sakuntala by Kalidasa, India, (c. 400)",
//     "The Red and the Black by Stendhal, France, (1783-1842)",
//     "Remembrance of Things Past by Marcel Proust, France, (1871-1922)",
//     "Season of Migration to the North by Tayeb Salih, Sudan, (b. 1929)",
//     "Sons and Lovers by DH Lawrence, England, (1885-1930)",
//     "The Sound and the Fury by William Faulkner, United States, (1897-1962)",
//     "The Sound of the Mountain by Yasunari Kawabata, Japan, (1899-1972)",
//     "The Stranger by Albert Camus, France, (1913-1960)",
//     "The Tale of Genji by Shikibu Murasaki, Japan, (c 1000)",
//     "Things Fall Apart by Chinua Achebe, Nigeria, (b. 1930)",
//     "Thousand and One Nights, India/Iran/Iraq/Egypt, (700-1500)",
//     "The Tin Drum by Gunter Grass, Germany, (b.1927)",
//     "To the Lighthouse by Virginia Woolf, England, (1882-1941)",
//     "The Trial by Franz Kafka, Bohemia, (1883-1924)",
//     "Trilogy: Molloy, Malone Dies, The Unnamable by Samuel Beckett, Ireland, (1906-1989)",
//     "Ulysses by James Joyce, Ireland, (1882-1941)",
//     "Wuthering Heights by Emily Brontë, England, (1818-1848)",
//     "Zorba the Greek by Nikos Kazantzakis, Greece, (1883-1957)"
//   ]

// var fantasy = [
// "  The Lord of the Rings by J. R. R. Tolkien",
// "A Game of Thrones by George R. R. Martin",
//   "Northern Lights by Philip Pullman",
//   "The Name of the Wind by Patrick Rothfuss",
//   "American Gods by Neil Gaiman ",
//   "A Wizard of Earthsea by Ursula K. Le Guin",
//   "The Lion, the Witch and the Wardrobe by C. S. Lewis",
//   "Assassin’s Apprentice by Robin Hobb",
//   "Gardens of the Moon by Steven Erikson",
//  "The Eye of the World by Robert Jordan",
//   "Harry Potter and the Sorcerer’s Stone by J. K. Rowling",
//  " Mistborn: The Final Empire by Brandon Sanderson", 
//   "The Way of Kings by Brandon Sanderson ",
//   "The Colour of Magic by Terry Pratchett",
//   "The Hobbit by J. R. R. Tolkien",
//   "The Blade Itself by Joe Abercrombie",
//   "A Wrinkle in Time by Madeleine L’Engle",
//   "Outlander by Diana Gabaldon",
//   "Gideon the Ninth by Tamsyn Muir",
//   "The Fifth Season by N.K. Jemisin"
// ]

// var detectiv = [
//   "The Hound of the Baskervilles by Sir Arthur Conan Doyle, 1902",
//   "The Silent Patient by Alex Michaelides, 2019",
//   "In Cold Blood by Truman Capote, 1965",
//   "The Girl with the Dragon Tattoo by Stieg Larsson, 2005",
//   "Murder on the Orient Express by Agatha Christie, 1934",
//   "The Talented Mr. Ripley by Patricia Highsmith, 1955",
//   "In the Woods by Tana French, 2007",
//   "Death at La Fenice by Donna Leon, 1992",
//   "The Girl on the Train by Paula Hawkins, 2015",
//   "Mystic River by Dennis Lehane, 2001",
//   "Angels and Demons by Dan Brown, 2000"
// ]

// var sciFi = [
//   "Ender’s Game by Orson Scott Card, 1985",
//   "Do Androids Dream of Electric Sheep? By Philip K. Dick, 1968",
//   "Dune by Frank Herbert, 1965",
//   "Nineteen Eighty-Four by George Orwell, 1949",
//   "Foundation by Isaac Asimov, 1942",
//   "The Time Machine by H. G. Wells, 1895",
//   "The Ultimate Hitchhiker’s Guide by Douglas Adams, 1979",
//   "Frankenstein by Mary Shelley, 1818",
//   "The Handmaid’s Tale by Margaret Atwood, 1985",
//   "The Martian by Andy Weir, 2011",
//   "Brave New World by Aldous Huxley, 1932",
//   "Hyperion by Dan Simmons, 1989",
//   "Ringworld by Larry Niven, 1970",
//   "I, Robot by Isaac Asimov, 1950"
// ]

// var dystopian = [
//   "The Hunger Games by Suzanne Collins ",
//   "1984 by George Orwell",
//   "Station Eleven by Emily St. John Mandel",
//   "The Time Machine by H.G. Wells",
//   "Fahrenheit 451 by Ray Bradbury",
//   "Parable of the Sower by Octavia E. Butler",
//   "Never Let Me Go by Kazuo Ishiguro",
//   "Brave New World by Aldous Huxley",
//   "The Power by Naomi Alderman",
//   "The Handmaid's Tale by Margaret Atwood",
//   "The Road by Cormac McCarthy",
//   "The Giver by Lois Lowry",
//   "The Dispossessed: An Ambiguous Utopia by Ursula K. Le Guin",
//   "The Wall by ​​John Lanchester",
//   "We by Yevgeny Zamyatin",
//   "A Clockwork Orange by Anthony Burgess",
//   "The Man in the High Castle by Philip K. Dick",
//   "The Drowned World by J.G. Ballard",
//   "The Stand by Stephen King",
//   "Slaughterhouse-Five by Kurt Vonnegut"
// ]

// var romantica = [
//   "With Love, from Cold World by Alicia Thompson",
//   "Love, Theoretically by Ali Hazelwood",
//   "Witch of Wild Things by Raquel Vasquez Gilliland",
//   "Get a Life, Chloe Brown by Talia Hibbert",
//   "The Dead Romantics by Ashley Poston",
//   "Long Shot by Kennedy Ryan",
//   "The Kiss Quotient by Helen Hoang",
//   "Happy Place by Emily Henry",
//   "The Song of Achilles by Madeline Miller",
//   "The Notebook by Nicholas Sparks",
//   "The Proposal by Jasmine Guillory",
//   "Delta of Venus by Anais Nin",
//   "Glow by Raven Kennedy",
//   "Things We Never Got Over by Lucy Score",
//   "The Undertaking of Hart and Mercy by Megan Bannen",
//   " Just Like Magic by Sarah Hogle",
//   "Everything for You by Chloe Liese",
//   "Fake Empire by CW Farnsworth",
//   "Heartstopper by Alice Oseman"
// ]

// var poems = [
//   "William Carlos Williams, “The Red Wheelbarrow”",
//   "T. S. Eliot, “The Waste Land”",
//   "Robert Frost, “The Road Not Taken”",
//   "Gwendolyn Brooks, “We Real Cool”",
//   "Elizabeth Bishop, “One Art”",
//   "Emily Dickinson, “Because I could not stop for Death –”",
//   "Langston Hughes, “Harlem”",
//   "Sylvia Plath, “Daddy”",
//   "Robert Hayden, “Middle Passage“",
//   "Wallace Stevens, “Thirteen Ways of Looking at a Blackbird”",
//   "Allen Ginsberg, “Howl“",
//   "Maya Angelou, “Still I Rise“",
//   "Dylan Thomas, “Do Not Go Gentle into That Good Night”",
//   "Samuel Taylor Coleridge, “Kubla Khan”",
//   "Percy Bysshe Shelley, “Ozymandias“",
//   "Edgar Allan Poe, “The Raven”",
//   "Paul Laurence Dunbar, “We Wear the Mask“",
//   "Louise Glück, “Mock Orange“",
//   "Marianne Moore, “Poetry“"
// ]