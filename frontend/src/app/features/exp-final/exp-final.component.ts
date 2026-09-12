import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-exp-final',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exp-final.component.html',
  styleUrls: ['./exp-final.component.css']
})
export class ExpFinalComponent {
  readonly whatsappUrl = 'https://wa.me/51939371250?text=Hola%2C+vengo+de+probar+la+experiencia+EXP+INSTEIP+y+deseo+matricularme+en+un+curso';
}
