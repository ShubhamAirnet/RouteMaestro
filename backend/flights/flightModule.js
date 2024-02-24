const express = require("express");
const router = express.Router();
const {db} = require("../firebaseConfig");
const axios = require("axios");
const fareQuote=require('./flights')

const { getDownloadURL } = require('firebase-admin/storage');
const { admin } = require('../firebaseConfig');



router.get("/authenticate", async (req, res) => {
  const payload = {
    ClientId: "ApiIntegrationNew",
    UserName: "Airnet",
    Password: " Airnet@1234",
    EndUserIp: "49.43.88.155",
  };

  try {
    const { data } = await axios.post(
      "http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate",
      payload
    );

    res.status(200).json({
      token: data.TokenId,
    });
  } catch (err) {
    console.log("here is the error in last catch");
    res.status(400).json(err);
  }
});

router.post("/optimizeSearchResults", async (req, res) => {
  const { flightSet } = req.body;

  function isParticularFlightSimilar(flight1, flight2) {
    return (
      flight1.Baggage === flight2.Baggage &&
      flight1.CabinBaggage === flight2.CabinBaggage &&
      flight1.CabinClass === flight2.CabinClass &&
      flight1.Airline.AirlineCode === flight2.Airline.AirlineCode &&
      flight1.Origin.Airport.AirportCode ===
        flight2.Origin.Airport.AirportCode &&
      flight1.Destination.Airport.AirportCode ===
        flight2.Destination.Airport.AirportCode
    );
  }

  function isOneCompleteFlightSimilarFunction(
    oneCompleteFlight1,
    oneCompleteFlight2
  ) {
    let checkingParticularFlight;
    for (let i = 0; i < oneCompleteFlight1.length; i++) {
      checkingParticularFlight = isParticularFlightSimilar(
        oneCompleteFlight1[i],
        oneCompleteFlight2[i]
      );
      if (!checkingParticularFlight) break;
    }

    return checkingParticularFlight;
  }

  function areFlightSetSegmentsSimilar(flightSet1Segments, flightSet2Segments) {
    let isOneCompleteFlightSimilar;

    for (let i = 0; i < flightSet1Segments.length; i++) {
      isOneCompleteFlightSimilar = isOneCompleteFlightSimilarFunction(
        flightSet1Segments[i],
        flightSet2Segments[i]
      );

      if (!isOneCompleteFlightSimilar) break;
    }

    return isOneCompleteFlightSimilar;
  }

  function areFlightSetsSimilar(flightSet1, flightSet2) {
    return (
      flightSet1.fare.PublishedFare === flightSet2.fare.PublishedFare &&
      flightSet1.isRefundable == flightSet2.isRefundable &&
      flightSet1.isLCC === flightSet2.isLCC &&
      flightSet1.segments.length === flightSet2.segments.length &&
      areFlightSetSegmentsSimilar(flightSet1.segments, flightSet2.segments)
    );
  }

  function groupFlights(flights) {
    const groups = {};

    flights.forEach((flight, index) => {
      let foundGroup = false;
      let i = 0;
      // Check if the flight is similar to any existing group
      for (const groupId in groups) {
        console.log(i);
        console.log(groupId);
        const representativeFlight = groups[groupId][0];
        if (areFlightSetsSimilar(representativeFlight, flight)) {
          groups[groupId].push(flight);
          foundGroup = true;
          break;
        }
        i++;
      }

      // If not similar to any existing group, create a new group
      if (!foundGroup) {
        groups[index] = [flight];
      }
    });

    return groups;
  }

  const hello = groupFlights(flightSet);

  console.log(hello);
  if (hello) res.send(hello);
  else res.send("error in getting hello");

  // if(areFlightSetsSimilar(flightSet1,flightSet2)){
  //   res.send(true)
  // }
  // else{
  //   res.send(false)
  // }
});

