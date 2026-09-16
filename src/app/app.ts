import { Component, inject, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './ui/navbar/navbar';
import { ModalService } from './services/modal.service';

@Component({
  imports: [RouterOutlet, Navbar, NgComponentOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('CineApp');
  protected readonly modalService = inject(ModalService);
}
