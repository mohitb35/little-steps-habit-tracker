const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.send('Home route');
})

let port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server started at http://localhost:${port} - ${new Date().toLocaleString()}`);
})

