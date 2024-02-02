const express = require("express");

const app = express();
const cors = require("cors");
const axios = require("axios");

const db = require("./firebaseConfig");

var bodyParser = require("body-parser");
const hotelModule = require("./hotels/hotelModule");
const flightModule = require("./flights/flightModule");



app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

// app.use(express.json());

app.use("/hotel" ,hotelModule)
app.use("/flight" ,flightModule)




app.post("/sendData", async (req, res) => {
  const { flightToken } = req.body;

  // getting from Firestore
  let cities;
  let origin;
  let startDate;

  // here to put the final collection name along witht the itinerary name
  const itineraryRef = db.collection("Demo_Itinerary").doc("usa_itinerary");
  try {
    const itinerary = await itineraryRef.get();

    if (itinerary.exists) {
      // got hte whole itinerary from backend
      cities = itinerary.data().cities;
      origin = itinerary.data().origin;
      startDate = itinerary.data().startDate;

      // from origin to first city in itinerary
      const payload1 = {
        origin: origin,
        destination: cities[0].city,
        startDate: startDate,
        flightToken,
      };

      const trialArray = [];

      const { data: data1 } = await axios.post(
        "http://localhost:4000/searchFlights",
        payload1
      );

      trialArray.push({
        flightData: data1,
        origin: payload1.origin,
        destination: payload1.destination,
        flightDate: payload1.startDate,
      });

      let i = 0;
      let ourDate = startDate;

      const promises = cities.map(async (city) => {
        // this all logic is to create a st
        let daysToAdd = cities[i].nights + 1;

        const initialDate = new Date(ourDate);

        const resultDate = new Date(initialDate);
        resultDate.setDate(resultDate.getDate() + daysToAdd);

        const resultDateString = `${resultDate.getFullYear()}-${(
          resultDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${resultDate
          .getDate()
          .toString()
          .padStart(2, "0")}T${resultDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${resultDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${resultDate
          .getSeconds()
          .toString()
          .padStart(2, "0")}`;

        // this is to assign  final date (from this iteration) as initial date (for next iteration).
        ourDate = resultDateString;

        // this to handle the out of bound error in arrays (As we are making calls for i and i+1)
        // And need to make the return call to origin;
        if (i >= cities.length - 1) {
          const payload2 = {
            origin: cities[cities.length - 1].city,
            destination: origin,
            startDate: resultDateString,
            flightToken,
          };
          const { data: data2 } = await axios.post(
            "http://localhost:4000/searchFlights",
            payload2
          );

          trialArray.push({
            flightData: data2,
            origin: payload2.origin,
            destination: payload2.destination,
            flightDate: payload2.startDate,
          });
        }
        // normally, This will  be executed (except the case for return flight)
        else {
          const payload2 = {
            origin: cities[i].city,
            destination: cities[i + 1].city,
            startDate: resultDateString,
            flightToken,
          };
          i++;

          const { data: data2 } = await axios.post(
            "http://localhost:4000/searchFlights",
            payload2
          );

          trialArray.push({
            flightData: data2,
            origin: payload2.origin,
            destination: payload2.destination,
            flightDate: payload2.startDate,
          });
        }
      });

      await Promise.all(promises);

      res.status(200).json({
        AllFlights: trialArray,
      });
    } else {
      res.status(400).json({
        message: "unable to fetch the itinerary from DB",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "caught error in fetching itinerary",
      error: err,
    });
  }
});

app.post("/searchFlights", async (req, res) => {
  const { origin, destination, startDate, flightToken } = req.body;

  console.log(origin);
  console.log(destination);

  const payload = {
    EndUserIp: "49.43.88.177",
    TokenId: flightToken,
    AdultCount: "4",
    ChildCount: "2",
    InfantCount: "0",
    JourneyType: "3",
    Segments: [
      {
        Origin: "DEL", //DEL ,
        Destination: "MXP", //DXB
        FlightCabinClass: "1",
        PreferredDepartureTime: "2024-02-15T00:00:00",
        PreferredArrivalTime: "2024-02-15T00:00:00",
      },
      // {
      //   Origin: "MXP" , //DEL ,
      //   Destination: "VCE", //DXB
      //   FlightCabinClass: "1",
      //   PreferredDepartureTime: "2024-02-18T00:00:00",
      //   PreferredArrivalTime:"2024-02-18T00:00:00",
      // },
      {
        Origin: "VCE", //DEL ,
        Destination: "FCO", //DXB
        FlightCabinClass: "1",
        PreferredDepartureTime: "2024-02-20T00:00:00",
        PreferredArrivalTime: "2024-02-20T00:00:00",
      },
      {
        Origin: "FCO", //DEL ,
        Destination: "DEL", //DXB
        FlightCabinClass: "1",
        PreferredDepartureTime: "2024-02-22T00:00:00",
        PreferredArrivalTime: "2024-02-22T00:00:00",
      },
    ],
    // Sources: null,
  };

  try {
    const { data } = await axios.post(
      "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search",
      payload
    );

    res.send(data);

    console.log(data);

    // const flightArray = await data.Response.Results[0];

    // const keyValueArray = [];

    // flightArray.map((flight) => {

    //   // console.log(flight.MiniFareRules[0])

    //   if(!flight.MiniFareRules){
    //     keyValueArray.push({
    //       refundable:flight.IsRefundable,
    //       resultIndex: flight.ResultIndex,
    //       publishedFare: flight.Fare.PublishedFare,  //deciding factor for sorting
    //       segments:flight.Segments[0],
    //       fare:flight.Fare,
    //       fareBreakdown:flight.FareBreakdown,
    //       miniFareRules:0
    //     })
    //   }
    //   else{
    //     keyValueArray.push({
    //       refundable:flight.IsRefundable,
    //       resultIndex: flight.ResultIndex,
    //       publishedFare: flight.Fare.PublishedFare,  //deciding factor for sorting
    //       segments:flight.Segments[0],
    //       fare:flight.Fare,
    //       fareBreakdown:flight.FareBreakdown,
    //       miniFareRules:flight.MiniFareRules
    //     })

    //   }

    // })

    // keyValueArray.sort((a, b) => a.publishedFare - b.publishedFare);
    // // res.send(keyValueArray)
    // res.status(200).json(keyValueArray);

    // let newArr=[];

    // keyValueArray.map((flight)=>{
    //   newArr.push(flight)

    // })

    // for( let i =0;i<15;i++){

    //   console.log( keyValueArray[i]);

    //   newArr.push({
    //       segments:keyValueArray[i].segments
    //   })

    // }

    // const bestFareFlight=await flightArray.find( (flight)=>flight.ResultIndex===keyValueArray[0].resultIndex);

    // if(bestFareFlight){

    //   const bestFlightFareBreakdown= bestFareFlight.FareBreakdown;

    //   const bestFlightAdultFareObject= bestFlightFareBreakdown.find((type)=>type.PassengerType===1);

    //   const perAdultPrice=((bestFlightAdultFareObject.BaseFare + bestFlightAdultFareObject.Tax)/bestFlightAdultFareObject.PassengerCount);

    //   console.log(perAdultPrice);
    //   keyValueArray[0]["fare"]=perAdultPrice;

    //   const bestFareFlightSegmentsArray= bestFareFlight.Segments[0];

    //   // for now i am handling the cabin class only for one flight in caseof indirect flights:
    //     const cabinClass=bestFareFlightSegmentsArray[0].CabinClass;
    //     keyValueArray[0]["cabinClass"]=cabinClass;

    //     // =========================================

    //   if(bestFareFlightSegmentsArray.length>1){

    //     keyValueArray[0]["directFlight"]=false;

    //     bestFareFlightSegmentsArray.map(
    //       (segment,i)=>{
    //         console.log(i);
    //         let accumulatedDuration;

    //         keyValueArray[0][i]={
    //           origin:segment.Origin,
    //           destination:segment.Destination,
    //           airline:segment.Airline,
    //           duration:segment.Duration,
    //         }
    //         if(i=== bestFareFlightSegmentsArray.length-1){
    //           accumulatedDuration= segment.AccumulatedDuration;
    //       keyValueArray[0]["accumulatedDuration"]=accumulatedDuration;

    //       }
    //         keyValueArray[0]["numberOfFlights"]=i+1;
    //       }
    //     )

    //   }
    //   else{

    //     console.log("NON STOP FLIGHT");

    //     // did just to maintain the symmetry (b/w direct and indirect flights )
    //     keyValueArray[0]["directFlight"]=false;
    //     keyValueArray[0]["numberOfFlights"]=1;
    //     keyValueArray[0]["accumulatedDuration"]=bestFareFlightSegmentsArray[0].Duration;

    //     keyValueArray[0][0]={
    //       origin:bestFareFlightSegmentsArray[0].Origin,
    //           destination:bestFareFlightSegmentsArray[0].Destination,
    //           duration:bestFareFlightSegmentsArray[0].Duration,
    //           airline:bestFareFlightSegmentsArray[0].Airline,

    //     }
    //   }

    // }

    // res.status(200).json(keyValueArray[0])
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err,
    });
  }
});

