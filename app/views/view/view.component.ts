import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { firebaseConfig } from "../../firebaseConfig";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { forEach } from "@angular/router/src/utils/collection";
import { firebaseHelper } from "../../firebaseHelper";
var getOptions = {};
@Component({
  selector: "view",
  /*template: ``*/
  templateUrl: "/view.template"
})
export class ViewComponent {
  notfound = false;
  loaded = false;
  videoUrl = "";
  Title = "";;
  Subtitle = "";;
  Thumbnail = "";;
  ID;
  list = [];
  privilages;
  private firebaseHelper: firebaseHelper = firebaseHelper.getInstance();
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}
  ngOnInit() {
    this.ID = this.route.snapshot.queryParams.id;
    this.firebaseHelper.getProject(this.ID).then(doc => {
      this.loaded = true;
      if (doc.exists) {
        this.Title = doc.data().Title;
        this.Subtitle = doc.data().Subtitle;
        if (doc.data().YTid != "" && doc.data().YTid != null) {
          this.updateVideoUrl(doc.data().YTid);
        } else {
          this.Thumbnail = doc.data().Thumbnail;
        }
        var contentlist = doc.data().Content;
        if (contentlist != null)
          contentlist.forEach(item => {
            this.appendItem(item);
          });
      } else {
        this.notfound = true;
        console.log("No such document!");
      }
    });
    this.firebaseHelper.getPrivilages().then(priv => {
      this.privilages = priv;
    });
  }
  appendItem(item) {
    this.list.push(item);
  }
  updateVideoUrl(id: string) {
    // Appending an ID to a YouTube URL is safe.
    // Always make sure to construct SafeValue objects as
    // close as possible to the input data so
    // that it's easier to check if the value is safe.
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      "https://www.youtube.com/embed/" + id
    );
  }
  editProject() {}
  updateBackground(bkg: string);
  /*makeSanitize(str: any) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }*/
  splitAtIndex(value, index) {
    return value.substring(0, index) + "," + value.substring(index);
  }
}
