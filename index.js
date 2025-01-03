const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = "mongodb+srv://Crowduble:ASICPiLF16smti51@cluster0.58jmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db("crowduble");
    const campaignsCollection = database.collection("campaigns");


    app.post('/campaigns', async (req, res) => {
      const campaign = req.body;

      // Basic validation
      if (!campaign.title || !campaign.image || !campaign.type || !campaign.deadline) {
        return res.status(400).json({ message: "All required fields must be filled." });
      }

      try {
        const result = await campaignsCollection.insertOne(campaign);
        res.status(201).json({ message: "Campaign added successfully!", data: result });
      } catch (error) {
        console.error("Error inserting campaign:", error);
        res.status(500).json({ message: "Failed to add campaign." });
      }
    });

    // GET: Fetch all campaigns
    app.get('/campaigns', async (req, res) => {
      try {
        const campaigns = await campaignsCollection.find().toArray();
        res.status(200).json(campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ message: "Failed to fetch campaigns." });
      }
    });

    // GET: Fetch user's campaigns
    app.get('/mycampaign', async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail) {
        return res.status(400).json({ message: "Email is required." });
      }
      try {
        const campaigns = await campaignsCollection.find({ userEmail }).toArray();
        res.json(campaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ message: "Failed to fetch campaigns." });
      }
    });


    app.get('/mycampaign/:email', async(req,res)=>{
      const userEmail = req?.params.email ; 
      const query = {userEmail: userEmail} ; 
      const result = await database2.find(query).toArray()
      res.send(result)
    })

    //update
    // PUT: Update a campaign
    app.put('/mycampaign/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedUser = req.body;
      const User = {
        $set:{
          imageURL:updatedUser.imageURL,
          campaignTitle:updatedUser.campaignTitle,
          campaignType:updatedUser.campaignType,
          description:updatedUser.description,
          minDonation:updatedUser.minDonation,
          deadline:updatedUser.deadline,
          userEmail:updatedUser.userEmail,
          userName:updatedUser.userName
        }
      }
      const result = await database.updateOne(filter,User,options);
      res.send(result)
    })

    

    // DELETE: Delete a campaign
    app.delete('/mycampaign/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid campaign ID." });
      }
      try {
        const result = await campaignsCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Campaign not found." });
        }
        res.json({ message: "Campaign deleted successfully!" });
      } catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ message: "Failed to delete campaign." });
      }
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application if MongoDB connection fails
  }
}

run().catch(console.dir);