router.post("/searchMultiStopFlights", async (req, res) => {
  const { itineraryDocName, flightToken } = req.body;

  // NO NEED OF THIS FUNCTION NOW
  const DateTimeFormatForApi = (date, timePeriod) => {
    const flightMorningTime = "00:00:00";
    const flightAfternoonTime = "00:00:00";
    const flightEveningTime = "00:00:00";
    const flightNightTime = "00:00:00";

    const dateTime = new Date(date);

    if (timePeriod === "morning") {
      dateTime.setHours(
        Number(flightAfternoonTime.split(":")[0]) + dateTime.getHours()
      );
      dateTime.setMinutes(
        Number(flightAfternoonTime.split(":")[1]) + dateTime.getMinutes()
      );
      dateTime.setSeconds(
        Number(flightAfternoonTime.split(":")[2]) + dateTime.getSeconds()
      );
    } else if (timePeriod === "afternoon") {
      dateTime.setHours(
        Number(flightEveningTime.split(":")[0]) + dateTime.getHours()
      );

      dateTime.setMinutes(
        Number(flightEveningTime.split(":")[1]) + dateTime.getMinutes()
      );

      dateTime.setSeconds(
        Number(flightEveningTime.split(":")[2]) + dateTime.getSeconds()
      );
    } else if (timePeriod === "evening") {
      dateTime.setDate(dateTime.getDate() + 1); // Move to the next date
      dateTime.setHours(
        Number(flightNightTime.split(":")[0]) + dateTime.getHours()
      );
      dateTime.setMinutes(
        Number(flightNightTime.split(":")[1]) + dateTime.getMinutes()
      );
      dateTime.setSeconds(
        Number(flightNightTime.split(":")[2]) + dateTime.getSeconds()
      );
    } else if (timePeriod === "night") {
      console.log("night");

      dateTime.setDate(dateTime.getDate() + 1); // Move to the next date
      dateTime.setHours(
        Number(flightMorningTime.split(":")[0]) + dateTime.getHours()
      );
      dateTime.setMinutes(
        Number(flightMorningTime.split(":")[1]) + dateTime.getMinutes()
      );
      dateTime.setSeconds(
        Number(flightMorningTime.split(":")[2]) + dateTime.getSeconds()
      );
    } else {
      // Handle the case when the timePeriod is not recognized
      return null;
    }

    console.log(dateTime);
    // Format the date and time as a string in the desired format
    const formattedDateTime = dateTime.toISOString().slice(0, 19);

    return formattedDateTime;
  };


  const checkNextTimePeriod=(timePeriod)=>{

    if(timePeriod==="morning")return "afternoon"
    else if(timePeriod==="afternoon")return "evening"
    else if (timePeriod==="evening")return "night"
    else if(timePeriod==="night")return "morning"
    else return null
  }

  let cities;
  let trip;
  let segmentsArray = [];
  let timePeriodArray = [];

  const itineraryRef = db.collection("Demo_Itinerary").doc(itineraryDocName);

  try {
    const itinerary = await itineraryRef.get();

    if (itinerary.exists) {
      cities = itinerary.data().cities;

      trip = itinerary.data().trip;

      const initialOriginDateToDepart = trip.start_date;

      const timePeriodOrigin = trip.trip_start_timeperiod;

      timePeriodArray.push(checkNextTimePeriod(trip.trip_start_timeperiod));

      segmentsArray.push({
        Origin: trip.departure_airport,
        Destination: cities[0].cityCode,
        FlightCabinClass: "1",
        PreferredDepartureTime: DateTimeFormatForApi(
          initialOriginDateToDepart,
          timePeriodOrigin
        ),
        PreferredArrivalTime: DateTimeFormatForApi(
          initialOriginDateToDepart,
          timePeriodOrigin
        ),
      });

      let i = 0;
      let ourDate = initialOriginDateToDepart;

      cities.forEach((cityObject) => {
        const daysToAdd = cityObject.noOfNights;

        const initialDate = new Date(ourDate);

        const resultDate = new Date(initialDate);
        resultDate.setDate(resultDate.getDate() + daysToAdd);

        // this is to assign  final date (from this iteration) as initial date (for next iteration).
        ourDate = resultDate;

        let cityLastDayObject = cityObject.days[cityObject.days.length - 1];

        let lastTimePeriod =
          cityLastDayObject.activities[cityLastDayObject.activities.length - 1]
            .activity_timeperiod;

        timePeriodArray.push(checkNextTimePeriod(lastTimePeriod));

        console.log(lastTimePeriod);

        if (i >= cities.length - 1) {
          segmentsArray.push({
            Origin: cityObject.cityCode,
            Destination: trip.departure_airport,
            FlightCabinClass: "1",
            PreferredDepartureTime: DateTimeFormatForApi(
              resultDate,
              lastTimePeriod
            ),
            PreferredArrivalTime: DateTimeFormatForApi(
              resultDate,
              lastTimePeriod
            ),
          });
        } else {
          segmentsArray.push({
            Origin: cityObject.cityCode,
            Destination: cities[i + 1].cityCode,
            FlightCabinClass: "1",
            PreferredDepartureTime: DateTimeFormatForApi(
              resultDate,
              lastTimePeriod
            ),
            PreferredArrivalTime: DateTimeFormatForApi(
              resultDate,
              lastTimePeriod
            ),
          });
          i++;
        }
      });

      const payload = {
        EndUserIp: "49.43.88.177",
        TokenId: flightToken,
        AdultCount: trip.travellers.AdultCount,
        ChildCount: trip.travellers.ChildCount.length,
        InfantCount: trip.travellers.InfantCount,
        JourneyType: "3",
        Segments: segmentsArray,
      };

      console.log(payload);

      const { data } = await axios.post(
        "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search",
        payload
      );
        // console.log(data)

      if (data.Response.Error.ErrorCode !== 0) {
        res.status(500).json({
          message: ErrorMessage,
        });
      } 
      else {

        const flightArray = await data.Response.Results[0];
        const traceId = await data.Response.TraceId;


        const getAirlineLogos = async (oneCompleteFlight) => {
          try {
            const imageLinks = await Promise.all(oneCompleteFlight.map(async (flight) => {
              return await getImageLink(flight.Airline.AirlineCode);
            }));
        
            // Now 'imageLinks' is an array of download URLs
            // console.log(imageLinks);
            
            return imageLinks
          
          } catch (err) {
            console.error(err);
            // Handle the error appropriately, e.g., send a response or throw an error
            // res.status(500).send('Internal Server Error');
          }
        };
        const getImageLink=async(airlineCode)=>{
          try {
   
            const storage = admin.storage();
            
            const imagesRef = storage.bucket().file(`allAirlinesLogo/${airlineCode}.gif`);
        
            const downloadURL= await getDownloadURL(imagesRef);

            return downloadURL


          } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
          }
        }

        const processFlights = async () => {
          const keyValueArray = [];
        
          // for-each does not work well with async nature , as it does not wait for an itieration to complete
          for (const flight of flightArray) {
            const airlineLogos = await Promise.all(flight.Segments.map(oneCompleteFlight => getAirlineLogos(oneCompleteFlight)));
        
            keyValueArray.push({
              isRefundable: flight.IsRefundable,
              isLCC: flight.IsLCC,
              resultIndex: flight.ResultIndex,
              fare: flight.Fare,
              segments: flight.Segments,
              penaltyCharges: flight.PenaltyCharges,
              airlineLogos: airlineLogos,
            });
          }
        
          res
          .status(200)
          .json({TraceId:traceId ,flightsData: keyValueArray});
        };
        
        processFlights();

       
      }
    } else {
      res.status(500).json({
        message: "Not able to fetch the flies from Database.",
      });
    }
  } catch (error) {
    res.send(error);
  }
});





