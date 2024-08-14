const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("gen-z is running");
});

app.listen(port, () => {
  console.log(`gen-z is running on port ${port}`);
});
