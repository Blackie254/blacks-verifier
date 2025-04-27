// api/submit.js

export default function handler(req, res) {
    if (req.method === 'POST') {
      const data = req.body; // Get data sent from frontend
      console.log('Received data:', data);
  
      // You can process/save this data here
  
      res.status(200).json({ success: true, message: 'Data received successfully!' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }