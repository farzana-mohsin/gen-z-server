require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const assert = require("assert");
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = "mongodb://localhost:27017";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster81657.uygasmd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster81657&maxIdleTimeMS=60000000000`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productsCollection = client.db("productsDb").collection("products");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct);
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = new ObjectId(id);
      const query = { _id: objectId };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/products-by-price-ascend", async (req, res) => {
      const limit = parseInt(req.query.limit);

      const cursor = productsCollection.find().sort({ price: 1 }).limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products-by-price-descend", async (req, res) => {
      const limit = parseInt(req.query.limit);

      const cursor = productsCollection.find().sort({ price: -1 }).limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/products-by-date-added", async (req, res) => {
      const limit = parseInt(req.query.limit);

      const cursor = productsCollection
        .find()
        .sort({ productCreationDate: -1 })
        .limit(limit);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/product-name", async (req, res) => {
      const searchString = req.body.key;

      const query = {
        productName: {
          $regex: searchString,
          $options: "i",
        },
      };

      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/filter-products", async (req, res) => {
      const category = req.body.category;
      const brandName = req.body.brandName;
      const minPrice = req.body.minPrice;
      const maxPrice = req.body.maxPrice;

      let query = {
        price: { $gte: minPrice, $lte: maxPrice },
        category: { $eq: category },
        brandName: { $eq: brandName },
      };

      if (!category && !!brandName) {
        query = {
          brandName: { $eq: brandName },
          price: { $gte: minPrice, $lte: maxPrice },
        };
      } else if (!!category && !brandName) {
        query = {
          category: { $eq: category },
          price: { $gte: minPrice, $lte: maxPrice },
        };
      } else if (!category && !brandName) {
        query = {
          price: { $gte: minPrice, $lte: maxPrice },
        };
      }

      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("gen-z is running");
});

app.listen(port, () => {
  console.log(`gen-z is running on port ${port}`);
});
