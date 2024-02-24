import { Component, OnInit, Input,Output,EventEmitter } from "@angular/core";
import { StoreService } from "src/app/Services/store/store.service";

@Component({
  selector: "app-hotel-info",
  templateUrl: "./hotel-info.component.html",
  styleUrls: ["./hotel-info.component.scss"],
})
export class HotelInfoComponent implements OnInit {
  @Input() hotelOnDisplayDetails;

  // these are being filled in ngOnInit
  hotelFacilitiesArr = [];
  roomsArr = [];
  recommendedRoomCombinationsArr = [];

  data$ = this.store.data$;

  roomArrFromBackend = [];

  finalRoomsArr = [];
  isRecommendedComboSelected = false;

  hotelImagesArr = [];

  isRoomSelectedBool = false;

  @Output() finalRoomsArrChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    console.log(this.hotelOnDisplayDetails);

    this.store.data$.subscribe((data) => {
      // console.log(data.trip.RoomGuests);
      this.roomArrFromBackend = [...data.trip.RoomGuests];
    });

    // this.finalRoomsArr=[...this.roomArrFromBackend]
    this.finalRoomsArr = JSON.parse(JSON.stringify(this.roomArrFromBackend));

    // console.log(this.finalRoomsArr)

    // these three are for display purposes.
    this.getHotelFacilitiesArr();
    this.getRoomArr();
    this.getRecommendedRoomCombinations();

    this.settingFinalRoomsArrByRoomIdx(
      this.hotelOnDisplayDetails?.room?.GetHotelRoomResult?.RoomCombinations
        ?.RoomCombination[0]?.RoomIndex
    );

    this.gethotelImagesArr();

    console.log(this.roomArrFromBackend);

