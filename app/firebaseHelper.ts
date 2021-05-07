// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/auth';
import { DocumentSnapshot } from '@angular/fire/firestore';
import { forEach } from '@angular/router/src/utils/collection';
import { setCookie, getCookie, deleteCookie } from './cookies';
import { v4 as uuidv4 } from 'uuid';
const firebaseConfig = {
  apiKey: 'AIzaSyCo_xoY3n6_zNkiDfamK04NadtJuOwF0ek',
  authDomain: 'deez-portfolio.firebaseapp.com',
  projectId: 'deez-portfolio',
  storageBucket: 'deez-portfolio.appspot.com',
  messagingSenderId: '187811856791',
  appId: '1:187811856791:web:2ef7ca054daf518dd584d2',
  measurementId: 'G-8DDFK8VWEB'
};

export class firebaseHelper {
  private db: firebase.firestore.Firestore;
  private app;
  static instance: firebaseHelper;
  startup = true;
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
          console.log('cache success!');
        })
        .catch(err => {
          console.log(err.code);
          if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
          } else if (err.code == 'unimplemented') {
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
  uploadFile(projectId, File: File): firebase.storage.UploadTask {
    var fileName =
      uuidv4() +
      File.name
        .split('.')
        .pop()
        .toLowerCase();
    console.log('UPLOAD ID: ' + fileName);
    var fbStoragePath = projectId + '/' + fileName;
    var storageRef = firebase
      .storage()
      .ref()
      .child(fbStoragePath);
    // Upload file and metadata to the object 'images/mountains.jpg'
    return storageRef.put(File);
  }
  downloadFilefromHTTPS(fbPath) {
    var httpsReference = firebase.storage().refFromURL(fbPath);
    return httpsReference.getDownloadURL();
  }
  getAuth() {
    return firebase.auth();
  }
  //FIX PRIVILAGES
  getProject(projectId: string) {
    return this.getDocument(
      this.db.collection('Projects').doc(projectId),
      true
    );
  }
  getProjects() {
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        var query: firebase.firestore.Query = this.db.collection('Projects');
        if (priv == Privilages.Admin) {
          this.isPrivateDocsinCahce().then(isThere => {
            //gets all documents if theres no cache of private projects
            //it gets the updated private and public projeects at the same time but only once thuus saving read count
            this.getDocumentsQuery(query, isThere)
              .then(result => {
                console.log('CACHE: ' + result.metadata.fromCache);
                resolve(result);
              })
              .catch(err => {
                reject(err);
              });
          });
        } else {
          this.getDocumentsQuery(query.where('publicView', '==', true), true)
            .then(result => {
              console.log('CACHE: ' + result.metadata.fromCache);
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
          this.db
            .collection('Admins')
            .get({ source: 'cache' })
            .then(offresult => {
              this.getDocument(
                this.db.collection('Admins').doc(user.uid),
                !offresult.empty
              ).then((result: firebase.firestore.DocumentSnapshot) => {
                if (result.exists) {
                  resolve(Privilages.Admin);
                }
                resolve(Privilages.User);
              });
            });
        }
      });
    });
  }
  searchProjcets(search) {
    var Search = search.toLowerCase();
    return new Promise((resolve, reject) => {
      this.getPrivilages().then(priv => {
        console.log('PRIVILAGE: ' + priv);
        var query: firebase.firestore.Query = this.db
          .collection('Projects')
          .orderBy('Searchterm')
          .startAt(Search)
          .endAt(Search + '~');
        if (priv != Privilages.Admin) {
          this.getDocumentsQuery(query.where('publicView', '==', true), false)
            .then(result => {
              resolve(result);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          this.getDocumentsQuery(query, false)
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
    return this.db.collection('Projects').add({
      Title: title,
      publicView: false,
      Searchterm: title.toLowerCase(),
      updatedAt: firebase.firestore.Timestamp.now().toMillis(),
      Thumbnail:
        'https://www.publichealthnotes.com/wp-content/uploads/2020/03/project-planning-header@2x.png',
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
      if (item.type != 'image') {
        item.content.replaceAll(
          `
      `,
          '\n'
        );
      }
    });
    return this.db
      .collection('Projects')
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
      //sort of ok optimization to save read count
      if (smartCacheOn) query.where('updatedAt', '>', this.getUpdatedAt());
      query
        .get()
        .then(result => {
          if (smartCacheOn) {
            query
              .get({ source: 'cache' })
              .then(offresult => {
                console.log('SMART CACHE: ' + offresult.metadata.fromCache);
                resolve(offresult);
                this.setUpdatedAt();
              })
              .catch(err => {
                reject(err);
              });
          } else {
            console.log('SMART CACHE OFF: ' + result.metadata.fromCache);
            resolve(result);
            this.setUpdatedAt();
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  getUpdatedAt() {
    var updatedAt = getCookie('updatedAt');
    if (updatedAt == undefined) updatedAt = '0';
    return parseInt(updatedAt);
  }
  setUpdatedAt() {
    setCookie(
      'updatedAt',
      firebase.firestore.Timestamp.now()
        .toMillis()
        .toString()
    );
  }
  getDocument(docref: firebase.firestore.DocumentReference, smartCacheOn) {
    return new Promise((resolve, reject) => {
      //saves read count by allowing to only update document if its a direct link
      var options = {};
      if (!this.startup && smartCacheOn) {
        options = { source: 'cache' };
        this.startup = false;
      }
      docref
        .get(options)
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
        .collection('Projects')
        .where('publicView', '==', false)
        .get({ source: 'cache' })
        .then(result => {
          resolve(!result.empty);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  getFile(filePath) {
    return filePath.substr(filePath.lastIndexOf('\\') + 1).split('.')[0];
  }

  getoutputExtension(Filepath) {
    return Filepath.split('.')[1];
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
