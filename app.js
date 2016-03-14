var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    query = require('./models/query'),
    path = require('path'),
    methodOverride = require('method-override');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var port = process.env.PORT || 8080;

var pg = require('pg');
var connString = 'postgres:localhost:5432/libraryAdmin';


var client = new pg.Client(connString);
client.connect();


var router = express.Router();

router.get('/', function(req, res, next){
  res.render('index.html');
})

// Search for a book by given name, isbn and/or author combination
router.post('/search', function(req, res){
  //var results = [];
  var book = {
    book_id : req.body.book_id,
    title : '%' + req.body.title + '%',
    author : '%' + req.body.author + '%' // author may be NULL
  };
  var query = client.query("SELECT DISTINCT b.isbn10, b.title, b.author, c.branch_id, c.no_of_copies, l.branch_name FROM book AS b, library_branch AS l, book_copies AS c WHERE (b.isbn10 = ($1) AND b.title LIKE ($2) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10) OR (b.isbn10 = ($1) AND b.title LIKE ($2) AND b.author LIKE ($3) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10) OR (b.title LIKE ($2) AND b.author LIKE ($3) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10) OR (b.isbn10 = ($1) AND b.author LIKE ($3) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10)",[book.book_id, book.title, book.author], function(err, results){
    if (err) throw err;
    res.json(results.rows);
  })
})

// Check out a book in a specific library branch
router.post('/checkout', function(req, res){
  var result = [];
  var result1 = [];
  var result2 = [];
  var card = {
    branch_id :req.body.branch_id,
    isbn : req.body.isbn,
    card_no : req.body.card_no
  };
  // Check if a BORROWER already has 3 BOOK_LOANS.
  var query = client.query("SELECT l.loan_id FROM borrower AS b, book_loans AS l WHERE b.card_no = l.card_no AND l.card_no = ($1) AND l.date_in IS NULL", [card.card_no]);
  query.on("row", function(row){
    console.log(row);
    result.push(row);
  });
  query.on('end', function(){
    console.log(result);
    console.log("i cant believe you")
    if (result.length >= 3) {
      console.log("A borrower can borrow at most 3 books at one time!");
      //
    }else if (result.length < 3) { // Borrower hasn't borrowed more than 3 books
      // check the number of BOOK_LOANS for a given book at a branch
      var query1 = client.query("SELECT l.loan_id FROM book_copies AS c, book_loans AS l WHERE c.branch_id = l.branch_id AND c.branch_id = ($1) AND c.book_id = l.isbn AND c.book_id = ($2) AND l.date_in IS NULL", [card.branch_id, card.isbn]);
      query1.on('row',function(row){
        result1.push(row);
      })
      query1.on('end',function(){
        console.log(result1);
        console.log('what happened?');
        // query no_of_copies of the given book in this branch
        var query2 = client.query("SELECT no_of_copies FROM book_copies  WHERE branch_id = ($1) AND book_id = ($2)", [card.branch_id, card.isbn]);
        query2.on('row',function(row){
          result2.push(row);
        })
        query2.on('end',function(){
          console.log(result2);
          if (result1.length == 0 && result2[0].no_of_copies > 0) { // the book hasn't been borrowed yet in this library branch, and has copies now.
            var query2 = client.query("INSERT INTO book_loans(isbn, branch_id, card_no, date_out, due_date) VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '14 days')",[card.isbn, card.branch_id, card.card_no]);
          } else if (result1.length > 0 && result1.length < result2[0].no_of_copies) { // book is still avaiable
            var query3 = client.query("INSERT INTO book_loans(isbn, branch_id, card_no, date_out, due_date) VALUES($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + interval '14 days')",[card.isbn, card.branch_id, card.card_no]);
          } else if (result1.length == result2[0].no_of_copies) {  // book not available
            console.log("No available book in this library!");
          }
        })

      })
    }
  })
})


// Check in a book (step 1: search for book_loan potential multiple tuples)
router.post('/checkin', function(req, res){
  var result = [];
  var check = {
     book_id : req.body.book_id,
     card_no : req.body.card_no,
     fname : req.body.fname,
     lname : req.body.lname // get borrower's name or part of her name
   }
 console.log("anything?")
 var query = client.query("SELECT l.loan_id, l.isbn, l.card_no, l.date_out, l.due_date FROM book_loans AS l, borrower AS b WHERE (b.card_no = ($1) AND b.card_no = l.card_no) OR (l.isbn = ($2) AND l.card_no = b.card_no) OR (b.fname = ($3) AND b.lname = ($4) AND b.card_no = l.card_no)", [check.card_no, check.book_id, check.fname, check.lname]);
 // query database by providing any of book_id, card_no, and/or borrower's name. Get book_loan tuples
 query.on('row', function(row){
   console.log(row);
   result.push(row);
 })
 query.on('end', function(){
   res.json(result);
 })
})

// Step 2: Insert check-in date for a specific book_loan
router.post('/checkin/:loan_id', function(req, res){
  var id = req.params.loan_id;
  var query = client.query("UPDATE book_loans SET date_in = CURRENT_TIMESTAMP WHERE loan_id = ($1)", [id]);
  query.on('end',function(){
    res.json({message: "Check-in Successfully!"})
  })
})


// Create new borrowers in the system
router.post('/newreader', function(req, res){
  var result = [];
  var reader = {
    fname : req.body.fname,
    lname : req.body.lname,
    ssn : req.body.ssn,
    address : req.body.address,
    city : req.body.city,
    state : req.body.state
  }
  var query1 = client.query("SELECT ssn FROM borrower WHERE ssn = ($1)", [reader.ssn]);
  query1.on('row', function(row){
    result.push(row);
  })
  query1.on('end',function(){
    console.log(result);
    if (result == null) {
      var query = client.query("INSERT INTO borrower(ssn, fname, lname, address, city, state) VALUES($1, $2, $3, $4, $5, $6)", [reader.ssn, reader.fname, reader.lname, reader.address, reader.city, reader.state]);
      query.on('end', function(){
         res.json({message: 'New reader created!'});
      })
    } else {
      console.log("Borrower already exists!");
    }
  })
})


app.use('/api', router);

app.listen(port);
console.log('Listen to port' + port);
