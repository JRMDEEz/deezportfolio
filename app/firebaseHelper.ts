// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { DocumentSnapshot } from "@angular/fire/firestore";
import { forEach } from "@angular/router/src/utils/collection";
import { setCookie, getCookie, deleteCookie } from "./cookies";
export const firebaseConfig = {
  apiKey: "AIzaSyCo_xoY3n6_zNkiDfamK04NadtJuOwF0ek",
  authDomain: "deez-portfolio.firebaseapp.com",
  projectId: "deez-portfolio",
  storageBucket: "deez-portfolio.appspot.com",
  messagingSenderId: "187811856791",
  appId: "1:187811856791:web:2ef7ca054daf518dd584d2"
};

export class firebaseHelper {
  private db: firebase.firestore.Firestore;
  private app;
  static instance: firebaseHelper;
  initializing = true;
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
        .then(() => {
          console.log("cache success!");
          this.initializing = false;
        })
        .catch(err => {
          this.initializing = false;
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
  }

  getAuth() {
    return firebase.auth();
  }
  //FIX PRIVILAGES
  getProject(projectId: string) {
    return this.getDocument(
      this.db.collection("Projects").doc(projectId),
      true
    );
  }
  getProjects() {
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        if (priv == Privilages.Admin) {
          console.log("ADMIN");
          this.isPrivateDocsinCahce().then(isThere => {
            //gets all documents if theres no cache of private projects
            //it gets the updated private and public projeects at the same time but only once thuus saving read count
            this.getDocumentsQuery(this.db.collection("Projects"), isThere)
              .then(result => {
                resolve(result);
              })
              .catch(err => {
                reject(err);
              });
          });
        } else {
          this.getDocumentsQuery(
            this.db.collection("Projects").where("publicView", "==", true),
            true
          )
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });
  }
  getPrivilages() {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(user => {
        if (user == null) {
          resolve(Privilages.Guset);
        } else {
          this.getDocument(
            this.db.collection("Admins").doc(user.uid),
            true
          ).then((result: firebase.firestore.DocumentSnapshot) => {
            if (result.exists) {
              resolve(Privilages.Admin);
            }
            resolve(Privilages.User);
          });
        }
      });
    });
  }
  searchProjcets(search) {
    //TODO REFRACTOR!! code duplicate
    var Search = search.toLowerCase();
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        if (priv == Privilages.Admin) {
          this.isPrivateDocsinCahce().then(isThere => {
            //gets all documents if theres no cache of private projects
            //it gets the updated private and public projeects at the same time but only once thuus saving read count
            this.getDocumentsQuery(
              this.db
                .collection("Projects")
                .orderBy("Searchterm")
                .startAt(Search)
                .endAt(Search + "~"),
              isThere
            )
              .then(result => {
                resolve(result);
              })
              .catch(err => {
                reject(err);
              });
          });
        } else {
          this.getDocumentsQuery(
            this.db
              .collection("Projects")
              .where("publicView", "==", true)
              .orderBy("Searchterm")
              .startAt(Search)
              .endAt(Search + "~"),
            true
          )
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        }
      });
    });
  }
  createProject(title) {
    //TODO every newline will be replaced by /n, put content into array,
    return this.db.collection("Projects").add({
      Title: title,
      publicView: false,
      Searchterm: title.toLowerCase(),
      updatedAt: firebase.firestore.Timestamp.now().toMillis(),
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
        updatedAt: firebase.firestore.Timestamp.now().toMillis(),
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
  getDocumentsQuery(query: firebase.firestore.Query, smartCacheOn) {
    return new Promise((resolve, reject) => {
      //$hit optimization to save read count
      if (smartCacheOn) query.where("updatedAt", ">", this.getUpdatedAt());
      query
        .get()
        .then(result => {
          if (smartCacheOn) {
            query
              .get({ source: "cache" })
              .then(offresult => {
                resolve(offresult);
              })
              .catch(err => {
                reject(err);
              });
          } else {
            resolve(result);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  getUpdatedAt() {
    var updatedAt = getCookie("updatedAt");
    if (updatedAt == undefined) updatedAt = "0";
    return parseInt(updatedAt);
  }
  getDocument(docref: firebase.firestore.DocumentReference, smartCacheOn) {
    return new Promise((resolve, reject) => {
      docref
        .get()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  isPrivateDocsinCahce() {
    return new Promise((resolve, reject) => {
      this.db
        .collection("Projects")
        .where("publicView", "==", false)
        .get({ source: "cache" })
        .then(result => {
          resolve(!result.empty);
        })
        .catch(err => {
          reject(err);
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
