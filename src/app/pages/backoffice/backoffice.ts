import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-backoffice',
  styleUrl: './backoffice.scss',
  templateUrl: './backoffice.html',
})
export class Backoffice {}
