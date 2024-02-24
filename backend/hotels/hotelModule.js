const express = require("express");
const router = express.Router();
const {db} = require("../firebaseConfig");
const axios = require("axios");
const hotel_details=require('./hotels')
const hotelSample=require('./sampleHotel')



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

    // console.log(data);
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
    
        // console.log(data);
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
    
        // console.log(data);
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
    
        // console.log(data);
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
              // console.log(city);
              await Promise.all(city.Properties.map(async (item) => {
                i++;
                // console.log(i);
                // console.log(item);
                await getHotelSearchData(city, item.date[0], item.date.length, NoOfRooms, resultCount, trip.RoomGuests, token, hotelData);
              }));
            
          }));
          
    
      // console.log(hotelData)
      return res.status(200).json({ success: true, message: 'Data fetched successfully', fullJourneyHotels: hotelData, count: i });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
});





async function getHotelSearchData(city,checkInDate,NoOfNights, NoOfRooms, resultCount, RoomGuests,token,hotelData) {


  const payload = {

    EndUserIp: "49.43.88.155",    
   


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

    // console.log(payload , "Hotel search Data ===================");
    const { data } = await axios.post("http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelResult/", payload);
    // console.log('HotelSearch Response *********************************',data);
    // console.log("after the hotel search api call made")

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
    // console.log(payload)
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom',payload);
    // console.log(data);
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
    return res.status(200).json({
      data:data
    });
  } catch (err) {
    console.log("here is the error in last catch");
    return  res.status(400).json(err);
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
    console.log(payload)
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetHotelRoom',payload)
    console.log(data);
    return res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch");
    return res.status(400).json(error);
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
    return res.status(200).json({
      data:data
    });
  }catch(error){
    console.log("here is the error in last catch");
    return res.status(400).json(error);
  }
})

// hotel block room

router.post('/hotelBlockRoom', async (req, res) => {
  const { token, traceId } = req.body;
  const responseArray = [];

  try {
    await Promise.all(Object.values(hotelSample).map(async (hotelArray) => {
      let rooms = [];

      await Promise.all(hotelArray.map(async (hotelObject) => {
        const search = hotelArray[0].search;
        const RoomIndex = hotelObject.room.RoomIndex;
        const RoomTypeCode = hotelObject.room.RoomTypeCode;
        const RoomTypeName = hotelObject.room.RoomTypeName;
        const RatePlanCode = hotelObject.room.RatePlanCode;
        const BedTypes = hotelObject.room.BedTypes;
        const SmokingPreference = hotelObject.room.SmokingPreference;
        const Supplements = hotelObject.room.HotelSupplements;
        const Price = hotelObject.room.Price;

        rooms.push({
          RoomIndex: RoomIndex,
          RoomTypeCode: RoomTypeCode,
          RoomTypeName: RoomTypeName,
          RatePlanCode: RatePlanCode,
          SmokingPreference: SmokingPreference === 'NoPreference' ? 0 : SmokingPreference === 'Smoking' ? 1 : SmokingPreference === 'NonSmoking' ? 2 : 3,
          Price: Price,
          BedTypes: BedTypes
        });
      }));

      const payload = {
        ResultIndex: hotelArray[0].search.ResultIndex,
        HotelCode: hotelArray[0].search.HotelCode,
        HotelName: hotelArray[0].search.HotelName,
        GuestNationality: "IN",
        NoOfRooms: hotelArray.length,
        IsVoucherBooking: "true",
        HotelRoomsDetails: rooms,
        EndUserIp: "49.43.88.155",
        TokenId: token,
        TraceId: hotelArray[0].traceId
      };

      try {
        const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/BlockRoom', payload);
        console.log(data);
        responseArray.push(data); // Collect the response
      } catch (error) {
        console.log("Error in axios.post:", error.message);
        // Handle the error if needed, but don't send a response here
      }
    }));
  } catch (outerError) {
    console.log("Error in Promise.all:", outerError.message);
    // Handle the error if needed, but don't send a response here
  }

  return res.status(200).json({
    data: responseArray,
  });
});


