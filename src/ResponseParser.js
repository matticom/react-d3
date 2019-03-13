function parsePlayouts(response) {
    const countries = response.playout.aggregations.countries.buckets;
    return parseCountries(countries);
}

function parseIngests(response) {
    const countries = response.ingest.aggregations.countries.buckets;
    return parseCountries(countries);
}

function parseCountries(countries) {
    const parsedCountries = [];
    countries.forEach(country => {
        parsedCountries.push({
            country: country.key,
            count: country.doc_count,
            cities: parseCities(country.cities.buckets)
        });
    });
    return parsedCountries;
}

function parseCities(cities) {
    const parsedCities = [];
    cities.forEach(city => {
        parsedCities.push({
            city: city.key,
            count: city.doc_count
        });
    });
    return parsedCities;
}

export default {
    parsePlayouts,
    parseIngests
}