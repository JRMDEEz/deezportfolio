import { Component, NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { firebaseConfig } from '../../firebaseConfig';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { firebaseHelper, Privilages } from '../../firebaseHelper';
import { ModalContentComponent } from './modal-upload/modal-upload.component';
var getOptions = {};
@Component({
  selector: 'edit',
  /*template: ``*/
  templateUrl: '/editor.template'
})
export class EditorViewComponent {
  //DIALOG inneficient!!
  URLMode = false;
  importedFile;
  //END
  notfound = false;
  loaded = false;
  videoUrl = '';
  YTid = '';
  Title = '';
  Subtitle = '';
  Thumbnail = '';
  list = [];
  ID;
  publicView = true;
  validTypes = [
    {
      name: 'paragraph',
      icon: 'paragraph',
      value: 'Paragraph',
      blank: {
        type: 'paragraph',
        content: 'Type Here'
      }
    },
    {
      name: 'pre',
      icon: 'code',
      value: 'Code',
      blank: {
        type: 'pre',
        content: 'Code Here'
      }
    },
    {
      name: 'image',
      icon: 'picture-o',
      value: 'Image',
      blank: {
        type: 'image',
        content:
          'https://firebasestorage.googleapis.com/v0/b/deez-portfolio.appspot.com/o/img.png?alt=media&token=fd18f021-6877-4456-af34-e4e9587547d2'
      }
    }
  ];
  private firebaseHelper: firebaseHelper = firebaseHelper.getInstance();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}
  ngOnInit() {
    this.ID = this.route.snapshot.queryParams.id;
    this.firebaseHelper.getPrivilages().then(priv => {
      if (priv != Privilages.Admin) {
        this.router.navigate(['/projects/view'], {
          queryParams: { id: this.ID }
        });
      } else {
        this.firebaseHelper.getProject(this.ID).then(doc => {
          this.loaded = true;
          if (doc.exists) {
            this.Title = doc.data().Title;
            this.publicView = doc.data().publicView;
            if (doc.data().Subtitle) this.Subtitle = doc.data().Subtitle;
            if (doc.data().YTid != '' && doc.data().YTid != null) {
              this.YTid = doc.data().YTid;
              this.updateVideoUrl(doc.data().YTid);
            }
            this.Thumbnail = doc.data().Thumbnail;
            var contentlist = doc.data().Content;
            if (contentlist != null)
              contentlist.forEach(item => {
                this.appendItem(item);
              });
          } else {
            this.loaded = true;
            this.notfound = true;
            console.log('No such document!');
          }
        });
      }
    });
  }
  //imports image from the dialog

  importFile(file) {
    this.importFile = file;
    console.log(file);
  }
  setView() {
    this.publicView = !this.publicView;
  }
  UploadFile(URLMode) {
    console.log(this.importFile, URLMode);
  }
  blankObject(typeName) {
    let a = this.validTypes.find(item => {
      return item.name == typeName;
    });
    return a.blank;
  }
  appendItem(item) {
    this.list.push(item);
  }
  appendNew(type: string) {
    this.list.splice(0, 0, JSON.parse(JSON.stringify(this.blankObject(type))));
  }
  appendNext(index: number, type: string) {
    if (index >= this.list.length - 1) {
      this.list.push(JSON.parse(JSON.stringify(this.blankObject(type))));
    } else {
      this.list.splice(
        index + 1,
        0,
        JSON.parse(JSON.stringify(this.blankObject(type)))
      );
    }
  }
  saveProject() {
    this.loaded = false;
    this.firebaseHelper
      .updateProject(
        this.ID,
        this.Title,
        this.Subtitle,
        this.Thumbnail,
        this.YTid,
        this.publicView,
        this.list
      )
      .then(() => {
        this.loaded = true;
        console.log('PROJECT UPLOAD SUCCESSFULL');
        this.router.navigate(['/projects/view'], {
          queryParams: { id: this.ID }
        });
      })
      .catch(error => {
        this.loaded = true;
        this.notfound = true;
        console.log(error);
      });
  }
  deleteItem(index) {
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }
  cleanContent(type: string, text: string) {
    var tmp = text;
    if (type != 'image') {
    }
    tmp = text.replaceAll(
      '\\n',
      `
    `
    );
    return tmp;
  }
  updateVideoUrl(id: string) {
    // Appending an ID to a YouTube URL is safe.
    // Always make sure to construct SafeValue objects as
    // close as possible to the input data so
    // that it's easier to check if the value is safe.
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + id
    );
  }
  updateBackground(bkg: string);
  /*makeSanitize(str: any) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }*/
  splitAtIndex(value, index) {
    return value.substring(0, index) + ',' + value.substring(index);
  }
}