    console.log(this.finalRoomsArr);
  }

  showCarousel:boolean=false

  toShowCarousel(){
    this.showCarousel=!this.showCarousel

  }


  settingFinalRoomsArrByRoomIdx(roomIdxArr: number[]): void {
    console.log(roomIdxArr);
    this.resetRoomsInTempRoomsArr();
    roomIdxArr.forEach((idx) => {
      // console.log(idx)
      let room = this.findRoomThroughRoomIdx(idx);
      // console.log(room)
      // Find the first object without a room and update it
      const objToUpdate = this.finalRoomsArr.find((obj) => obj.room === null);
      // console.log(objToUpdate)
      if (objToUpdate) {
        objToUpdate.room = room;
        objToUpdate.checkInDate=this.hotelOnDisplayDetails.checkInDate
      }

    });

    this.isRecommendedComboSelected = true;

    this.finalRoomsArrChange.emit(this.finalRoomsArr)
    // console.log(this.finalRoomsArr);
  }

  resetRoomsInTempRoomsArr(): void {
    this.finalRoomsArr.forEach((obj) => {
      obj.room = null; // You can use an initial state instead of null if needed
    });
    // console.log(this.finalRoomsArr)
  }

  gethotelImagesArr() {
    this.hotelImagesArr =
      this.hotelOnDisplayDetails.info.HotelInfoResult.HotelDetails.Images;
    return;
  }

  // this is being used in other functions/ not for display purposes.
  findRoomThroughRoomIdx(roomIndex: number) {
    return this.roomsArr.find((particularRoom) => {
      return particularRoom.RoomIndex === roomIndex;
    });
  }

  // global all rooms for the hotel
  getRoomArr() {
    this.roomsArr =
      this.hotelOnDisplayDetails.room.GetHotelRoomResult.HotelRoomsDetails;
    return;
  }

  // functions for displaying in FRONTEND
  getHotelFullName() {
    return this.hotelOnDisplayDetails.search.HotelName;
  }

  getHotelStars() {
    const starsCount = this.hotelOnDisplayDetails.search.StarRating;

    switch (starsCount) {
      case 1:
        return "★";
      case 2:
        return "★★";
      case 3:
        return "★★★";
      case 4:
        return "★★★★";
      case 5:
        return "★★★★★";

      default:
        return "★";
    }
  }

  getHotelFacilitiesArr() {
    this.hotelFacilitiesArr =
      this.hotelOnDisplayDetails?.info?.HotelInfoResult?.HotelDetails?.HotelFacilities;
    return;
  }

  getAdditionalFacilitesNumber() {
    return (
      this.hotelOnDisplayDetails.info.HotelInfoResult.HotelDetails
        .HotelFacilities.length - 5
    );
  }

  getPropertyAddress() {
    return this.hotelOnDisplayDetails?.search?.HotelAddress;
  }

  getRoomInclusions(room: any) {
    // Check if room and room.Inclusion are defined and room.Inclusion is an array

    if (room && room.Inclusion && Array.isArray(room.Inclusion)) {
      const inclusionsArr = room.Inclusion;
      return inclusionsArr.join(" | ");
    } else {
      // Handle the case where room or room.Inclusion is undefined or not an array
      return "No inclusions available";
    }
  }

  // room combination functions

  // this helps in looping the nomber of combos given
  getRecommendedRoomCombinations() {
    this.recommendedRoomCombinationsArr =
      this.hotelOnDisplayDetails.room.GetHotelRoomResult.RoomCombinations.RoomCombination;
    // console.log(this.recommendedRoomCombinationsArr)
    return;
  }

  // heading for each room combination
  getHeadingForRoomCombination(roomCombination) {
    return roomCombination.RoomIndex.length;
  }

  getCombRoomName(roomIndex: number) {
    const room = this.findRoomThroughRoomIdx(roomIndex);
    return room.RoomTypeName;
  }

  getCombRoomInclusions(roomIndex: number) {
    return this.getRoomInclusions(this.findRoomThroughRoomIdx(roomIndex)[0]);
  }

  getCombPrice(roomCombination) {
    // console.log(roomCombination);

    const filteredRooms = this.roomsArr.filter((room) =>
      roomCombination.RoomIndex.includes(room.RoomIndex)
    );
    // console.log(roomCombination.RoomIndex);
    // console.log(filteredRooms);

    let totalPrice = 0;
    filteredRooms.forEach((room) => {
      totalPrice += room.Price.PublishedPriceRoundedOff;
    });

    // console.log(totalPrice);
    return totalPrice;
  }

  getClasses(i: number) {
    if (i == 0) {
    }
    return {
      selectedCombo: this.isRoomSelectedBool,
      notSelectedCombo: !this.isRoomSelectedBool,
    };
  }

  getCurrRoomIdx(): number[] {
    // console.log(this.finalRoomsArr.map((roomObject) => roomObject))
    return this.finalRoomsArr.map((roomObject) => roomObject.room.RoomIndex);
  }

  areArraysEqual(roomCombination): boolean {
    let roomIndexArr = roomCombination.RoomIndex;
    let currRoomIdxArr = this.getCurrRoomIdx();

    if (roomIndexArr.length !== currRoomIdxArr.length) {
      return false;
    }

    for (let i = 0; i < roomIndexArr.length; i++) {
      if (roomIndexArr[i] !== currRoomIdxArr[i]) {
        return false;
      }
    }

    return true;
  }

  // ================================================================================================
  gotCustomizedCombo(data) {
    this.isRecommendedComboSelected = false;

    this.finalRoomsArr = JSON.parse(JSON.stringify(data));
    // this.finalRoomsArr={...data};
    console.log(this.finalRoomsArr);
    this.finalRoomsArrChange.emit(this.finalRoomsArr)

    return;
  }

  // IN FOOTER
  // getCurrentRoomsPrice(){
  //   const selectedRooms

  //   let totalPrice=0;
  //   selectedRooms.forEach(room=>{
  //     totalPrice+=room.Price.PublishedPriceRoundedOff
  //   })

  //   return totalPrice
  // }

  isOpen = true;

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }
}
