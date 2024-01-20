import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  Firestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  Timestamp,
  setDoc,
  onSnapshot,
} from "@angular/fire/firestore";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  Auth,
  ConfirmationResult,
  UserCredential,
  user,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "@angular/fire/auth";
import { UserModel } from "../model/user-model";
import { getuid } from "process";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  userModel: UserModel | null = null;
  phoneNumber: any;
  reCaptchaVerifier!: any;
  confirmationResult!: ConfirmationResult;
  user: any;
  isLoggedIn = false;


  errorCodeMessages: { [key: string]: string } = {
    "auth/user-not-found": "User not found with this email address",
    "auth/wrong-password": "Wrong Password. Please enter correct password.",
    "auth/email-already-in-use":
      "Email Address already used by another user. Please use different address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Invalid Email Address",
  };

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore,
    private db: Firestore
  ) {
    onAuthStateChanged(
      auth,
      (user) => {
        if (user !== null) {
          console.log(">>> User is already signed");
          this.fetchUserDetailsFromFirestore(user.uid);
          this.getUserDetailsFromFirestore(user.uid)
        } else {
          console.log(">>> User is not sign in");
          this.userModel = null;
        }
      },
      (error) => {
        console.log(error);
      }
    );
    // this.getUserDetailsFromFirestore();

  }

  loginUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<UserCredential> {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, email, password)
        .then((resp: UserCredential) => {
          this.router.navigate(["/"]);
          this.fetchUserDetailsFromFirestore(resp.user.uid);
          resolve(resp);
        })
        .catch((error) =>
          reject(
            this.errorCodeMessages[error.code] ??
              "Something went Wrong. Please Try Again..."
          )
        );
    });
  }

  registerUser({
    name,
    email,
    password,
  }: {
    name: string;
    password: string;
    email: string;
  }): Promise<UserCredential> {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, email, password)
        .then((resp: UserCredential) => {
          this.router.navigate(["/"]);
          this.saveUserDetailsToFirestore({ name, email, password });
          // this.saveUserToFirestore({ name, email, password, authId: resp.user.uid })
          resolve(resp);
        })
        .catch((error) =>
          reject(
            this.errorCodeMessages[error.code] ??
              "Something went Wrong. Please Try Again..."
          )
        );
    });
  }

  // made by hemant
  async saveUserDetailsToFirestore({
    name,
    email,
    password,
  }: {
    email: string;
    password: string;
    name: string;
  }) {
    const uid = await this.getUserUid();
    console.log(uid);

    if (uid) {
      let userDetails = {
        name,
        email,
        password,
        created_on: Timestamp.now(),
      };

      const docRef = doc(
        this.firestore,
        "users",
        `${uid}`,
        "user_details",
        "details"
      );
      await setDoc(docRef, userDetails);
    } else {
      console.log("User not authenticated");
    }
  }

  // \made by hemant
  async getUserUid() {
    return new Promise<string>((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        if (user) {
          const uid = user.uid;
          unsubscribe(); // Unsubscribe to stop listening for changes once the UID is obtained
          console.log("reached auth service ")
          resolve(uid);
        } else {
          unsubscribe(); // Unsubscribe if the user is not present
          resolve(null);
        }
      });
    });
  }

  async getUserDetailsFromFirestore(uid:string) {
 

    if (uid) {
      const userDocRef = doc(
        this.firestore,
        "users",
        `${uid}`,
        "user_details",
        "details"
      );

      const unsubscribe = onSnapshot(userDocRef, (user) => {
        if (user.exists()) {
          // console.log(user.data());
          unsubscribe();
        
          return user.data();
        } else {
          unsubscribe();
          console.log("user details not present");
          return "user details not present";
        }
      });
    } else {
      console.log("error in getting the uid");
    }
  }


 async getUserName(uid:string){


  const userDocRef=doc(this.firestore,"users",`${uid}`,"user_details","details" );

  const userDocSnap=await getDoc(userDocRef);

  if(userDocSnap.exists()){

    return userDocSnap.data().name;
  }
  else{
    return "No user exists"
  }


 }





















  signoutCurrentUser() {
    this.auth.signOut();
  }

  saveUserToFirestore({
    name,
    email,
    authId,
    password,
  }: {
    name: string;
    email: string;
    authId: string;
    password: string;
  }) {
    let userObj = {
      name,
      email,
      authId,
      password,
      userId: doc(collection(this.firestore, "Admin-user")).id,
      createdOn: Timestamp.now(),
      active: true,
    };
    let docRef = doc(this.firestore, `Admin-user/${userObj.userId}`);
    setDoc(docRef, { ...userObj }, { merge: true });
  }

  fetchUserDetailsFromFirestore(authId: string) {
    let queryRef = query(
      collection(this.firestore, "Admin-user"),
      where("authId", "==", authId)
    );

    const unsubscribe = onSnapshot(queryRef, (values) => {
      if (values.docs.length === 0) {
        // If user not found then there is no need snapshot
        // for viewing changes so we here unsubscribing the subscribe
        unsubscribe();
      } else {
        this.userModel = { ...(values.docs[0].data() as UserModel) };
        console.log(this.userModel);
      }
    });
  }

  listenForAuthStateChanges(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        // User is signed in
        this.isLoggedIn = true;
      } else {
        // User is signed out
        this.isLoggedIn = false;
      }
    });
  }

  async loginWithPhoneNumber(phoneNumber: string): Promise<any> {
    // try {

    const docRef = doc(this.db, "numbers", "numbers");
    const phoneNumbersList: string[] =
      ((await getDoc(docRef)).data() ?? {})["phoneNumbersList"] ?? [];
    const numberExists = phoneNumbersList.some(
      (element) => element === phoneNumber
    );

    if (numberExists) {
      // this.sendOtp();
      // this.isLoggedIn = true;
    } else {
      throw new Error("Number does not exist");
    }
  }

  sendOtp(phoneNumber: string): Promise<any> {
    const appVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        // 'callback': (response) => {
        //   // reCAPTCHA solved, allow signInWithPhoneNumber.
        //   // ...
        // },

        // 'expired-callback': () => {
        //   // Response expired. Ask user to solve reCAPTCHA again.
        //   // ...
        // }
      },
      this.auth
    );
    return new Promise((resolve, reject) => {
      return signInWithPhoneNumber(
        this.auth,
        "+91" + phoneNumber,
        appVerifier
      ).then(
        (confirmationResult) => {
          // Save the confirmation result for later use
          this.confirmationResult = confirmationResult;
          resolve(confirmationResult);
        },
        (error) => {
          console.error("Error sending OTP:", error);
          reject(error);
        }
      );
    });
  }

  verifyOtp(otp: string): Promise<any> {
    console.log(otp);

    if (this.confirmationResult !== null) {
      return this.confirmationResult
        .confirm(otp)
        .then((userCredential: UserCredential) => {
          // User successfully verified
          const user = userCredential.user;
          this.isLoggedIn = true;
          return user;
        })
        .catch((error: any) => {
          console.error("Error verifying OTP:", error);
          throw error;
        });
    } else {
      throw new Error("Confirmation result not found in local storage.");
    }
  }

  signOut(): Promise<void> {
    this.isLoggedIn = false;
    return this.auth.signOut();
  }

  getIsLoggedIn() {
    return this.isLoggedIn;
  }
}
