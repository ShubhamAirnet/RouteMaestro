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



router.post('/getIternary', async (req, res) => {



  let hotelData=[]
  let i=0;
      const {resultCount,token}=req.body;
  try {
    const itineraryRef = db.collection("Demo_Itinerary").doc('updated_Itinerary');
    const itinerary = await itineraryRef.get();


    

    if (itinerary.exists) {
      const cities = itinerary.data().cities;
      const trip = itinerary.data().trip;
      const NoOfRooms = trip.RoomGuests.length;

      // console.log(cities)
    
          // Use Promise.all to wait for all asynchronous operations to complete
          await Promise.all(cities.map(async (city) => {
            
              await Promise.all(city.Properties.map(async (item) => {
                i++;
                console.log(i);
                console.log(item);
                await getHotelSearchData(city, item.date[0], item.date.length, NoOfRooms, resultCount, trip.RoomGuests, token, hotelData);
              }));
            
          }));
          
    
      console.log(hotelData)
      return res.status(200).json({ success: true, message: 'Data fetched successfully', fullJourneyHotels: hotelData, count: i });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});





async function getHotelSearchData(city,checkInDate,NoOfNights, NoOfRooms, resultCount, RoomGuests,token,hotelData) {


  const payload = {
       
    EndUserIp:"49.43.88.155",

    TokenId:token,

    CheckInDate: checkInDate,
    NoOfNights: NoOfNights,
    CountryCode:city.countryCode,
    CityId: city.cityId,
    PreferredCurrency:"INR",
    GuestNationality:"IN",
    NoOfRooms: NoOfRooms,
    RoomGuests:RoomGuests,
    MaxRating:5,
    MinRating:3,
    ResultCount:resultCount
  };
  try {

    // console.log(payload)
    const { data } = await axios.post("http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult/", payload);

    // console.log('data1',data);
    console.log("after the hotel search api call made")

    const hotelSearchData = data.HotelSearchResult;
    hotelSearchData.CityName = city.cityName;

    const cityData=await getAllData(hotelSearchData,city,token,checkInDate)
    // Return hotelSearchData as an array
    hotelData.push(cityData);

    
    // console.log('hotelData ',hotelData)
    return hotelData;
  } catch (error) {
    // console.log(error);
    console.log("error in search hotels")
    // Return an empty array or handle the error as needed
    return [];
  }
}




async function getAllData(hotelSearchData,city,token,checkInDate) {

  
  let cityData = {};
  let response=[];

  if (hotelSearchData.HotelResults) {
  await Promise.all(hotelSearchData.HotelResults.map(async (item) => {
    const infoPromise = getHotelInfoData(item.ResultIndex, item.HotelCode, hotelSearchData.TraceId,token);
    const roomPromise = getHotelRoomInfoData(item.ResultIndex, item.HotelCode, hotelSearchData.TraceId,token);


    const [info, room] = await Promise.all([infoPromise, roomPromise]);

    response.push({ search: item, info: info, room: room,resultIndex:item.ResultIndex,checkInDate:checkInDate });
  }));
}
  cityData["cityName"]=city.cityName;
  cityData["Response"]=response;
  cityData["checkInDate"]=checkInDate; 

  return cityData;

}



async function getHotelInfoData(resultIndex,hotelCode,traceId,token){
  const payload ={
  
    EndUserIp: "49.43.88.155",
    TokenId: token,

    ResultIndex: resultIndex,
    HotelCode: hotelCode,
    TraceId:traceId
    }
  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelInfo',payload);
    return data;

  }catch(error){
    // console.log(error)
    console.log("error in gettign teh htoel info")
  }
}

async function getHotelRoomInfoData(resultIndex,hotelCode,traceId,token){
  const payload ={
  
    EndUserIp: "49.43.88.155",
    TokenId:token,

    ResultIndex: resultIndex,
    HotelCode: hotelCode,
    TraceId:traceId
    }
  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom',payload);
    return data;

  }catch(error){
    // console.log(error)
    console.log("error in gettign teh room info")
  }
}


