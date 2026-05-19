import { apiRequest } from "../../utils/apiRequest";

export class PriceListService {

    async get() {
        return apiRequest('/price-lists', {
            method: "GET"
        });
    }

}