import { Component, NgModule } from '@angular/core';
import { Http } from '@angular/http';
import { firebaseConfig } from '../../firebaseConfig';
import firebase from 'firebase/app';
import 'firebase/storage';
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
  //END
  notfound = false;
  ThumbnailView = true;
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
              this.updateVideoUrl(doc.data().YTid);
              this.ThumbnailView = false;
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
  setView() {
    this.publicView = !this.publicView;
  }
  uploading = false;
  uploadPercent = '0%';
  private uploadTask: firebase.storage.UploadTask;
  UploadFile(FileInput, UrlInput, URLMode) {
    if (URLMode) {
      this.Thumbnail = UrlInput;
      console.log(UrlInput);
    } else {
      console.log('FILE MODE');
      this.uploading = true;
      this.uploadTask = this.firebaseHelper.uploadFile(this.ID, FileInput);
      // Listen for state changes, errors, and completion of the upload.
      this.uploadTask.on(
        firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        snapshot => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadPercent = progress + '%';
          console.log('Upload is ' + this.uploadPercent + 'done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        },
        error => {
          // A full list of error codes is available at
          // https://firebase.google.com/docs/storage/web/handle-errors
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;

            // ...

            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        },
        () => {
          // Upload completed successfully, now we can get the download URL
          this.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            this.Thumbnail = downloadURL;
          });
        }
      );
    }
  }
  onImageLoad() {
    this.uploading = false;
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
  setThumbView() {
    this.ThumbnailView = !this.ThumbnailView;
    console.log(this.ThumbnailView);
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
  publishVideoUrl(id: string) {
    console.log(id);
    if (id != undefined) {
      this.updateVideoUrl(id);
      this.YTid = id;
    } else {
      this.YTid = '';
    }
  }
  updateVideoUrl(id: string) {
    // Appending an ID to a YouTube URL is safe.
    // Always make sure to construct SafeValue objects as
    // close as possible to the input data so
    // that it's easier to check if the value is safe.
    this.YTid = id;
    if (id != undefined) {
       this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/' + id);
    } else {
      this.videoUrl = '';
    }
   
  }
  updateBackground(bkg: string);
  /*makeSanitize(str: any) {
    return this.sanitizer.bypassSecurityTrustHtml(str);
  }*/
  splitAtIndex(value, index) {
    return value.substring(0, index) + ',' + value.substring(index);
  }
}
