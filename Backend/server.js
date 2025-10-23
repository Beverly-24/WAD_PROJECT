const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const farmers = require('./routes/farmers');
const crops = require('./routes/crops');
const livestock = require('./routes/livestock');
const buyers = require('./routes/buyers');
const transactions = require('./routes/transactions');
const summary = require('./routes/summary');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/farmers', farmers);
app.use('/api/crops', crops);
app.use('/api/livestock', livestock);
app.use('/api/buyers', buyers);
app.use('/api/transactions', transactions);
app.use('/api/summary', summary);

app.get('/', (req, res) => res.send('✅ FarmTracker API running'));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
