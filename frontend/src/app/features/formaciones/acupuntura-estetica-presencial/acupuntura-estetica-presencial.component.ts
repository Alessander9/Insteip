import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-acupuntura-estetica-presencial',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './acupuntura-estetica-presencial.component.html',
  styleUrls: ['./acupuntura-estetica-presencial.component.css']
})
export class AcupunturaEsteticaPresencialComponent implements AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeTab: 't1' | 't2' | 't3' = 't1';
  activeBenefitIndex = 0;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  setTab(tab: 't1' | 't2' | 't3') {
    this.activeTab = tab;
  }

  prevBenefit() {
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }
  nextBenefit() {
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }
  setBenefit(i: number) {
    this.activeBenefitIndex = i;
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    this.animationContext = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTimeline
        .from('.ae-kicker', { opacity: 0, y: -12, duration: 0.45 })
        .from('.ae-title', { opacity: 0, y: 28, duration: 0.8 }, '-=0.2')
        .from('.ae-description, .ae-actions, .ae-proof', { opacity: 0, y: 14, stagger: 0.08, duration: 0.45 }, '-=0.45')
        .from('.ae-hero__visual', { opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.65')
        .from('.ae-fact', { opacity: 0, y: 12, stagger: 0.07, duration: 0.4 }, '-=0.4');

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: 'power3.out'
        });
      });
    }, this.host.nativeElement);

    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
