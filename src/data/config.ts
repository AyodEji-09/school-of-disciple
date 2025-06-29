import axios from "axios";

export const TOKEN = 'STOW_AUTH'

export const SetAuthToken = (token: string) => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        axios.defaults.headers.common["frontend-source"] = "web user";
    } else {
        delete axios.defaults.headers.common["Authorization"];
        delete axios.defaults.headers.common["frontend-source"];
    }
};

export const useURL = import.meta.env.VITE_BASE_URL;
// export const useURL = "http://localhost:8080/api/v1"
// import.meta.env.NODE_ENV === "development"
//   ? "http://localhost:8080"
//   : import.meta.env.VITE_BASE_URL;

export const SetDefaultHeaders = () => {
    axios.defaults.baseURL = useURL;
};
