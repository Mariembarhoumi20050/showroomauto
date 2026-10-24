import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faMagnifyingGlass, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Auto } from '../../interfaces/auto';

type SortKey = 'default' | 'priceAsc' | 'priceDesc' | 'powerDesc';

@Component({
  imports: [FontAwesomeModule, FormsModule, DecimalPipe],
  selector: 'app-search-bar',
  styleUrl: './search-bar.css',
  templateUrl: './search-bar.html',
})
export class SearchBar implements OnChanges {
  faMagnifyingGlass = faMagnifyingGlass;
  faHeart = faHeart;
  faRotateLeft = faRotateLeft;

  @Input() autos: Auto[] = [];
  @Output() onSelectCar = new EventEmitter<Auto>();

  selectedAutos: Auto[] = [];

  // Filtres
  brand = '';
  model = '';
  maxPrice: number | null = null;
  sortBy: SortKey = 'default';
  onlyFavorites = false;

  // Favoris (persistés dans le navigateur)
  favoriteIds: number[] = this.loadFavorites();

  ngOnChanges() {
    this.applyFilters();
  }

  applyFilters() {
    const b = this.brand.toLowerCase().trim();
    const m = this.model.toLowerCase().trim();

    const result = this.autos.filter(
      (x) =>
        x.brand.toLowerCase().startsWith(b) &&
        x.model.toLowerCase().includes(m) &&
        (this.maxPrice == null || x.price <= this.maxPrice) &&
        (!this.onlyFavorites || this.isFavorite(x.id))
    );

    switch (this.sortBy) {
      case 'priceAsc':
        result.sort((a, c) => a.price - c.price);
        break;
      case 'priceDesc':
        result.sort((a, c) => c.price - a.price);
        break;
      case 'powerDesc':
        result.sort((a, c) => c.power - a.power);
        break;
    }

    this.selectedAutos = result;
  }

  resetFilters() {
    this.brand = '';
    this.model = '';
    this.maxPrice = null;
    this.sortBy = 'default';
    this.onlyFavorites = false;
    this.applyFilters();
  }

  selectCar(auto: Auto) {
    this.onSelectCar.emit(auto);
  }

  // ----- Favoris -----
  isFavorite(id: number): boolean {
    return this.favoriteIds.includes(id);
  }

  toggleFavorite(id: number) {
    this.favoriteIds = this.isFavorite(id)
      ? this.favoriteIds.filter((x) => x !== id)
      : [...this.favoriteIds, id];
    this.saveFavorites();
    if (this.onlyFavorites) this.applyFilters();
  }

  private loadFavorites(): number[] {
    try {
      return JSON.parse(localStorage.getItem('showroom-favorites') ?? '[]');
    } catch {
      return [];
    }
  }

  private saveFavorites() {
    try {
      localStorage.setItem('showroom-favorites', JSON.stringify(this.favoriteIds));
    } catch {}
  }

  // ----- Affichage du stock -----
  stockLabel(auto: Auto): string {
    if (auto.availability === 0) return 'Out of stock';
    if (auto.availability <= 2) return `Only ${auto.availability} left`;
    return `${auto.availability} units in stock`;
  }
}