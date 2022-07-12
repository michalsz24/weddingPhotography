export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";
export type DiscountType = "Single" | "Double";

export class Service {
    type!: ServiceType;
    year!: ServiceYear;
    price!: number;
    mainServices!: ServiceType[]
}
export class Discount {
    type!: ServiceType;
    year!: ServiceYear;
    price!: number;
    discountWithService!: ServiceType;
    discountType!: DiscountType;
}
export class ServiceWithFinalPrice {
    type!: ServiceType;
    finalPrice!: number;
}

export const servicesData: Service[] = [
    {type: "Photography", year: 2020, price: 1700, mainServices: []}, 
    {type: "Photography", year: 2021, price: 1800, mainServices: []}, 
    {type: "Photography", year: 2022, price: 1900, mainServices: []},
    {type: "VideoRecording", year: 2020, price: 1700, mainServices: []}, 
    {type: "VideoRecording", year: 2021, price: 1800, mainServices: []}, 
    {type: "VideoRecording", year: 2022, price: 1900, mainServices: []},
    {type: "BlurayPackage", year: 2020, price: 300, mainServices: ["VideoRecording"]}, 
    {type: "BlurayPackage", year: 2021, price: 300, mainServices: ["VideoRecording"]}, 
    {type: "BlurayPackage", year: 2022, price: 300, mainServices: ["VideoRecording"]},
    {type: "TwoDayEvent", year: 2020, price: 400, mainServices: ["Photography", "VideoRecording"]}, 
    {type: "TwoDayEvent", year: 2021, price: 400, mainServices: ["Photography", "VideoRecording"]}, 
    {type: "TwoDayEvent", year: 2022, price: 400, mainServices: ["Photography", "VideoRecording"]},
    {type: "WeddingSession", year: 2020, price: 600, mainServices: []}, 
    {type: "WeddingSession", year: 2021, price: 600, mainServices: []}, 
    {type: "WeddingSession", year: 2022, price: 600, mainServices: []}
]
export const discountsData: Discount[] = [
    {type: "Photography", year: 2020, price: 2200, discountWithService: "VideoRecording", discountType: "Double"},
    {type: "Photography", year: 2021, price: 2300, discountWithService: "VideoRecording", discountType: "Double"},
    {type: "Photography", year: 2022, price: 2500, discountWithService: "VideoRecording", discountType: "Double"},
    {type: "WeddingSession", year: 2020, price: 300, discountWithService: "Photography", discountType: "Single"},
    {type: "WeddingSession", year: 2021, price: 300, discountWithService: "Photography", discountType: "Single"},
    {type: "WeddingSession", year: 2022, price: 0, discountWithService: "Photography", discountType: "Single"},
    {type: "WeddingSession", year: 2020, price: 300, discountWithService: "VideoRecording", discountType: "Single"},
    {type: "WeddingSession", year: 2021, price: 300, discountWithService: "VideoRecording", discountType: "Single"},
    {type: "WeddingSession", year: 2022, price: 300, discountWithService: "VideoRecording", discountType: "Single"},
]

// export const updateSelectedServices = (
//     previouslySelectedServices: ServiceType[],
//     action: { type: "Select" | "Deselect"; service: ServiceType }
// ) => [];

// export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => ({ basePrice: 0, finalPrice: 0 });

export const updateSelectedServices = (previouslySelectedServices: ServiceType[], action: { type: "Select" | "Deselect"; service: ServiceType }) => {
    let newSelectedServices = previouslySelectedServices;
    switch(action.type) {
        case "Select":
            if (checkIfAlreadySelected(previouslySelectedServices, action.service) && checkIfMainServiceIsSelected(previouslySelectedServices, action.service)) 
            {
                newSelectedServices.push(action.service);
            }
            break;
        case "Deselect":
            newSelectedServices = deselect(previouslySelectedServices, action.service)
            break;
    }
    return newSelectedServices;
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    if (selectedServices.length == 0) {
        return { basePrice: 0, finalPrice: 0 }
    }

    let basePrice = calculateBasePrice(selectedServices, selectedYear);
    let finalPrice = calculateFinalPrice(getServicesWithDiscount(selectedServices, selectedYear));

    return { basePrice: basePrice, finalPrice: finalPrice }
};