// hotel book room
router.post('/hotelBookRoom', async (req, res) => {
  const { token } = req.body;
  let guests;
 

  try {
    const doc = await db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9').get();

    if (doc.exists) {
      guests = doc.data();
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.log("Error getting document:", error);
    return res.status(400).json(error);
  }

  const allHotelBookingDetails = [];

  for (const hotelArray of Object.values(hotelSample)) {
    const roomDetails = [];
    let count = 0;

    for (const hotelObject of hotelArray) {
      const hotelPassengers = []; // Initialize hotelPassengers here for each roomObject

      const search = hotelArray[0].search;
      const RoomIndex = hotelObject.room.RoomIndex;
      const RoomTypeCode = hotelObject.room.RoomTypeCode;
      const RoomTypeName = hotelObject.room.RoomTypeName;
      const RatePlanCode = hotelObject.room.RatePlanCode;
      const BedTypes = hotelObject.room.BedTypes;
      const SmokingPreference = hotelObject.room.SmokingPreference;
      const Supplements = hotelObject.room.HotelSupplements;
      const Price = hotelObject.room.Price;
      const totalGuest = hotelObject.NoOfAdults + hotelObject.NoOfChild;

      for (let i = 0; i < totalGuest && count < guests.passengers.length; i++) {
        // console.log(guests.passengers[count].personalInfo)
        hotelPassengers.push(guests.passengers[count].personalInfo);
        // console.log('hotel',hotelPassengers)
        count++;
      }

      const roomObject = {
        RoomIndex: RoomIndex,
        RoomTypeCode: RoomTypeCode,
        RoomTypeName: RoomTypeName,
        RatePlanCode: RatePlanCode,
        SmokingPreference: SmokingPreference === 'NoPreference' ? 0 : SmokingPreference === 'Smoking' ? 1 : SmokingPreference === 'NonSmoking' ? 2 : 3,
        Price: Price,
        BedTypes: BedTypes,
        HotelPassenger: hotelPassengers,
      };
      console.log(hotelPassengers)
      roomDetails.push(roomObject);
      console.log(roomDetails)
      
    }

    const payload = {
      ResultIndex: hotelArray[0].search.ResultIndex,
      HotelCode: hotelArray[0].search.HotelCode,
      HotelName: hotelArray[0].search.HotelName,
      GuestNationality: "IN",
      NoOfRooms: hotelArray.length,
      IsVoucherBooking: "true",
      HotelRoomsDetails: roomDetails,
      EndUserIp: "49.43.88.155",
      TokenId: token,
      TraceId: hotelArray[0].traceId,
    };
    // console.log('payload',payload)
    // console.log('roomdetails',roomDetails)

    try {
      const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/Book', payload);
      console.log(data);
      allHotelBookingDetails.push({ data, cityName: hotelArray[0]?.cityName,hotelName:hotelArray[0]?.search?.HotelName });

    } catch (error) {
      console.log("Error in the last catch block:", error.message);
      return res.status(400).json(error);
    }
  }

  // Store hotel booking details array in Firestore
  const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  const existingData = (await itineraryRef.get()).data();
  let existingHotelBookingDetails = existingData && existingData.hotelBookingDetails ? existingData.hotelBookingDetails : [];

  existingHotelBookingDetails = [...allHotelBookingDetails];

  await itineraryRef.update({
    hotelBookingDetails: existingHotelBookingDetails,
  });

  return res.status(200).json({
    data: allHotelBookingDetails,
  });
});




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


router.post('/getBookingDetails', async (req, res) => {
  const { tokenId } = req.body;

  const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  let bookingId = [];

  const itineraryData = await itineraryRef.get();
  const hotelBookingDetails = itineraryData.data().hotelBookingDetails || [];

  for (const item of hotelBookingDetails) {
    const payload = {
      TokenId: tokenId,
      BookingId: item.data.BookResult.BookingId,
      EndUserIp: "49.43.88.155",
      TraceId: item.data.BookResult.TraceId,
    };

    try {
      const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/HotelService.svc/rest/GetBookingDetail', payload);
      console.log(data);
      bookingId.push(data)

      // Check if BookingId is present in the response
      if (data.BookingHistory && data.BookingHistory.length > 0 && data.BookingHistory[0].BookingId) {
        // Update item.BookingId
        item.BookingId = data.BookingHistory[0].BookingId;
      }

    } catch (error) {
      console.log(error.message);
    }
  }

  // Update or create the hotelBookingDetails array in Firestore
  await itineraryRef.update({
    hotelBookingDetails: hotelBookingDetails,
  });

  return res.status(200).json({
    message: "Booking details updated successfully",
    bookingId
  });
});




router.post('/sendChangeRequest', async (req, res) => {
  try {
    const { token, requestType, remarks } = req.body;
    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
    let changeRequestId = [];

    const itineraryData = await itineraryRef.get();
    const hotelBookingDetails = itineraryData.data().hotelBookingDetails || [];

    // Use Promise.all to wait for all async operations to complete
    await Promise.all(hotelBookingDetails.map(async (item) => {
      const payload = {
        EndUserIp: "49.43.88.155",
        TokenId: token,
        BookingId: item.data.BookResult.BookingId,
        RequestType: requestType,
        Remarks: remarks
      };
      
      try {
        const response = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/SendChangeRequest', payload);
        const responseData = response.data;

        // Check if the response is successful
        if (responseData) {
          changeRequestId.push(responseData);
        } else {
          console.log("API response indicates failure:", responseData);
          // Handle failure if needed
        }

      } catch (error) {
        console.log("Error sending change request:", error.message);
        // Handle errors here if needed
      }
    }));

    console.log(changeRequestId)

    // Update or create the hotelChangeRequestId array in Firestore
    await itineraryRef.update({
      hotelChangeRequestId: changeRequestId
    });

    res.status(200).json({
      data: changeRequestId,
    });
    
  } catch (error) {
    console.log("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.post('/sendChangeRequestPartial', async (req, res) => {
  try {
    const { token, requestType, remarks,cities } = req.body;
    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
    let changeRequestId = [];

    const itineraryData = await itineraryRef.get();
    const hotelBookingDetails = itineraryData.data().hotelBookingDetails || [];

    // Use Promise.all to wait for all async operations to complete
    for(let i=0;i<cities.length;i++){
      await Promise.all(hotelBookingDetails.map(async (item) => {
        if(item.cityName===cities[i].cityName && item.hotelName === cities[i].hotelName){
          const payload = {
            EndUserIp: "49.43.88.155",
            TokenId: token,
            BookingId: item.data.BookResult.BookingId,
            RequestType: requestType,
            Remarks: remarks
          };
          console.log(payload)
          
          try {
            const response = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/SendChangeRequest', payload);
            const responseData = response.data;
    
            // Check if the response is successful
            if (responseData) {
              changeRequestId.push(responseData);
            } else {
              console.log("API response indicates failure:", responseData);
              // Handle failure if needed
            }
    
          } catch (error) {
            console.log("Error sending change request:", error.message);
            // Handle errors here if needed
          }
        }
      }));
    }

    console.log(changeRequestId)

    // Update or create the hotelChangeRequestId array in Firestore
    await itineraryRef.update({
      hotelChangeRequestId: changeRequestId
    });

    res.status(200).json({
      data: changeRequestId,
    });
    
  } catch (error) {
    console.log("Server error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.post('/getChangeRequest', async (req, res) => {
  try {
    const { token } = req.body;
    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
   
   let changes=[]

    const itineraryData = await itineraryRef.get();
    const hotelChangeRequestId = itineraryData.data().hotelChangeRequestId || [];

    // Use Promise.all to wait for all async operations to complete
    await Promise.all(hotelChangeRequestId.map(async (item) => {
      const payload = {
        EndUserIp:"49.43.88.155",
        TokenId: token,
        ChangeRequestId:item.HotelChangeRequestResult.ChangeRequestId
      };
      console.log(payload)
      try {
        const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Hotel/hotelservice.svc/rest/GetChangeRequestStatus/', payload);
        console.log(data);
        changes.push(data)
       

      } catch (error) {
        console.log(error);
        // Handle errors here if needed
      }
    }));

    await itineraryRef.update({
      hotelCancelCharges: changes
    });

    res.status(200).json({
      data: changes,
    });
    
  } catch (error) {
    console.log("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
