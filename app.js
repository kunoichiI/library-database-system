var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    query = require('./models/query'),
    path = require('path'),
    methodOverride = require('method-override');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
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
      .get('/contact', function(req, res){
        res.render('contact.html');
      })
      .get('/searchbook', function(req, res){
        res.render('search.ejs');
      })
      .get('/search', function(req, res){
        res.render('searchResults.ejs');
      })
      .get('/checkout', function(req, res){
        res.render('checkout.ejs');
      })
      .get('/success', function(req, res){
        res.render('checkoutSucess.ejs');
      })
      .get('/checkin', function(req, res){
        res.render('checkinRegister.ejs');
      })
      .get('/checkin/:loan_id', function(req, res){
        res.render('checkinForm.ejs');
      })
      .get('/newreader', function(req, res){
        res.render('createBorrower.ejs');
      })
      .get('/late', function(req, res){
        res.render('requestLate.ejs');
      })

// Search for a book by given name, isbn and/or author combination
router.post('/search', function(req, res){
  //var results = [];
  var book = {
    book_id : req.body.book_id,
    title : '%' + req.body.title + '%',
    author : '%' + req.body.author + '%' // author may be NULL
  }
  console.log(book)
  // given any combination of ISBN, title, and/ or Author(s)
  if (book.book_id != null && book.title == '%%' && book.author == '%%') {
    var query = client.query("SELECT DISTINCT b.isbn10, b.title, b.author, c.branch_id, c.no_of_copies, l.branch_name  FROM book AS b, library_branch AS l, book_copies AS c WHERE b.isbn10 = ($1) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10 ORDER BY c.branch_id",[book.book_id], function(err, results){
      res.render('searchResults.ejs', {results:results.rows});
    })
  }else if(book.book_id == '' && book.title != '%%' && book.author == '%%') {
    var query = client.query("SELECT DISTINCT b.isbn10, b.title, b.author, c.branch_id, c.no_of_copies, l.branch_name  FROM book AS b, library_branch AS l, book_copies AS c WHERE b.title ILIKE ($1) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10 ORDER BY c.branch_id", [book.title], function(err, results){
      console.log(results.rows);
      res.render('searchResults.ejs', {results:results.rows});
    })
  }else if(book.book_id != null && book.title != null && book.author == null) {
    var query = client.query("SELECT DISTINCT b.isbn10, b.title, b.author, c.branch_id, c.no_of_copies, l.branch_name  FROM book AS b, library_branch AS l, book_copies AS c WHERE b.isbn10 = ($1) AND b.title ILIKE ($2) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10 ORDER BY c.branch_id",[book.book_id, book.title], function(err, results){
      res.render('searchResults.ejs', {results:results.rows});
    })
  }else if(book.book_id != null && book.title != null && book.author != null){
    var query = client.query("SELECT DISTINCT b.isbn10, b.title, b.author, c.branch_id, c.no_of_copies, l.branch_name  FROM book AS b, library_branch AS l, book_copies AS c WHERE b.isbn10 = ($1) AND b.title ILIKE ($2) AND b.author ILIKE ($3) AND c.branch_id = l.branch_id AND c.book_id = b.isbn10 ORDER BY c.branch_id",[book.book_id , book.title , book.author], function(err, results){
      if (err) throw err;
      //res.json(results.rows);
      console.log(results.rows);
      res.render('searchResults.ejs', {results: results.rows})
    })
  }
})

