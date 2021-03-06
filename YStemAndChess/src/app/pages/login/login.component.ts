import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  link = "/";
  private usernameFlag = false;
  private passwordFlag = false;
  loginError = "";

  constructor(private cookie: CookieService) { }

  ngOnInit(): void {
  }

  usernameVerification() {
    var username = (<HTMLInputElement>document.getElementById("username")).value;

    if (username.length > 2) {
      this.usernameFlag = true;
    } else {
      this.usernameFlag = false;
    }
  }

  passwordVerification() {
    var password = (<HTMLInputElement>document.getElementById("password")).value;

    if (password.length < 8) {
      this.passwordFlag = false;
    } else {
      this.passwordFlag = true;
    }
  }

  verifyUser() {
    if (this.usernameFlag == true && this.passwordFlag == true) {
      this.verifyInDataBase();
    } else {
      this.link = "/login";
    }
  }

  verifyInDataBase() {
    var username = (<HTMLInputElement>document.getElementById('username')).value;
    var password = (<HTMLInputElement>document.getElementById('password')).value;
    let url = `${environment.urls.middlewareURL}/?reason=verify&username=${username}&password=${password}`;
    this.httpGetAsync(url, (response) => {
      if (response == "The username or password is incorrect.") {
        //console.log("Don't RedirectMe");
        this.loginError = "Username or Password is incorrect";
      } else {
        this.cookie.set("login", response, 1);
        //console.log("Log. Redirect");
        let payload = JSON.parse(atob(response.split(".")[1]));
        switch (payload["role"]) {
          case "student":
            window.location.pathname = "/student";
            break;
          case "parent":
            window.location.pathname = "/parent";
            break;
          case "mentor":
            window.location.pathname = "";
            break;
          case "admin":
            window.location.pathname = "/admin";
            break;
          default:
            window.location.pathname = "";
        }
      }
      console.log(response);
    })
  }

  private httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
  }

  errorMessages() {
    if (this.passwordFlag == false || this.usernameFlag == false) {
      this.loginError = "Invalid username or password"
    } else {
      this.loginError = "";
    }
  }
}