router.post("/assigningTimePeriodsToFlightSets", async (req, res) => {
  const { flightsData,timePeriod } = req.body;


  const checkTimeToTimePeriod=(dateTimeString)=>{

    const currDate=new Date(dateTimeString);

    if(currDate.getHours()<=11 && currDate.getHours()>=5){
      return "morning"
    }
    else if(currDate.getHours()<=15 && currDate.getHours()>=12){
      return "afternoon"
    }
    else if(currDate.getHours()<=20 && currDate.getHours()>=16){
      return "evening"
    }
    else if((currDate.getHours()<=23  && currDate.getHours()>=21) || (currDate.getHours()<=4 && currDate.getHours()>=0) ){
      return "night"
    }
    else return null
  }


  const groups = [];
  let x=0;
  flightsData.forEach((flightSet) => {

      let value=false;

      for(let i=0;i<timePeriod.length;i++){
        
        console.log(i +"In for loop i")
        console.log(flightSet.resultIndex);
        console.log( flightSet.segments[2][0].Origin.DepTime);
        console.log(timePeriod[2] + "--->  Yeh wal From DB");
        console.log(checkTimeToTimePeriod(flightSet.segments[2][0].Origin.DepTime) + "---> This is of the curr flightSet");



        if(checkTimeToTimePeriod(flightSet.segments[2][0].Origin.DepTime)===timePeriod[i]){
          console.log("Hello buddy")
          value=true;
        }
        else{
          value=false;
        }

        if(!value)break;

      }

      if(value){
        groups.push(flightSet)
      }
     
    
x++;
  });

  res.send(groups)
});



