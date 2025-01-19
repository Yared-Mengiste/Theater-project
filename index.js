import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
 
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
var userId = -1;
var theater;
 

app.get('/', (req, res) => {
    userId = -1;
  res.render('index.ejs');
});
app.get('/signin', (req, res) => {
    res.render('signin.ejs');
});
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});
app.get('/performance', (req, res) => {
    if(userId === -1){
        res.redirect('/signin');
    }else{
        res.render('performance.ejs', {performance: theater.Performance});
    }
});
app.post('/signin', (req, res) => {
    let { email, password } = req.body;
    let user = theater.Patron.find(u => u.email === email && u.password === password);
    if(user){
        userId = user.patronId;
        res.redirect('/performance');
    } else {
        res.redirect('/signin');
    }
} )
app.post('/signup', (req, res) => {
    let userName = req.body.userName;
    let email = req.body.email;
    let password = req.body.password;
    const newUser = {
        patronId: theater.Patron.length + 1, 
        userName: userName || "Default Name", // Fallback to default if not provided
        email: email || "default@example.com", // Fallback to default
        password: password || "defaultPassword" // Fallback to default
      };
    theater.Patron.push(newUser);
    writeTheaterToFile('./public/database/theater.json');  
    res.redirect('/signin');
} )

app.get('/getReservationsByPerformance', (req, res) => {
    const performanceId = parseInt(req.query.performanceId);
    const reservations = theater.Reservation.filter(r => r.performanceId === performanceId);
    if (reservations.length > 0) {
        res.json({ reservations, userId });
        console.log(userId);
    } else {
        res.status(404).json({ error: 'No reservations found for this performance' });
    }
});
app.get('/setUserId', (req, res) => {
    userId = parseInt(req.query.userId);
    res.json({ message: 'User ID set' });});

app.get('/bookReservation', (req, res) => {
    const performanceId = parseInt(req.query.performanceId);
    const selectedSeats = JSON.parse(req.query.selectedSeats); 
    const price = parseFloat(req.query.price);

    const performance = theater.Performance.find(p => p.performanceId === performanceId);
    if (!performance) {
        return res.status(404).json({ error: 'Performance not found' });
    }

    const existingReservations = theater.Reservation.filter(r => r.performanceId === performanceId);
    const bookedSeats = existingReservations.flatMap(r => r.seatId);
    const alreadyBooked = selectedSeats.some(seat => bookedSeats.includes(seat));

    if (alreadyBooked) {
        return res.status(400).json({ error: 'One or more seats are already booked' });
    }

    const newReservation = {
        id: theater.Reservation.length + 1,
        performanceId: performanceId,
        seatId: selectedSeats,
        patronId: userId, 
        reservationDate: new Date().toISOString().split('T')[0],
        reservationTime: new Date().toISOString().split('T')[1].split('.')[0],
        price: price
    };

    theater.Reservation.push(newReservation);

    writeTheaterToFile('./public/database/theater.json');

    res.json({ message: 'Reservation successful', reservation: newReservation });
});

app.listen(port, () =>{
    console.log(`Server started on port ${port}`);
});
readTheaterFromFile('./public/database/theater.json');

function readTheaterFromFile(filename) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading from file', err);
        } else {
            theater = JSON.parse(data);
            console.log('Theater data read from file successfully');
        }
    });
}
function writeTheaterToFile(filename) {
    fs.writeFile(filename, JSON.stringify(theater, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            console.log('Theater data written to file successfully');
        }
    });
}
