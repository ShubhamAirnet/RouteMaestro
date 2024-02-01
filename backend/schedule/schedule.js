const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const axios = require("axios");

router.get("/getItinerarySchedule",async(req,res)=>{

  const itineraryRef = db.collection("Demo_Itinerary").doc(updated_Itinerary);

  try{
    const itinerary = await itineraryRef.get();

    if (itinerary.exists) {
      cities = itinerary.data().cities;

      trip = itinerary.data().trip;

      console.log(cities);
      
    }

  }
  catch(err){

    console.log(err);

  }


})








module.exports = router;
