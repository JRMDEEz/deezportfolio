import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { firebaseHelper, SignInProvider } from "../../firebaseHelper";

@Component({
  selector: "account",
  templateUrl: "account.template"
})
export class AccountViewComponent {
  user;
  loaded = false;
  private firebasehelper: firebaseHelper = firebaseHelper.getInstance();
  ngOnInit() {
    this.firebasehelper.getAuth().onAuthStateChanged(user => {
      this.loaded = true;
      this.user = user;
    });
  }

  signIn(signInProvider: SignInProvider) {
    this.loaded = false;
    this.firebasehelper
      .signIn(signInProvider)
      .then(result => {
        this.loaded = true;
      })
      .catch(error => {
        this.loaded = true;
        console.log(error);
      });
  }
  signOut() {
    this.firebasehelper.signOut().then(result => {
      this.loaded = true;
    });
  }
}