router.post("/fareRule",async(req,res)=>{

  const {traceId,flightToken,resultIndex}=req.body;

  const payload = {
    EndUserIp: "49.43.88.155",
    TokenId: flightToken,
    TraceId: traceId,
    ResultIndex: resultIndex,
  };

  try {

    console.log(payload)
    const { data } = await axios.post(
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareRule",
      payload
    );

    res.status(200).json({ fareRule: data });
  } catch (err) {
    res.status(400).json(err);
  }



})

router.post("/fareQuote",async(req,res)=>{
 
  const {flightToken,traceId,resultIndex}=req.body
 
  const payload = {
    EndUserIp: "49.43.88.177",
    TokenId: flightToken,
    TraceId: traceId,
    ResultIndex: resultIndex,
  };

  try {
    const { data } = await axios.post(
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/FareQuote",
      payload
    );

    res.status(200).json({fareRule:data});

  } catch (error) {
    res.status(400).json(error);
  }
})


router.post("/ssr",async(req,res)=>{


  const {flightToken,traceId,resultIndex}=req.body
 
  const payload = {
    EndUserIp: "49.43.88.177",
    TokenId: flightToken,
    TraceId: traceId,
    ResultIndex: resultIndex,
  };

  console.log(payload)
  try {
    const {data}=await axios.post("http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SSR",payload);

    console.log(data)

    res.status(200).json({ssr:data});
  } catch (error) {
    res.status(400).json(error);
    
  }

})

mant-changes
// Your route handler file