app.post("/mutiCitySearchFlights", async (req, res) => {
  const { flightToken } = req.body;
  // getting from Firestore
  // let cities;
  // let origin;
  // let startDate;

  // here to put the final collection name along witht the itinerary name
  // const itineraryRef= db.collection("Demo_Itinerary").doc("usa_itinerary");

  try {
    // const itinerary= await itineraryRef.get();

    // if(itinerary.exists){

    // got the whole itinerary from backend
    // cities=itinerary.data().cities;
    // origin=itinerary.data().origin;
    // startDate=itinerary.data().startDate;

    const segmentsArray = [];
    const origin = "DEL";
    const cities = ["MXP", "VCE", "FCO"];
    const nights = [2, 2, 3];
    const initialOriginDateToDepart = "2024-04-15T00:00:00";

    let ourDate = initialOriginDateToDepart;

    segmentsArray.push({
      Origin: origin,
      Destination: cities[0],
      FlightCabinClass: "1",
      PreferredDepartureTime: initialOriginDateToDepart,
      PreferredArrivalTime: initialOriginDateToDepart,
    });

    let i = 0;

    cities.map((city) => {
      // this all logic is to create a new date after adding the nights to spend in a particular city
      let daysToAdd = nights[i] + 1;

      console.log(daysToAdd);

      const initialDate = new Date(ourDate);

      const resultDate = new Date(initialDate);
      resultDate.setDate(resultDate.getDate() + daysToAdd);

      console.log(resultDate);

      const resultDateString = `${resultDate.getFullYear()}-${(
        resultDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${resultDate
        .getDate()
        .toString()
        .padStart(2, "0")}T${resultDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${resultDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${resultDate
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      console.log(resultDateString);
      // this is to assign  final date (from this iteration) as initial date (for next iteration).
      ourDate = resultDateString;

      if (i >= cities.length - 1) {
        segmentsArray.push({
          Origin: cities[cities.length - 1],
          Destination: origin,
          FlightCabinClass: "1",
          PreferredDepartureTime: resultDateString,
          PreferredArrivalTime: resultDateString,
        });
      } else {
        const currentCity = cities[i];
        const nextCity = cities[i + 1];

        i++;
        segmentsArray.push({
          Origin: currentCity,
          Destination: nextCity,
          FlightCabinClass: "1",
          PreferredDepartureTime: resultDateString,
          PreferredArrivalTime: resultDateString,
        });
      }
    });

    const payload = {
      EndUserIp: "49.43.88.177",
      TokenId: flightToken,
      AdultCount: "4",
      ChildCount: "2",
      InfantCount: "0",
      JourneyType: "3",
      Segments: segmentsArray,
      // Sources: null,
    };

    try {
      console.log(payload);

      console.log("before making call");
      const { data } = await axios.post(
        "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search",
        payload
      );

      console.log(data);
      console.log("hell");
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

      console.log(keyValueArray);
      const rawDataAsPayload = {
        flightSet: keyValueArray,
      };

      const { data: optimizedData } = await axios.post(
        "http://localhost:4000/optimizeSearchResults",
        rawDataAsPayload
      );

      res.status(200).json({ flightsData: optimizedData });
    } catch (error) {
      if (error.response) {
        // The request was made, but the server responded with an error status code
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        // The request was made, but no response was received
        console.error("Request error:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error:", error.message);
      }
      res.send(error);
    }

    // }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Error in catch while fetching data from db",
      error: err,
    });
  }
});

// to send mail
app.post('/sendMsg',async(req,res)=>{

    
  const { uid } = req.body;
  const plan=req.body.formValues.plan;
  const days=req.body.formValues.days;
  const email=req.body.formValues.email;
  const password=req.body.formValues.password;
  const name =req.body.formValues.name;
  const currentDate=Date.now();

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
  
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
      timeZone: 'Asia/Kolkata',
    };
  
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  
    return formattedDate;
  }


  const newData={
    start_date:formatTimestamp(currentDate),
    end_date:formatTimestamp(currentDate+days),
    plan: plan==='Free' ? 'plan/free' : plan==='Basic' ? 'plan/basic' ? plan==='Pro' :'plan/pro':'',
    status:'active',
  }

  if (!uid ) {
    return res.status(400).json({ error: 'Invalid request payload' });
  }

  const userDocRef = db.collection('users_login').doc(uid);
  const planCollectionRef = userDocRef.collection('plan');
  const detailsDocRef = planCollectionRef.doc('details');
  
  try {
    // Check if the 'plan' collection exists
    const planCollectionSnapshot = await planCollectionRef.get();
  
    if (planCollectionSnapshot.empty) {
      // If the 'plan' collection doesn't exist, create it
      await planCollectionRef.add({});
      console.log('plan collection created successfully')
  
      // Now, set the data in the 'details' document
      await detailsDocRef.set(newData);
  
      console.log('Plan collection and details document created successfully');
    } else {
      // If the 'plan' collection exists, only update the 'details' document
      await detailsDocRef.set(newData);
  
      console.log('Details document updated successfully');
    }
  } catch (error) {
    console.error('Error creating or updating details:', error);
    // Handle the error as needed
  }

  console.log('Updated Successfully')



  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'routemaestro@gmail.com',
      pass: 'zkxcykgphqpvdkqe'
    }
  });
  
  
  
  var mailOptions = {
    from: 'routemaestro@gmail.com',
    to: email,
    subject: 'Login Credentials',
    text: `Hi ${name},
        Below are your Login credentials for the RouteMaestro ${plan}
        Email : ${email}
        Password: ${password}
        
        Your ${plan} is valid for only ${days} and your account will be deactivated on ${newData.end_date}.
        You can enjoy your ${plan} and use its featured till the ${newData.end_date}
        
        Thanks
        RouteMaestro Team`
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
   
    return res.status(200).json({ message: "Mail Sent Successfully", success: true });
  } catch (error) {

    return res.status(400).send({ message: "Some Error Occurred", success: false });
  }
  
})

// to create order payment links

app.post("/createOrder", (req, res) => {
  console.log(req.body)
  const {form} = req.body;

  const date = Date.now();

  let order_expiry_time = new Date(date);

  order_expiry_time.setTime(order_expiry_time.getTime() + 20*60 * 1000);

  const options = {
    method: "POST",
    url: "https://sandbox.cashfree.com/pg/orders",
    headers: {
      accept: "application/json",
      "x-api-version": "2022-09-01",
      "content-type": "application/json",

      // testing mode credentials
      "x-client-id": "28085b84a33b52aabe2231d8058082",
      "x-client-secret": "0b9580593f3dd2488da565ba283f94fe13c4ea4c",
    },
    data: {
      customer_details: {
        customer_id:'11',
        customer_email:form.email,
        customer_phone:''+form.phone,
        customer_name:form.name,
      },
      order_meta: {
        return_url:`http://localhost:4200/success/${form.order_id}`,
        payment_methods: "cc,dc,nb,upi,paypal,banktransfer",
      },
      order_id:form.order_id,
      order_amount:form.totalCost,
      order_currency:'INR',
      order_expiry_time, //this is from backend itself
    },
  };

  axios
    .request(options)
    .then((response) => {
      // console.log(response);
      return res.status(200).send({
        success:true,
        message:'Link generated',
        data:response.data
    })
  })
    .catch((error) => {
      console.error(error);
      res.status(401).json({
        message: error,
      });
      console.log("hello");
    });
});







app.listen(4000, (req, res) => {
  console.log("server is connected to port 4000");
});


