import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { DomSanitizer } from '@angular/platform-browser';
import { firebaseConfig } from '../../firebaseConfig';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { firebaseHelper } from '../../firebaseHelper';
import { Observable } from 'rxjs';
@Component({
  selector: 'projects',
  /*template: `
    <div class="col-md-4 col-sm-5 col-xs-10">
      <div
        class="service-item clickable"
        routerLink="../projects/view"
        [queryParams]="{ id: 'W7b5Ceux34LtlNZpKVCH' }"
      >
        <img
          class="img-responsive"
          src="https://firebasestorage.googleapis.com/v0/b/deez-portfolio.appspot.com/o/Cravelowres.png?alt=media&token=843bbfeb-1cc0-4132-b9af-a5c75ee46c6c"
          style="width:100%"
        />
        <div class="w-100"></div>
        <p><strong>Crave food delivery app</strong></p>
      </div>
    </div>
  `*/
  templateUrl: '/projects.template'
})
export class ProjectsViewComponent {
  public range = [];
  loaded = false;
  privilages;
  notfound = false;
  onSearchParamChangd;
  private firebaseHelper: firebaseHelper = firebaseHelper.getInstance();
  constructor(private route: ActivatedRoute, private router: Router) {}
  ngOnDestroy() {
    this.onSearchParamChangd.unsubscribe();
  }
  ngOnInit() {
    this.onSearchParamChangd = this.route.queryParams.subscribe(search => {
      if (search.Search == undefined) {
        this.getprojects();
      } else {
        this.search(search.Search);
      }
    });
    this.firebaseHelper.getPrivilages().then(priv => {
      this.privilages = priv;
    });
  } //end Oninit
  getprojects() {
    this.loaded = false;
    this.firebaseHelper
      .getProjects()
      .then((querySnapshot: any[]) => {
        this.loaded = true;
        querySnapshot.forEach(doc => {
          this.loaded = true;
          this.add(
            doc.id,
            doc.data().Thumbnail,
            doc.data().Title,
            doc.data().publicView
          );
        });
        return;
      })
      .catch(err => {
        this.loaded = true;
        this.notfound = true;
        console.log('Error getting documents: ', err);
        return;
      });
    return;
  }
  search(search) {
    this.loaded = false;
    this.notfound = false;
    this.clear();
    console.log('searching');
    this.firebaseHelper
      .searchProjcets(search)
      .then(querySnapshot => {
        this.loaded = true;
        querySnapshot.forEach(doc => {
          this.add(
            doc.id,
            doc.data().Thumbnail,
            doc.data().Title,
            doc.data().publicView
          );
        });
      })
      .catch(error => {
        this.loaded = true;
        this.notfound = true;
        console.log('Error getting documents: ', error);
      });
  }
  createProject() {
    this.loaded = false;
    this.notfound = false;
    this.firebaseHelper
      .createProject('New Project')
      .then(doc => {
        this.loaded = true;
        //FIX inject it tho the doc or something...
        this.add(
          doc.id,
          'https://www.publichealthnotes.com/wp-content/uploads/2020/03/project-planning-header@2x.png',
          'New Project',
          false
        );
      })
      .catch(err => {
        this.loaded = true;
        this.notfound = true;
        console.log(err);
      });
  }
  add(id: string, imgthumb: string, title: string, publicView: boolean) {
    this.range.push({
      id: id,
      imgthumb: imgthumb,
      title: title,
      publicView: publicView
    });
  }
  clear() {
    this.range = [];
  }
}
