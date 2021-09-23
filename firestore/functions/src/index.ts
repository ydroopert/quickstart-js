import * as functions from "firebase-functions";
import admin = require("firebase-admin");
import * as util from "util";
import {DocumentSnapshot} from "firebase-functions/v1/firestore";

const app = admin.initializeApp();
const firestore = app.firestore();

export const getFavorites_v0 = functions.https.onCall(async (data, context)=> {
  const userId = data.uid;
  if (userId) {
    console.log(`getting favorites for ${userId}`);
    const userDoc = await firestore.doc(`users/${userId}`).get();
    const userData = userDoc.data();
    console.log(util.inspect(userData))
    if (!userData) {
      console.log('No favorites')
      return[];
    }
    const favorites = userData.favorites
    const fetchPromises: Promise<DocumentSnapshot>[] = [];
    favorites.forEach((restId: String) => {
      console.log(`getting data from ${restId}`);
      const p = firestore.doc(`restaurants/${restId}`).get();
      fetchPromises.push(p);
    });
    const snapshots = await Promise.all(fetchPromises)
    const responseArray = snapshots.map((snapshot)=>{
      const snapData = snapshot.data();
      if(snapData){
      snapData['.id'] = snapshot.id;
    }
      return snapData
    }).filter((item)=> item);
    console.log('fetch'+(util.inspect(responseArray)));
    return responseArray;
  } else {
    console.log('No UserId')
    return [];
  }
})