router.get('/getImageLink', async (req, res) => {
  try {
   
    const storage = admin.storage();
    
    const imagesRef = storage.bucket().file('allAirlinesLogo/0B.gif');

    const downloadURL= await getDownloadURL(imagesRef);

    res.status(200).json({
      url:downloadURL
    })

    // res.send(imagesRef);
    // Rest of your code...
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

function calculateAgeAtEndDate(dob, endDate) {
  const birthDate = new Date(dob);
  const currentDate = new Date(endDate);

  // Calculate the difference in years
  let age = currentDate.getFullYear() - birthDate.getFullYear();

  // Adjust the age if the birthdate hasn't occurred yet this year
  if (currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() && currentDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

router.post('/flightBook', async (req, res) => {
  const { flightToken, traceId, resultIndex } = req.body;
  let guests = [];

  try {
    const doc = await db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9').get();

    const itinerary=await db.collection('Demo_Itinerary').doc('updated_Itinerary').get()

    if (doc.exists) {
      guests = doc.data().passengers;
      // console.log('guests', guests);
    } else {
      console.log("No such document!");
      return res.status(400).json({ error: "No such document" });
    }

    if(itinerary.exists){
      trip=itinerary.data().trip;
    }else {
      console.log("No such document!");
      return res.status(400).json({ error: "No such document" });
    }

    const fareBreakdown = fareQuote.FareBreakdown;
    
    let adult = {};
    let child = {};
    let infant = {};

    fareBreakdown.forEach((fare) => {
      const newObject = {
        Currency: "INR",
        BaseFare: 0,
        Tax: 0,
        YQTax: 0,
        AdditionalTxnFeePub: 0,
        AdditionalTxnFeeOfrd: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedFare: 0,
        OfferedFare: 0,
        TdsOnCommission: 0,
        TdsOnPLB: 0,
        TdsOnIncentive: 0,
        ServiceFee: 0
      };
      const passengerType = fare.PassengerType;
      const passengerCount = fare.PassengerCount;
    
      if (passengerType === 1) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        adult=newObject;
     
      } else if (passengerType === 2) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        child=newObject;
      }else if (passengerType === 3) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        infant=newObject;
      }
    });
    
   
    
    // console.log('adult',adult);
    // console.log('child',child);
    // console.log('infant',infant);

    let passengers = [];
    // console.log('guests', guests);

    for (let i = 0; i < guests.length; i++) {
      const { PAN, ...restPersonalInfo } = guests[i].personalInfo;
      const dob=guests[i].personalInfo.Age
      if (guests[i].personalInfo.Age >= 12) {
      
        const combinedObject = {
          ...restPersonalInfo,
          PaxType: 1,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2, // Overwrite Gender
          Fare: adult,
          IsLeadPax:true,
        };
        
        passengers.push(combinedObject);
      } else if (guests[i].personalInfo.Age > 2) {
        const combinedObject = {
          ...restPersonalInfo,
          GuardianDetails:guests[i].guardianDetails,
          PaxType:2,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: child,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      } else if(guests[i].personalInfo.Age<=2 && calculateAgeAtEndDate(dob,trip.end_date)>2) {
        const combinedObject = {
          ...restPersonalInfo,
          GuardianDetails:guests[i].guardianDetails,
          PaxType:2,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: child,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      }else{
        const combinedObject = {
          ...restPersonalInfo,
          GuardianDetails:guests[i].guardianDetails,
          PaxType:2,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: infant,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      }
    }

    const payload = {
      ResultIndex: resultIndex,
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      TraceId: traceId,
      Passengers: passengers,
    };

    console.log(payload);
    try {
      const { data } = await axios.post("http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Book", payload);

     
      console.log(data);

      // Store BookingId and PNR in Firestore
      if(data){
        const bookingId = data.Response.Response.BookingId;
        const pnr = data.Response.Response.PNR;
        
        const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
        await itineraryRef.update({
          flight_details: {
            booking_details: {
              BookingId: bookingId,
              PNR: pnr
            }
          }
        });
      }

      return res.status(200).json({ data: data });
    } catch (error) {
      console.error("Error in API call:", error.message);
      return res.status(400).json({ error: "Error in API call" });
    }
  } catch (error) {
    console.error("Error getting document:", error.message);
    return res.status(400).json({ error: "Error getting document" });
  }
});

router.post('/ticketLCC', async (req, res) => {
  const { flightToken, traceId, resultIndex } = req.body;
  let guests = [];
  let trip;

  try {
    const doc = await db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9').get();
    if (doc.exists) {
      guests = doc.data().passengers;

      // console.log('guests', guests);
    } else {
      console.log("No such document!");
      return res.status(400).json({ error: "No such document" });
    }



    const itinerary=await db.collection('Demo_Itinerary').doc('updated_Itinerary').get();

    if(itinerary.exists){
      trip=itinerary.trip
    }

   
    const fareBreakdown = fareQuote.FareBreakdown;
    
    let adult = {};
    let child = {};
    let infant = {};

    fareBreakdown.forEach((fare) => {
      const newObject = {
        Currency: "INR",
        BaseFare: 0,
        Tax: 0,
        YQTax: 0,
        AdditionalTxnFeePub: 0,
        AdditionalTxnFeeOfrd: 0,
        OtherCharges: 0,
        Discount: 0,
        PublishedFare: 0,
        OfferedFare: 0,
        TdsOnCommission: 0,
        TdsOnPLB: 0,
        TdsOnIncentive: 0,
        ServiceFee: 0
      };
      const passengerType = fare.PassengerType;
      const passengerCount = fare.PassengerCount;
    
      if (passengerType === 1) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        adult=newObject;
     
      } else if (passengerType === 2) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        child=newObject;
      }else if (passengerType === 3) {
        newObject.BaseFare += fare.BaseFare / passengerCount;
        newObject.Tax += fare.Tax / passengerCount;
        newObject.YQTax += fare.YQTax / passengerCount;
        newObject.AdditionalTxnFeePub += fare.AdditionalTxnFeePub / passengerCount;
        newObject.AdditionalTxnFeeOfrd += fare.AdditionalTxnFeeOfrd / passengerCount;
        newObject.PublishedFare = newObject.BaseFare + newObject.Tax + newObject.YQTax + newObject.AdditionalTxnFeePub + newObject.OtherCharges;
        newObject.OfferedFare = newObject.PublishedFare - newObject.Discount;
        newObject.TdsOnCommission = (newObject.BaseFare + newObject.Tax) * 0.01; // Assuming 1% commission
        newObject.TdsOnPLB = newObject.PublishedFare * 0.02; // Assuming 2% PLB
        newObject.TdsOnIncentive = newObject.OfferedFare * 0.01; // Assuming 1% incentive
        newObject.ServiceFee = 0;
        infant=newObject;
      }
    });
    
   
    
    console.log('adult',adult);
    console.log('child',child);
    console.log('infant',infant);

    let passengers = [];
    // console.log('guests', guests);

    for (let i = 0; i < guests.length; i++) {
      let dob=new Date(guest[i].personalInfo.Age)
      if (guests[i].personalInfo.Age >= 12) {
        const combinedObject = {
          ...guests[i].personalInfo,
          PaxType: 1,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2, // Overwrite Gender
          Fare: adult,
          IsLeadPax:true,
        };
        
        passengers.push(combinedObject);
      } else if (guests[i].personalInfo.Age > 2) {
        const combinedObject = {
          ...guests[i].personalInfo,
          PaxType:2,
          GuardianDetails:guests[i].guardianDetails,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: child,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      } else if(guests[i].personalInfo.Age <=2 && calculateAgeAtEndDate(dob,trip.end_date)>2 ) {
        const combinedObject = {
          ...guests[i].personalInfo,
          PaxType:2,
          GuardianDetails:guests[i].guardianDetails,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: child,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      }else{
        const combinedObject = {
          ...guests[i].personalInfo,
          PaxType:3,
          GuardianDetails:guests[i].guardianDetails,
          // ...guests[i].ssr,
          Gender: guests[i].personalInfo.Gender === 'Male' ? 1 : 2,
          Fare: infant,
          IsLeadPax:false
        };
        passengers.push(combinedObject);
      }
    }

    const payload = {
      ResultIndex: resultIndex,
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      TraceId: traceId,
      Passengers: passengers,
    };

    console.log(payload);
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket',payload);
    console.log(data)
    if (data.Response.Response && data.Response.Response.FlightItinerary) {
      const ticketDetails = data.Response.FlightItinerary.Passenger.map(item => ({
        Ticket: item.Ticket,
        firstName: item.FirstName,
        lastName: item.LastName
      }));
      
      const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
      const existingData = (await updatedItineraryRef.get()).data();
      let flightDetails = existingData && existingData.flight_details ? existingData.flight_details : {};
      
      flightDetails.ticket_details = ticketDetails;
      
      await updatedItineraryRef.update({
        flight_details: flightDetails
      });
      
     
    }
    

    res.status(200).json({ success: true,data })
  } catch (error) {
    console.error("Error getting document:", error.message);
    return res.status(400).json({ error: "Error getting document" });
  }
});
router.post('/ticketNonLCC', async (req, res) => {
  try {
    const { flightToken, traceId } = req.body;
    let guests = [];
    let bookingDetails;

    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
    
    // Wait for the promise to resolve
    const doc = await itineraryRef.get();

    if (doc.exists) {
      guests = doc.data().passenger_details;
      bookingDetails = doc.data().flight_details.booking_details;
    } else {
      console.log("No such document!");
    }

    const payload = {
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      TraceId: traceId,
      PNR: bookingDetails.PNR,
      BookingId: bookingDetails.BookingId
    };

    const { data } = await axios.post("http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Ticket", payload);
    console.log('nonLcc',data)
 

    if (data.Response.Response && data.Response.Response.FlightItinerary && data.Response.Response.FlightItinerary.Passenger) {
      const ticketDetails = data.Response.FlightItinerary.Passenger.map(item => ({
        Ticket: item.Ticket,
        firstName: item.FirstName,
        lastName: item.LastName
      }));
      
      const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
      const existingData = (await updatedItineraryRef.get()).data();
      let flightDetails = existingData && existingData.flight_details ? existingData.flight_details : {};
      
      flightDetails.ticket_details = ticketDetails;
      
      await updatedItineraryRef.update({
        flight_details: flightDetails
      });
      
     
    }
    

    res.status(200).json({ success: true,data });
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});


router.post('/getFlightBookingDetails',async(req,res)=>{
  const {flightToken}=req.body;
  const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  let bookingDetails;
  // Wait for the promise to resolve
  const doc = await itineraryRef.get();

  if (doc.exists) {
    guests = doc.data().passengers;
    bookingDetails = doc.data().flight_details.booking_details;
  } else {
    console.log("No such document!");
  }

  const payload={
    TokenId:flightToken,
    EndUserIp:"49.43.88.155",
    BookingId:bookingDetails.BookingId,
    PNR:bookingDetails.PNR
  }
console.log(payload)
  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetBookingDetails',payload);
    console.log(data);
    if(data.Response.FlightItinerary.Passenger && data.Response.FlightItinerary.Passenger[0].Ticket){
      let tickets=[];
      data.Response.FlightItinerary.Passenger.map((item)=>{
        tickets = data.Response.FlightItinerary.Passenger.map(item => ({
          Ticket: item.Ticket,
          firstName: item.FirstName,
          lastName: item.LastName
        }));
      })

      const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
      const existingData = (await updatedItineraryRef.get()).data();
      let flightDetails = existingData && existingData.flight_details ? existingData.flight_details : {};
    
      flightDetails.ticket_details = tickets;
    
      await updatedItineraryRef.update({
        flight_details: flightDetails
      });
    

    }
    return res.send(data);
  }catch(error){
    console.log(error.message)
  }
})

router.post('/releasePNR',async(req,res)=>{
  const {flightToken}=req.body
  const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  const bookingId=(await itineraryRef.get()).data().flight_details.booking_details.BookingId;
  const source=fareQuote.Source;

  const payload={
    EndUserIp:"49.43.88.155",
    TokenId:flightToken,
    BookingId:bookingId,
    Source:source
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/ReleasePNRRequest',payload);
    console.log(data)
    return res.send(data)
  }catch(error){
    console.log(error);
  }
  

})

router.post('/getCancelCharges',async(req,res)=>{
  const {flightToken,requestType}=req.body
  const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  const bookingId=(await itineraryRef.get()).data().flight_details.booking_details.BookingId;

  const payload={
    EndUserIp:"49.43.88.155",
    TokenId:flightToken,
    BookingId:bookingId,
    RequestType:requestType
  }

  try{
    const {data}=await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges',payload)
    console.log(data)
    return res.send(data)
  }catch(error){
    console.log(error)
  }
})

router.post('/sendChangeRequest', async (req, res) => {
  try {
    const { flightToken, requestType, cancellationType, remarks } = req.body;
    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
    
    const itineraryData = await itineraryRef.get();
    const bookingId = itineraryData.data().flight_details.booking_details.BookingId;

    const tickets = itineraryData.data().flight_details.ticket_details.map((item) => {
      return item.TicketId;
    });
    let changeRequestId=[]

    const payload = {
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      BookingId: bookingId,
      RequestType: requestType,
      CancellationType: cancellationType,
      Remarks: remarks,
      // TicketId: tickets,
      // Sectors: sectors
    };
    console.log(payload)
    const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SendChangeRequest', payload);
    
    console.log(data);
    
    if(data.Response.TicketCRInfo){
      data.Response.TicketCRInfo.map((item)=>{
        changeRequestId.push(item.ChangeRequestId)
      })
      const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
      const existingData = (await updatedItineraryRef.get()).data();
      let flightDetails = existingData && existingData.flight_details ? existingData.flight_details : {};
    
      flightDetails.changeRequestId = changeRequestId;
    
      await updatedItineraryRef.update({
        flight_details: flightDetails
      });
    }


    return res.send(data); // You may want to send the response back to the client

  } catch (error) {
    console.log(error);
    res.status(500).send(error.message); // Handle error and send an appropriate response
  }
});
router.post('/sendChangeRequestPartial', async (req, res) => {
  try {
    const { flightToken, requestType, cancellationType, remarks, sectors } = req.body;
    const itineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
    
    const itineraryData = await itineraryRef.get();
    const bookingId = itineraryData.data().flight_details.booking_details.BookingId;

    const tickets = itineraryData.data().flight_details.ticket_details.map((item) => {
      return item.Ticket.TicketId;
    });
    let changeRequestId=[]
     // Create a new array with the desired structure, excluding cityName
    //  const sanitizedSectors = sectors.map(({ Origin, Destination }) => ({ Origin, Destination }));
    const sampleSectors=[{Origin:'ZRH',Destination:'VCE'}]

    const payload = {
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      BookingId: bookingId,
      RequestType: requestType,
      CancellationType: cancellationType,
      Remarks: remarks,
      TicketId: tickets,
      Sectors: sampleSectors
    };
    console.log(payload)
    const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/SendChangeRequest', payload);
    
    console.log(data);
    
    if(data.Response.TicketCRInfo){
      data.Response.TicketCRInfo.map((item)=>{
        changeRequestId.push(item.ChangeRequestId)
      })
      const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
      const existingData = (await updatedItineraryRef.get()).data();
      let flightDetails = existingData && existingData.flight_details ? existingData.flight_details : {};
    
      flightDetails.changeRequestId = changeRequestId;
    
      await updatedItineraryRef.update({
        flight_details: flightDetails
      });
    }


    return res.send(data); // You may want to send the response back to the client

  } catch (error) {
    console.log(error);
    res.status(500).send(error.message); // Handle error and send an appropriate response
  }
});


router.post('/getChangeRequest', async (req, res) => {
  const { flightToken } = req.body;
  const updatedItineraryRef = db.collection("package_data").doc('QNHo0JCIB4bDXBSNqKo9');
  const requestId = (await updatedItineraryRef.get()).data().flight_details.changeRequestId;
  let responseArray = [];

  // Use map to create an array of Promises
  const requests = requestId.map(async (item) => {
    const payload = {
      EndUserIp: "49.43.88.155",
      TokenId: flightToken,
      ChangeRequestId: item
    };

    try {
      const { data } = await axios.post('http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetChangeRequestStatus', payload);
      console.log(data);
      responseArray.push(data);
    } catch (error) {
      console.log(error);
    }
  });

  try {
    // Wait for all Promises to resolve using Promise.all
    await Promise.all(requests);
    // Now, all requests have completed, and responseArray is populated
    return res.send(responseArray);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
