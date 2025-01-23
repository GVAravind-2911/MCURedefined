const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/localsave', (req, res) => {
    const data = req.body;

    const filePath = path.join(__dirname, 'tempblog.json');

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
            return res.status(500).json({ success: false, message: 'Error writing to file' });
        }
        res.json({ success: true });
    });
});

app.get('/localblogs', (req, res) => {
    const filePath = path.join(__dirname, 'tempblog.json');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/localindividualblogs',(req,res)=> {
    const data = req.body;
    const filePath = path.join(__dirname, 'tempindividualblog.json');

    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file', err);
            return res.status(500).json({ success: false, message: 'Error writing to file' });
        }
        res.json({ success: true });
    });
})

app.get('/localindividualblogs',(req,res)=> {
    const filePath = path.join(__dirname, 'tempindividualblog.json');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file', err);
            return res.status(500).json({ success: false, message: 'Error reading file' });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(3200, () => {
    console.log('Server is running on port 3200');
});