// Check out a book in a specific library branch
router.post('/checkout', function(req, res){
  var result = [];
  var result1 = [];
  var result2 = [];
  var message_1 = "A borrower can borrow at most 3 books at one time!";
  var message_2 = 'Successfully insert book loan!';
  var message_3 = 'No available book in this library!';
  var card = {
    branch_id :req.body.branch_id,
    isbn : req.body.isbn,
    card_no : req.body.card_no
  };
  // Check if a BORROWER already has 3 BOOK_LOANS.
  var query = client.query("SELECT l.loan_id FROM borrower AS b, book_loans AS l WHERE b.card_no = l.card_no AND l.card_no = ($1) AND l.date_in IS NULL GROUP BY l.loan_id", [card.card_no]);
  query.on("row", function(row){
    console.log(row);
    result.push(row);
  });
  query.on('end', function(){
    console.log(result);
    console.log("i cant believe you")
    if (result.length >= 3) {
      res.render('checkoutMoreThanThree.ejs', {message:message_1});
      //
    }else if (result.length < 3) { // Borrower hasn't borrowed more than 3 books
      // check the number of BOOK_LOANS for a given book at a branch
      // select the checkouted book and late book
      var query1 = client.query("SELECT l.loan_id FROM book_copies AS c, book_loans AS l WHERE (c.branch_id = l.branch_id AND c.branch_id = ($1) AND c.book_id = l.isbn AND c.book_id = ($2) AND l.date_in IS NULL) OR (c.branch_id = l.branch_id AND c.branch_id = ($1) AND c.book_id = l.isbn AND c.book_id = ($2) AND l.date_in > CURRENT_DATE)", [card.branch_id, card.isbn]);
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
            var query2 = client.query("INSERT INTO book_loans(isbn, branch_id, card_no, date_out, due_date) VALUES($1, $2, $3, CURRENT_DATE, CURRENT_DATE + interval '14 days')",[card.isbn, card.branch_id, card.card_no]);
            query2.on('end', function(){
              console.log("Success!");
              res.render('checkoutSucess.ejs', {message:message_2});
            })
          } else if (result1.length > 0 && result1.length < result2[0].no_of_copies) { // book is still avaiable
            var query3 = client.query("INSERT INTO book_loans(isbn, branch_id, card_no, date_out, due_date) VALUES($1, $2, $3, CURRENT_DATE, CURRENT_DATE + interval '14 days')",[card.isbn, card.branch_id, card.card_no]);
            query3.on('end', function(){
              console.log("Success!");
              res.render('checkoutSucess.ejs', {message:message_2});
            })
          } else if (result1.length == result2[0].no_of_copies) {  // book not available
            console.log("No available book in this library!");
            res.render('checkoutNotAvailable.ejs', {message:message_3});
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
 // Only book_loans that have null date_in will be selected(means they're not returned)
 var query = client.query("SELECT DISTINCT b.fname, b.lname, l.loan_id, l.isbn, l.card_no, l.date_out, l.due_date FROM book_loans AS l, borrower AS b, book AS k WHERE (b.card_no = ($1) AND b.card_no = l.card_no AND l.date_in IS NULL) OR (l.isbn = ($2) AND l.card_no = b.card_no AND l.date_in IS NULL) OR (b.fname = ($3) AND b.lname = ($4) AND b.card_no = l.card_no AND l.date_in IS NULL)", [check.card_no, check.book_id, check.fname, check.lname]);
 // query database by providing any of book_id, card_no, and/or borrower's name. Get book_loan tuples
 query.on('row', function(row){
   console.log(row);
   result.push(row);
 })
 query.on('end', function(){
   console.log(result);
   res.render('checkin.ejs', {result:result})
 })
})

// Step 2: Insert check-in date for a specific book_loan
router.post('/checkin/:loan_id', function(req, res){
  var id = req.params.loan_id;
  var date = req.body.date;
  var query = client.query("UPDATE book_loans SET date_in = ($1) WHERE loan_id = ($2)", [date, id]); // Input a check-in date for a book_loan
  query.on('end',function(){
    res.render('checkinSuccess.ejs', {message: "Check-in Successfully!"})
  })
})


// Create new borrowers in the system
// If a new borrower is attempted withe same SSN, then your system should reject and return a useful error message.
router.post('/newreader', function(req, res){
  var result = [];
  var reader = {
    fname : req.body.fname,
    lname : req.body.lname,
    ssn : req.body.ssn,
    address : req.body.address,
    city : req.body.city,
    state : req.body.state,
    phone : req.body.phone
  }
  console.log(reader.ssn);
  var query1 = client.query("SELECT ssn FROM borrower WHERE ssn = ($1)", [reader.ssn]);
  query1.on('row', function(row){
    result.push(row);
  })
  query1.on('end',function(){
    console.log(result);
    if (result.length == 0) {
      var query = client.query("INSERT INTO borrower(ssn, fname, lname, address, city, state,phone) VALUES($1, $2, $3, $4, $5, $6,$7)", [reader.ssn, reader.fname, reader.lname, reader.address, reader.city, reader.state, reader.phone]);
      query.on('end', function(){
         res.render('borrowerCreated.ejs', {result: reader});
      })
    } else {
      res.render('borrowerNotCreated.ejs', {message:'The SSN already exists in our database!'})
    }
  })
})

// Fines management, first find out which book's late, step 1: insert this book_loan into fines table
// Two scenarios for late books: 1. late books that have been returned - the fine will be [(the difference in days between the due_date and date_in) * $0.25].
// 2. late books that are still out - the estimated fine will be [(the difference between the due_date and TODAY) * $0.25].
router.post('/late', function(req, res){
 var late_loans = [];
 var sum = [];
 var query = client.query("INSERT INTO fines(loan_id, fine_amt, paid) (SELECT l.loan_id, (l.date_in - l.due_date) * 0.25, FALSE FROM book_loans AS l WHERE NOT EXISTS (SELECT * FROM fines WHERE fines.loan_id = l.loan_id) AND (l.date_in > l.due_date))UNION (SELECT l.loan_id, (CURRENT_DATE - l.due_date)*0.25, FALSE FROM book_loans AS l WHERE NOT EXISTS (SELECT * FROM fines WHERE fines.loan_id = l.loan_id) AND (l.date_in IS NULL) AND (l.due_date < CURRENT_DATE))");
 query.on('end',function(){
   // update fines for book loans that haven't been returned
   var query1 = client.query("UPDATE fines SET fine_amt = (CURRENT_DATE - l.due_date)*0.25 FROM book_loans AS l WHERE fines.loan_id = l.loan_id AND l.date_in IS NULL AND paid = FALSE");
   query1.on('end', function(){
     var query2 = client.query("SELECT DISTINCT SUM(f.fine_amt),b.fname, b.lname, l.card_no FROM fines AS f, borrower AS b, book_loans AS l WHERE f.paid = FALSE AND f.loan_id = l.loan_id AND b.card_no = l.card_no GROUP BY l.card_no, b.fname, b.lname");
     query2.on('row', function(row){
       sum.push(row);
     })
     query2.on('end', function(){
       var query3 = client.query("SELECT DISTINCT f.fine_amt,l.loan_id, l.card_no, l.isbn,l.date_out, l.due_date, l.date_in FROM fines AS f, book_loans AS l WHERE f.paid = FALSE AND f.loan_id = l.loan_id ORDER BY l.card_no")
       query3.on('row',function(row){
         late_loans.push(row);
       })
       query3.on('end',function(){
         //res.json(sum);
         res.render('lateLoans.ejs',{results:late_loans,sum : sum});
       })


     })
   })
   })
 })

// Management entry for payment(enter payment of fines)
router.get('/payment/:loan_id', function(req, res) {
  var loan_id = req.params.loan_id;
  var result = [];
  var today = new Date();
  var query1 = client.query("SELECT l.date_in FROM book_loans AS l, fines WHERE l.date_in > l.due_date AND fines.loan_id = l.loan_id AND fines.loan_id = ($1)", [loan_id]);
  query1.on('row', function(row){
    result.push(row);
  })
  query1.on('end', function(){
    if(result[0].date_in > today){
      res.render('payFail.ejs', {message:'You cannot pay for a book that has not been returned yet!'});
    }else {
      var query = client.query("UPDATE fines SET paid = TRUE FROM book_loans AS l WHERE l.date_in <= CURRENT_DATE AND l.date_in > l.due_date AND fines.loan_id = l.loan_id AND fines.loan_id = ($1)", [loan_id]);
      query.on('end', function(){
        res.render('paySuccess.ejs', {message: 'Sucessfully enter payment!'})
      })
    }
  })
})

// Group unpaid payment by the card user(filter out previously paid fines)
router.get('/payments/:card_no', function(req, res){
    var card_no = req.params.card_no;
    var results = [];
    var query = client.query("SELECT l.card_no, COUNT(*), SUM(fines.fine_amt) FROM book_loans AS l, fines WHERE l.card_no = ($1) AND  l.loan_id = fines.loan_id AND paid = FALSE GROUP BY l.card_no", [card_no]);
    query.on('row', function(row){
      results.push(row);
    })
    query.on('end', function(){
      console.log(results);
      if (results.length == 0){
        res.json({message:"The borrower has nothing to pay right now!"})
      }else{
        res.json(results);
      }

    })
})

app.use('/api', router);

app.listen(port);
console.log('Listen to port' + port);
