import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { NgxPermissionsService } from "ngx-permissions";
import { AuthfakeauthenticationService } from "src/app/core/services/authfake.service";

@Component({
  selector: "app-vertical",
  templateUrl: "./vertical.component.html",
  styleUrls: ["./vertical.component.scss"],
})

/**
 * Vertical component
 */
export class VerticalComponent implements OnInit, AfterViewInit {
  isCondensed = false;

  constructor(
    private router: Router,
    private authFackservice: AuthfakeauthenticationService,
    private permissionsService: NgxPermissionsService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        document.body.classList.remove("sidebar-enable");
      }
    });
  }

  ngOnInit() {
    document.body.removeAttribute("data-layout");
    document.body.removeAttribute("data-topbar");
    document.body.removeAttribute("data-layout-size");
    document.body.classList.remove("sidebar-enable");
    document.body.classList.remove("auth-body-bg");
    document.body.classList.remove("vertical-collpsed");
    document.body.removeAttribute("data-sidebar-size");
  }
  cerrarSesion() {
    this.authFackservice.logout();
    this.permissionsService.flushPermissions();
    this.router.navigate(["/account/login"]);
  }
  isMobile() {
    const ua = navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    );
  }

  ngAfterViewInit() {}

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    document.body.classList.toggle("right-bar-enabled");
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    this.isCondensed = !this.isCondensed;
    document.body.classList.toggle("sidebar-enable");
    document.body.classList.toggle("vertical-collpsed");

    if (window.screen.width <= 768) {
      document.body.classList.remove("vertical-collpsed");
    }
  }
}
