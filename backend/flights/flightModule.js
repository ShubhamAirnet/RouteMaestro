const express = require("express");
const router = express.Router();
const db = require("../firebaseConfig");
const axios = require("axios");

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
        console.log(data)
      if (data.Response.Error.ErrorCode !== 0) {
        res.status(500).json({
          message: ErrorMessage,
        });
      } else {
        const flightArray = await data.Response.Results[0];

        const keyValueArray = [];

        flightArray.forEach((flight) => {
          keyValueArray.push({
            isRefundable: flight.IsRefundable,
            isLCC: flight.IsLCC,
            resultIndex: flight.ResultIndex,
            fare: flight.Fare,
            segments: flight.Segments,
            penaltyCharges: flight.PenaltyCharges,
          });
        });

        // console.log(keyValueArray)

        // const rawDataAsPayload = {
        //   flightsData: keyValueArray, 
        //   timePeriod: timePeriodArray
        // };

        // const { data: optimizedData } = await axios.post(
        //   "http://localhost:4000/flight/assigningTimePeriodsToFlightSets",
        //   rawDataAsPayload
        // );

        res
          .status(200)
          .json({flightsData: keyValueArray});
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

module.exports = router;
