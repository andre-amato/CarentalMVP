import { ObjectId } from 'mongodb';
import { DateRange } from '../../shared/domain/DateRange';
import { Season, SeasonDeterminer } from '../../shared/domain/Season';

export interface CarProps {
  id?: string;
  brand: string;
  model: string;
  stock: number;
  peakSeasonPrice: number;
  midSeasonPrice: number;
  offSeasonPrice: number;
}

export class Car {
  private readonly id: string;
  readonly brand: string;
  readonly model: string;
  private stock: number;
  readonly peakSeasonPrice: number;
  readonly midSeasonPrice: number;
  readonly offSeasonPrice: number;

  constructor(props: CarProps) {
    this.id = props.id || new ObjectId().toHexString();
    this.brand = props.brand;
    this.model = props.model;
    this.stock = props.stock;
    this.peakSeasonPrice = props.peakSeasonPrice;
    this.midSeasonPrice = props.midSeasonPrice;
    this.offSeasonPrice = props.offSeasonPrice;
  }

  getId(): string {
    return this.id;
  }

  getStock(): number {
    return this.stock;
  }

  decrementStock(): void {
    if (this.stock <= 0) {
      throw new Error('Cannot decrement stock below zero');
    }
    this.stock--;
  }

  incrementStock(): void {
    this.stock++;
  }

  calculatePriceForDateRange(dateRange: DateRange): {
    totalPrice: number;
    averageDailyPrice: number;
  } {
    const { startDate, endDate } = dateRange;
    let totalPrice = 0;
    let currentDate = new Date(startDate);
    let dayCount = 0;

    while (currentDate <= endDate) {
      const season = SeasonDeterminer.getSeason(currentDate);
      const dailyPrice = this.getPriceForSeason(season);
      totalPrice += dailyPrice;
      dayCount++;

      // Move to the next day
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      currentDate = nextDate;
    }

    const averageDailyPrice = totalPrice / dayCount;

    return {
      totalPrice: Number(totalPrice.toFixed(2)),
      averageDailyPrice: Number(averageDailyPrice.toFixed(2)),
    };
  }

  private getPriceForSeason(season: Season): number {
    switch (season) {
      case Season.PEAK:
        return this.peakSeasonPrice;
      case Season.MID:
        return this.midSeasonPrice;
      case Season.OFF:
        return this.offSeasonPrice;
      default:
        throw new Error('Invalid season');
    }
  }

  isAvailable(): boolean {
    return this.stock > 0;
  }

  getPeakSeasonPrice(): number {
    return this.peakSeasonPrice;
  }

  getMidSeasonPrice(): number {
    return this.midSeasonPrice;
  }

  getOffSeasonPrice(): number {
    return this.offSeasonPrice;
  }
}
