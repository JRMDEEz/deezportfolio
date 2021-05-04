import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { ContactViewComponent } from "./views/contact/contact.component";
import { HomeViewComponent } from "./views/home/home.component";
import { KnowledgeViewComponent } from "./views/knowledge/knowledge.component";
import { ProjectsViewComponent } from "./views/projects/projects.component";
import { NotFoundViewComponent } from "./views/notfound/notfound.component";
import { BrowserModule } from "@angular/platform-browser";
import { PrivacyPolicyViewComponent } from "./views/privacypolicy/privacypolicy.component";
import { ViewComponent } from "./views/view/view.component";
import { AccountViewComponent } from "./views/account/account.component";
import { EditorViewComponent } from "./views/editor/editor.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";

@NgModule({
  declarations: [
    ContactViewComponent,
    HomeViewComponent,
    ProjectsViewComponent,
    NotFoundViewComponent,
    PrivacyPolicyViewComponent,
    KnowledgeViewComponent,
    ViewComponent,
    AccountViewComponent,
    EditorViewComponent
  ],
  imports: [
    BrowserModule,
    BsDropdownModule.forRoot(),
    RouterModule.forRoot([
      { path: "", pathMatch: "full", redirectTo: "home" },
      { path: "home", component: HomeViewComponent },
      { path: "contact", component: ContactViewComponent },
      { path: "projects", component: ProjectsViewComponent },
      { path: "privacypolicy", component: PrivacyPolicyViewComponent },
      { path: "knowledge", component: KnowledgeViewComponent },
      { path: "404", component: NotFoundViewComponent },
      { path: "projects/view", component: ViewComponent },
      { path: "projects/edit", component: EditorViewComponent },
      { path: "account", component: AccountViewComponent },
      { path: "**", redirectTo: "404" }
    ])
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