const getFullService = (service: ServiceType, year: number = 0) => {
    if (year == 0)
        return servicesData.find(s => s.type == service);
    else    
        return servicesData.find(s => s.type == service && s.year == year);
}

const checkIfAlreadySelected = (previouslySelectedServices: ServiceType[], service: ServiceType) => {
    return !previouslySelectedServices.includes(service)
}

const checkIfMainServiceIsSelected = (previouslySelectedServices: ServiceType[], selectedService : ServiceType) => {
    const service = getFullService(selectedService);
    if (service?.mainServices.length == 0) {
        return true;
    }
    const results = previouslySelectedServices.filter(pss => {
        return service?.mainServices.includes(pss);
    })
    return results.length > 0;
}

const deselect = (previouslySelectedServices: ServiceType[], deselectedService: ServiceType) => {
    let newSelectedServices = previouslySelectedServices;
    newSelectedServices = previouslySelectedServices.filter((s) => { return s != deselectedService });      
    
    if (newSelectedServices.length > 0) {      
        newSelectedServices = newSelectedServices.filter((s) => { return checkIfMainServiceIsSelected(newSelectedServices,s) })       
    }

    return newSelectedServices;
}

const calculateBasePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    let price = 0
    const services = selectedServices.map(s => { return getFullService(s, selectedYear) }).filter(s => { return s?.year == selectedYear});
    services.forEach((s) => {
        if (checkIfMainServiceIsSelected(selectedServices, s?.type)) {
            price += s?.price ?? 0;
        }       
    })
    return price;
}

const calculateFinalPrice = (selectedServices: ServiceWithFinalPrice[]) => {
    let price = 0
    const selectedServicesTypes = selectedServices.map(x => {return x.type});
    selectedServices.forEach((s) => {
        if (checkIfMainServiceIsSelected(selectedServicesTypes, s.type)) {
            price += s.finalPrice;
        }       
    })
    return price;
}

const getServicesWithDiscount = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    const discounts = discountsData.filter(x => {return x.year == selectedYear});
    let serviceWithZeroPrice: ServiceType[] = [];

    const servicesWithFinalPrice: ServiceWithFinalPrice[] = selectedServices.map(selectedService => {
        const discountForService = discounts.filter(d => { return d.type == selectedService && selectedServices.includes(d.discountWithService)})
        let type = "";
        let finalPrice = 0;
        if (discountForService.length > 0) {
            discountForService.sort((a, b) => (b.price < a.price ? 1 : b.price > a.price ? -1 : 0))
            const discount = discountForService[0];
            if (discount.discountType == "Single") {
                type = selectedService;
                finalPrice = discount.price
            } 
            else if (discount.discountType == "Double") {
                serviceWithZeroPrice.push(discount.discountWithService);              
                type = selectedService;
                finalPrice = discount.price
            }
        }
        else if (discountForService.length == 1) {
            const discount = discountForService[0];
            if (discount.discountType == "Single") {
                type = selectedService;
                finalPrice = discount.price
            } 
            else if (discount.discountType == "Double") {
                type = selectedService;
                finalPrice = discount.price
            }
        }
        else {
            type = selectedService;
            finalPrice = getFullService(selectedService, selectedYear)?.price ?? 0
        }

        return {type: type, finalPrice: finalPrice} as ServiceWithFinalPrice;
    })

    servicesWithFinalPrice.forEach(x => {
        if (serviceWithZeroPrice.includes(x.type as ServiceType)) {
            x.finalPrice = 0;
        }
    });

    return servicesWithFinalPrice;   
}