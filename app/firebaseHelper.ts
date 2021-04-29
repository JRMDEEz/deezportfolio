// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { DocumentSnapshot } from "@angular/fire/firestore";
import { forEach } from "@angular/router/src/utils/collection";
export const firebaseConfig = {
  apiKey: "AIzaSyCo_xoY3n6_zNkiDfamK04NadtJuOwF0ek",
  authDomain: "deez-portfolio.firebaseapp.com",
  projectId: "deez-portfolio",
  storageBucket: "deez-portfolio.appspot.com",
  messagingSenderId: "187811856791",
  appId: "1:187811856791:web:2ef7ca054daf518dd584d2"
};
var getOptions = {};

export class firebaseHelper {
  private db: firebase.firestore.Firestore;
  private app;
  static instance: firebaseHelper;

  static getInstance() {
    if (!firebaseHelper.instance)
      firebaseHelper.instance = new firebaseHelper();
    return firebaseHelper.instance;
  }
  constructor() {
    if (!firebase.apps.length) {
      this.app = firebase.initializeApp(firebaseConfig);
      firebase
        .firestore()
        .enablePersistence()
        .catch(err => {
          console.log(err.code);
          if (err.code == "failed-precondition") {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
          } else if (err.code == "unimplemented") {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
          }
        });
    } else {
      this.app = firebase.app(); // if already initialized, use that one
    }
    this.db = firebase.firestore(this.app);
    firebase.auth().useDeviceLanguage();
    console.log("FIREBASE INIT");
  }
  getAuth() {
    return firebase.auth();
  }
  //FIC PRIVILAGES
  getProject(projectId: string) {
    return this.db
      .collection("Projects")
      .doc(projectId)
      .get(getOptions);
  }
  getProjects() {
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        var dbtmp: firebase.firestore.Query = this.db.collection("Projects");
        if (priv != Privilages.Admin) {
          dbtmp = this.db
            .collection("Projects")
            .where("publicView", "==", true);
        }

        dbtmp
          .get(getOptions)
          .then(result => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }
  getPrivilages() {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user == null) {
          resolve(Privilages.Guset);
          return;
        }
        this.db
          .collection("Admins")
          .doc(user.uid)
          .get(getOptions)
          .then(result => {
            if (result != null) {
              resolve(Privilages.Admin);
              return;
            }
            resolve(Privilages.User);
            return;
          });
      });
    });
  }
  searchProjcets(search) {
    var Search = search.toLowerCase();
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        var dbtmp: firebase.firestore.Query = this.db.collection("Projects");
        if (priv != Privilages.Admin) {
          dbtmp = this.db
            .collection("Projects")
            .where("publicView", "==", true);
        }

        dbtmp
          .orderBy("Searchterm")
          .startAt(Search)
          .endAt(Search + "~")
          .get(getOptions)
          .then(result => {
            resolve(result);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }
  createProject(title) {
    //TODO every newline will be replaced by /n, put content into array,
    return this.db.collection("Projects").add({
      Title: title,
      publicView: false,
      Searchterm: title.toLowerCase(),
      Thumbnail:
        "https://www.publichealthnotes.com/wp-content/uploads/2020/03/project-planning-header@2x.png",
      Content: new Array()
    });
  }
  updateProject(
    projcectId,
    title,
    subtitle,
    thumbnail,
    ytId,
    publicView: boolean,
    _Content: any[]
  ) {
    //TODO every newline will be replaced by /n, put content into array,
    _Content.forEach(item => {
      if (item.type != "image") {
        item.content.replaceAll(
          `
      `,
          "\n"
        );
      }
    });
    return this.db
      .collection("Projects")
      .doc(projcectId)
      .set({
        Title: title,
        Subtitle: subtitle,
        Thumbnail: thumbnail,
        YTid: ytId,
        Searchterm: title.toLowerCase(),
        publicView: publicView,
        Content: _Content
      });
  }
  signIn(signInProvider: SignInProvider) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
          // Existing and future Auth states are now persisted in the current
          // session only. Closing the window would clear any existing state even
          // if a user forgets to sign out.
          // ...
          // New sign-in will be persisted with session persistence.
          var provider;
          switch (signInProvider) {
            case SignInProvider.GoogleAuthProvider:
              provider = new firebase.auth.GoogleAuthProvider();
              /*provider.addScope(
                "https://www.googleapis.com/auth/contacts.readonly"
              );*/
              break;
            case SignInProvider.FacebookAuthProvider:
              provider = new firebase.auth.FacebookAuthProvider();
              break;
          }

          return firebase
            .auth()
            .signInWithPopup(provider)
            .then(result => {
              resolve(result);
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch(error => {
          // Handle Errors here.
          reject(error);
        });
    });
  }
  signOut() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export enum SignInProvider {
  GoogleAuthProvider,
  FacebookAuthProvider
}
export enum Privilages {
  Guset,
  User,
  Admin
}
