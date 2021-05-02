import { Component, enableProdMode } from "@angular/core";
import { Meta } from "@angular/platform-browser";
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationExtras,
  Router
} from "@angular/router";
import { deleteCookie, getCookie, setCookie } from "./cookies";
import { firebaseHelper } from "./firebaseHelper";
// Set the configuration for your app
// TODO: Replace with your app's config object

var themebtn;
var isDarkMode;
if (getCookie("isDarkMode") == undefined) {
  isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
} else {
  isDarkMode = getCookie("isDarkMode") == "true";
}

UpdateUI();
@Component({
  selector: "my-app",
  //templateUrl: "./views/knowledge/knowledge.template",
  //templateUrl: "./views/projects/projects.template",
  //templateUrl: "./views/home/home.template",
  //templateUrl: "./views/notfound/notfound.template",
  //templateUrl: "./views/view/view.template",
  //templateUrl: "./views/tempo.template",
  //templateUrl: "./views/login/login.template",
  //templateUrl: "./views/editor/editor.template",
  templateUrl: "./app.template",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  show: boolean = false;
  public deploymentName: any;
  showModal() {
    this.show = !this.show;
  }
  fnAddDeploytment() {
    alert(this.deploymentName);
  }
  //DEBUG FOR EditorViewComponent
  validTypes = [
    {
      type: "title",
      icon: "paragraph",
      value: "Title",
      blank: {
        content: ""
      }
    },
    {
      type: "reeee",
      icon: "paragraph",
      value: "Title",
      blank: {
        content: ""
      }
    }
  ];
  loaded = true;
  notfound = false;
  videoUrl = "";
  Title = "Crave";
  Subtitle = "food delivery app!";
  list = [
    { type: "paragraph", content: "asdasdasdreeeeee" },
    {
      type: "pre",
      content: `public void reee(){
      asd();
    }`
    }
  ];
  Thumbnail =
    "https://firebasestorage.googleapis.com/v0/b/deez-portfolio.appspot.com/o/Cravelowres.png?alt=media&token=843bbfeb-1cc0-4132-b9af-a5c75ee46c6c";
  //END
  private firebasehelper: firebaseHelper = firebaseHelper.getInstance();
  userprofile;
  constructor(
    private metaService: Meta,
    private router: Router,
    private route: ActivatedRoute
  ) {
    router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        var tmp: boolean =
          val.url.toString().includes("/projects") &&
          !(
            val.url.toString().includes("/view") ||
            val.url.toString().includes("/edit")
          );
        if (this.ShowSearchbar != tmp) {
          this.ShowSearchbar = tmp;
        }
        if (this.ShowSearchbar) {
          this.searchbar = this.route.snapshot.queryParams.Search;
        }
      }
    });
  }
  searchbar;
  ShowSearchbar = false;
  Date = "1";
  Timeperiod = "month";
  themebtn = themebtn;
  ngOnInit() {
    this.firebasehelper.getAuth().onAuthStateChanged(user => {
      if (user) {
        this.userprofile = user.photoURL;
      } else {
        this.userprofile =
          "https://firebasestorage.googleapis.com/v0/b/deez-portfolio.appspot.com/o/default-user.png?alt=media&token=dca65cb1-3d4f-48ff-8194-a6db81b5585f";
      }
    });
  }
  myScript() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      this.themebtn = "fa-sun-o";
    } else {
      this.themebtn = "fa-moon-o";
    }
    UpdateUI();
  }
  setCanScale();
  public setCanScale(): void {
    this.metaService.updateTag(
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0, user-scalable=yes"
      },
      "name=viewport"
    );
  }
  search() {
    let navigationExtras: NavigationExtras = {
      queryParams: { Search: this.searchbar }
    };
    // Navigate to the login page with extras
    this.router.navigate(["/projects"], navigationExtras);
  }
}

/*FIX:Lazy -> idk wtf is happening, apparently i need 2 of these because if its outside the export class 
it only updates on startup and if its inside it changes the icon when being toggled*/
//solution put in onInit i think?
if (isDarkMode) {
  themebtn = "fa-sun-o";
} else {
  themebtn = "fa-moon-o";
}
function UpdateUI() {
  if (isDarkMode) {
    document.body.className = "dark";
  } else {
    document.body.className = "light";
  }
  setCookie("isDarkMode", String(isDarkMode));
}
