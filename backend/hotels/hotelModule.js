const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const axios = require("axios");

router.get("/authenticate", async (req, res) => {
  const payload = {
    ClientId: "ApiIntegrationNew",
    UserName: "Airnet",
    Password: " Airnet@1234",
    EndUserIp: "49.43.88.177",
  };

  try {
    const { data } = await axios.post(
      "http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
      payload
    );

    console.log(data);
    res.status(200).json({
      token: data.TokenId,
    });
  } catch (err) {
    console.log("here is the error in last catch");
    res.status(400).json(err);
  }
});


router.get('/countryList',async(req,res)=>{

    const {tokenId}=req.body;

    const payload = {
        ClientId: "ApiIntegrationNew",
        EndUserIp: "49.43.88.177",
        TokenId:tokenId
    };
    
      try {
        const { data } = await axios.post(
          "http://api.tektravels.com/SharedServices/SharedData.svc/rest/CountryList",
          payload
        );
    
        console.log(data);
        res.status(200).json({
          data:data.CountryList
        });
      } catch (err) {
        console.log("here is the error in last catch");
        res.status(400).json(err);
      }

})

router.get("/destinationCityList",async(req,res)=>{

    const {tokenId,searchType}=req.body;

    const payload = {
        ClientId: "ApiIntegrationNew",
        EndUserIp: "49.43.88.177",
        TokenId:tokenId,
        SearchType:searchType,
        CountryCode:"IN"
    };

    try {
        const { data } = await axios.post(
          "http://api.tektravels.com/SharedServices/StaticData.svc/rest/GetDestinationSearchStaticData",
          payload
        );
    
        console.log(data);
        res.status(200).json({
          data:data.Destinations
        });
      } catch (err) {
        console.log("here is the error in last catch");
        res.status(400).json(err);
      }
})

router.get("/topDestinations",async(req,res)=>{

    const {tokenId}=req.body;

    const payload = {
        ClientId: "ApiIntegrationNew",
        EndUserIp: "49.43.88.177",
        TokenId:tokenId,
        CountryCode:"IN"
    };

    
    try {
        const { data } = await axios.post(
          "http://api.tektravels.com/SharedServices/SharedData.svc/rest/TopDestinationList",
          payload
        );
    
        console.log(data);
        res.status(200).json({
          data:data
        });
      } catch (err) {
        console.log("here is the error in last catch");
        res.status(400).json(err);
      }


})


// hotel search
router.get('/hotelSearch',async(req,res)=>{
  const {tokenId}=req.body;

  const payload = {
    EndUserIp:"49.43.88.155",
    TokenId:tokenId,
    CheckInDate:"22/01/2024",
    NoOfNights:2,
    CountryCode:"IN",
    CityId:125928,
    IsTBOMapped:"false",
    Radius:"5",
    PreferredCurrency:"INR",
    GuestNationality:"IN",
    NoOfRooms:1,
    RoomGuests:[{
        NoOfAdults:2,
        NoOfChild:0
    }],
    MaxRating:4,
    MinRating:1,
  };

  try {
    const { data } = await axios.post(
      "http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult/",
      payload
    );

    console.log(data);
    res.status(200).json({
      data:data
    });
  } catch (err) {
    console.log("here is the error in last catch");
    res.status(400).json(err);
  }

})


// hotel room info

router.get('/hotelRoomInfo',async(req,res)=>{
  const {tokenId,traceId,resultIndex,hotelCode}=req.body;

  const payload ={
    ResultIndex:resultIndex,
  HotelCode: hotelCode,
  EndUserIp: "49.43.88.155",
  TokenId: tokenId,
  TraceId: traceId
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom',payload)
    console.log(data);
    res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch");
    res.status(400).json(error);
  }
})



module.exports = router;
