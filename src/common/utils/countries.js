import axios from "axios";

export const getCounryCode = async (ip) => {
  const countryData = await axios.get(`https://ipapi.co/${ip}/json/`);
  return countryData.data.country_code;
};
