import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import Piii = require('piii');
import PiiiFilters = require('piii-filters');

admin.initializeApp()
const firestore = admin.firestore

const piii = new Piii({
    filters: [
      ...Object.values(PiiiFilters)
    ]
});

export const onMessageCreated = functions.firestore.document('messages/{messageId}').onCreate(async (snapshot, context) => {
    const uid = snapshot.data()?.userId
    if (!uid) {
        return snapshot.ref.delete()
    }

    const user = await firestore()
        .collection('users')
        .doc(uid)
        .get()

    const data = user.data() || {}
    console.log(`The data: ${JSON.stringify(data)}`)

    if (!data) return snapshot.ref.delete()

    const { displayName, photoURL } = data
    return snapshot.ref.set({
        userId: uid,
        sender: displayName,
        picture: photoURL || null,
        content: piii.filter(snapshot.data()?.content || ''),
        createdAt: firestore.FieldValue.serverTimestamp()
    }, { merge: true })
})


