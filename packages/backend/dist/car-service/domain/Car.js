import { Season, SeasonDeterminer } from '../../shared/domain/Season';
import { ObjectId } from 'mongodb'; // Add this import
export class Car {
    constructor(props) {
        this.id = props.id || new ObjectId().toHexString();
        this.brand = props.brand;
        this.model = props.model;
        this.stock = props.stock;
        this.peakSeasonPrice = props.peakSeasonPrice;
        this.midSeasonPrice = props.midSeasonPrice;
        this.offSeasonPrice = props.offSeasonPrice;
    }
    getId() {
        return this.id;
    }
    getStock() {
        return this.stock;
    }
    decrementStock() {
        if (this.stock <= 0) {
            throw new Error('Cannot decrement stock below zero');
        }
        this.stock--;
    }
    incrementStock() {
        this.stock++;
    }
    calculatePriceForDateRange(dateRange) {
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
    getPriceForSeason(season) {
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
    isAvailable() {
        return this.stock > 0;
    }
}
