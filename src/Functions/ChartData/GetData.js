export const getData = (data) => {
    const counts = new Array(12).fill(0);
    data.forEach((dataObj) => {
        const hoteldate = new Date(dataObj.createdAt);
        const month = hoteldate.getMonth();
        counts[month]++;
    });
    return counts;
};