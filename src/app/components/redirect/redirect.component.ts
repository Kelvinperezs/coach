import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirects',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(
    private router:Router
  ) { }

  ngOnInit(): void {
    this.router.navigate(['/cotizar']);
  }

  
}