// hotel search
router.post('/hotelSearch',async(req,res)=>{
  

  const payload = {
    EndUserIp:"49.43.88.155",
    TokenId:req.body.tokenId,
    CheckInDate:req.body.checkInDate,
    NoOfNights:req.body.noOfNights,
    CountryCode:req.body.countryCode,
    CityId:req.body.cityId,
    PreferredCurrency:"INR",
    GuestNationality:"IN",
    NoOfRooms:req.body.noOfRooms,
    RoomGuests:req.body.RoomGuests,
    MaxRating:5,
    MinRating:3,
    ResultCount:req.body.resultCount
  };
  console.log(payload)

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

// hotel Info data
router.post('/hotelInfo',async(req,res)=>{
  const {tokenId,traceId,hotelCode,resultIndex}=req.body;

  const payload ={
  
  EndUserIp: "49.43.88.155",
  TokenId: tokenId,
  ResultIndex: resultIndex,
  HotelCode: hotelCode,
  TraceId:traceId
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelInfo',payload)
    console.log(data);
    res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("There is the error in last catch");
    res.status(400).json(error);
  }
})

// hotel room info

router.post('/hotelRoomInfo',async(req,res)=>{
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


            

// hotel static data
router.get('/hotelStaticData',async(req,res)=>{
  const {tokenId}=req.body;

  const payload ={
    CityId: "130443",
  ClientId: "ApiIntegrationNew",
  EndUserIp: "49.43.88.155",
  TokenId: tokenId,
  IsCompactData: "true",
  HotelId: "1011671",
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/SharedServices/StaticData.svc/rest/GetHotelStaticData',payload)
    console.log(data);
    res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch");
    res.status(400).json(error);
  }
})

// hotel block room

router.get('/hotelBlockRoom',async(req,res)=>{
  const {tokenId,resultIndex,hotelCode,hotelName,guestNationality,noOfRooms,isVoucherBooking,hotelRoomsDetails,traceId}=req.body;
  console.log(req.body)

  const payload ={
    ResultIndex: resultIndex,
    HotelCode: hotelCode,
    HotelName: hotelName,
    GuestNationality: guestNationality,
    NoOfRooms: noOfRooms,
    
    IsVoucherBooking: isVoucherBooking,
    HotelRoomsDetails:hotelRoomsDetails,
    EndUserIp: "49.43.88.155",
    TokenId: tokenId,
    TraceId: traceId
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/BlockRoom',payload)
    console.log(data);
    res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch",error.message);
    res.status(400).json(error);
  }
})

// hotel book room

router.get('/hotelBookRoom',async(req,res)=>{
  const {tokenId,resultIndex,hotelCode,hotelName,guestNationality,noOfRooms,isVoucherBooking,hotelRoomsDetails,traceId}=req.body;
  console.log(req.body)

  const payload ={
    ResultIndex: resultIndex,
  HotelCode: hotelCode,
  HotelName: hotelName,
  GuestNationality: guestNationality,
  NoOfRooms: noOfRooms,
  Ispackagefare:true,
  IsVoucherBooking: isVoucherBooking,
  HotelRoomsDetails:hotelRoomsDetails,
  EndUserIp: "49.43.88.155",
  TokenId: tokenId,
  TraceId: traceId
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book',payload)
    console.log(data);
    res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch",error.message);
    res.status(400).json(error);
  }
})

// get voucher 
router.get('/getVoucher',async(req,res)=>{

  const {tokenId,bookingId}=req.body;
  const payload={
    TokenId:tokenId,
    BookingId:bookingId,
    EndUserIp:"49.43.88.155"
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GenerateVoucher',payload);
    console.log(data)
    return res.status(200).send({
      data:data})
  }catch(error){
    console.log(error);
  }
})




module.exports = router;
