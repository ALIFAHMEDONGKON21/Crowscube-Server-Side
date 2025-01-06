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
    const database2 = client.db("crowdcube").collection("donationdetails");


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


     // card deailts
  //   const { ObjectId } = require("mongodb");
  //   app.get("/campaigns/:id", async (req, res) => {
  //     const { id } = req.params;
    
  //     try {
  //       const campaign = await campaignCollection.findOne({ _id: new ObjectId(id) });
    
  //       if (!campaign) {
  //         return res.status(404).send({ message: "Campaign not found" });
  //       }
    
  //       res.status(200).send(campaign);
  //     } catch (error) {
  //       console.error("Error fetching campaign:", error);
  //       res.status(500).send({ message: "Internal Server Error" });
  //     }
  //   });
    
    

  //   app.post('/donatedetails',async(req,res)=>{
  //     const newCampaign = req.body; 
  //     console.log("Successfully new campaign & user added", newCampaign); 
  //     const result = await campaignsCollection.insertOne(newCampaign);
  //     res.send(result)
  // })
    

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


    //update
    app.get('/campaigns/:id', async(req, res)=>
    {
      const id=req.params.id;
      const query={_id : new ObjectId(id)};
      const result=await campaignsCollection.findOne(query);
      res.send(result)
    })


    app.patch('/campaigns/:id', async(req, res)=>{
      const id=req.params.id;
      const data=req.body;
      const query={_id : new ObjectId(id)};
      const update={
        $set:{
          image:data.image,
          title:data.title,
          description:data.description,
          minimumDonation:data.minimumDonation,
          deadline:data.deadline
        },
      }
      const result=await campaignsCollection.updateOne(query, update)
      res.send(result)
    })


    //donte
    // app.get('/donatinon/:id', async(req, res)=>
    //   {
    //     const id=req.params.id;
    //     const query={_id : new ObjectId(id)};
    //     const result=await campaignsCollection.findOne(query);
    //     res.send(result)
    //   })
      app.post('/donattion',async(req,res)=>{
        const newCampaign = req.body; 
        console.log("Successfully new campaign & user added", newCampaign); 
        const result = await database2.insertOne(newCampaign);
        res.send(result)
    })

    app.get('/donation', async (req, res) => {
      const { email } = req.query;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
    
      try {
        const donations = await database2.find({ userEmail: email }).toArray();
        res.send(donations);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch donations", error });
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
